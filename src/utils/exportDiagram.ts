import { toPng } from 'html-to-image';
import { getNodesBounds, type Edge, type Node } from '@xyflow/react';
import jsPDF from 'jspdf';

const EXPORT_PADDING = 60;
const EXPORTING_CLASS = 'is-exporting';
const PX_TO_PT = 0.75;
const PDF_PIXEL_RATIO = 2.5;
const PNG_PIXEL_RATIO = 3;

// Tipos de nodos que son UI auxiliar y no deben aparecer en la exportación
// ni influir en el cálculo del bounding box.
const NON_EXPORTABLE_NODE_TYPES = new Set(['addLifeLineBtn']);

type ExportableNode = Node;
type ExportableEdge = Edge;

interface BoundingBoxResult {
    viewport: HTMLElement;
    width: number;
    height: number;
    transform: string;
}

const sanitizeFileName = (name: string) => {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return 'diagrama';
    return trimmed.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'diagrama';
};

/**
 * Algunos nodos (como las LifeLines de los diagramas de secuencia) renderizan
 * contenido absolutamente posicionado fuera de su rectángulo medido — por
 * ejemplo la línea punteada de destrucción. `getNodesBounds` no lo contempla,
 * así que medimos el DOM real e inflamos el bbox hacia abajo para incluirlo.
 */
const inflateBoundsForOverflow = (
    bounds: { x: number; y: number; width: number; height: number },
    nodes: ExportableNode[],
    viewport: HTMLElement
): { x: number; y: number; width: number; height: number } => {
    const vpRect = viewport.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(viewport).transform);
    const scale = matrix.a || 1;

    let maxBottom = bounds.y + bounds.height;
    let maxRight = bounds.x + bounds.width;

    for (const node of nodes) {
        if (node.type !== 'lifeLine') continue;
        const nodeEl = document.querySelector(`.react-flow__node[data-id="${node.id}"]`);
        if (!nodeEl) continue;

        let elMaxBottom = -Infinity;
        let elMaxRight = -Infinity;
        const descendants = nodeEl.querySelectorAll('*');
        for (const desc of descendants) {
            const r = (desc as HTMLElement).getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            if (r.bottom > elMaxBottom) elMaxBottom = r.bottom;
            if (r.right > elMaxRight) elMaxRight = r.right;
        }
        if (elMaxBottom !== -Infinity) {
            const flowBottom = (elMaxBottom - vpRect.top) / scale;
            if (flowBottom > maxBottom) maxBottom = flowBottom;
        }
        if (elMaxRight !== -Infinity) {
            const flowRight = (elMaxRight - vpRect.left) / scale;
            if (flowRight > maxRight) maxRight = flowRight;
        }
    }

    return {
        x: bounds.x,
        y: bounds.y,
        width: maxRight - bounds.x,
        height: maxBottom - bounds.y,
    };
};

const prepareViewport = (nodes: ExportableNode[]): BoundingBoxResult | null => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewport) return null;

    const visibleNodes = nodes.filter((n) => !NON_EXPORTABLE_NODE_TYPES.has(n.type ?? ''));
    if (visibleNodes.length === 0) return null;

    const rawBounds = getNodesBounds(visibleNodes);
    const bounds = inflateBoundsForOverflow(rawBounds, visibleNodes, viewport);

    const width = Math.max(1, Math.ceil(bounds.width + EXPORT_PADDING * 2));
    const height = Math.max(1, Math.ceil(bounds.height + EXPORT_PADDING * 2));
    const translateX = -bounds.x + EXPORT_PADDING;
    const translateY = -bounds.y + EXPORT_PADDING;
    const transform = `translate(${translateX}px, ${translateY}px) scale(1)`;

    return { viewport, width, height, transform };
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const withExportingMode = async <T>(task: () => Promise<T>): Promise<T> => {
    document.body.classList.add(EXPORTING_CLASS);
    try {
        // Dos RAF para garantizar que el navegador aplique CSS y haga reflow
        // antes de capturar (de lo contrario, la UI puede aparecer en la imagen).
        await nextFrame();
        await nextFrame();
        return await task();
    } finally {
        document.body.classList.remove(EXPORTING_CLASS);
    }
};

const triggerDownload = (href: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const captureDiagram = async (
    prepared: BoundingBoxResult,
    pixelRatio: number
): Promise<string> => {
    const { viewport, width, height, transform } = prepared;
    return toPng(viewport, {
        backgroundColor: '#ffffff',
        width,
        height,
        pixelRatio,
        cacheBust: true,
        style: {
            width: `${width}px`,
            height: `${height}px`,
            transform,
            transformOrigin: '0 0',
        },
    });
};

export const exportDiagramAsPng = async (
    nodes: ExportableNode[],
    _edges: ExportableEdge[],
    title: string
): Promise<void> => {
    const fileName = `${sanitizeFileName(title)}.png`;

    await withExportingMode(async () => {
        const prepared = prepareViewport(nodes);
        if (!prepared) return;

        const dataUrl = await captureDiagram(prepared, PNG_PIXEL_RATIO);
        triggerDownload(dataUrl, fileName);
    });
};

export const exportDiagramAsPdf = async (
    nodes: ExportableNode[],
    _edges: ExportableEdge[],
    title: string
): Promise<void> => {
    const fileName = `${sanitizeFileName(title)}.pdf`;

    await withExportingMode(async () => {
        const prepared = prepareViewport(nodes);
        if (!prepared) return;

        const { width, height } = prepared;
        const dataUrl = await captureDiagram(prepared, PDF_PIXEL_RATIO);

        const widthPt = width * PX_TO_PT;
        const heightPt = height * PX_TO_PT;

        const pdf = new jsPDF({
            orientation: widthPt >= heightPt ? 'landscape' : 'portrait',
            unit: 'pt',
            format: [widthPt, heightPt],
            compress: true,
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, widthPt, heightPt, undefined, 'FAST');
        pdf.save(fileName);
    });
};
