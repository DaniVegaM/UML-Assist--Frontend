import type { Node, Edge } from "@xyflow/react";


const diagramToLI = (diagramData: {
    title: string;
    diagramType: string;
    nodes: Node[];
    edges: Edge[];
}) => {
    /*
    Algunas consideraciones:
    - Redondeamos las posiciones de los nodos a enteros para evitar que la IA se confunda con decimales.
    - Si un nodo no tiene activityId, se guarda como 'null' en el LI para ser explicito.
    - El texto que contiene un nodo así como sus delimitadores (partitions, clase, operacion, nombre, etc.) se deberá almacenar en node.data.content.
    */
    const nodesBody = [
        `nodes[${diagramData.nodes.length}]{id, position, data, activityId}`,
        diagramData.nodes.map(node => {
            return `${node.id}, (${Math.round(node.position.x)}, ${Math.round(node.position.y)}), ${node.data.content || null}, ${node.data.activityId || 'null'}`;
        }).join('\n')
    ].join('\n');

    const connectionsBody = [
        `connections[${diagramData.edges.length}]{sourceId, targetId, guard}`,
        diagramData.edges.map(edge => {
            return `${edge.source}, ${edge.target}, ${edge.label || 'null'}`;
        }).join('\n')
    ].join('\n');

    return `${diagramData.diagramType}_${diagramData.title}\n${nodesBody}\n${connectionsBody}`;
}

const liToDiagram = (li: string) => {
    //Aquí debemos limpiar la string para evitar que la IA meta texto adicional
    //Luego parseamos la string para obtener el diagrama, lo hacemos con regex
    
    //Ejemplo de LI:
    /*
    activitiesD_Diagrama sin título
    nodes[4]{id, position, data, activityId}
    simpleAction_0, (217, 85), null, null
    simpleAction_1, (542, 221), null, null
    initialNode_0, (296, -71), null, null
    finalNode_0, (940, 228), null, null
    connections[3]{sourceId, targetId, guard}
    simpleAction_0, simpleAction_1, null
    initialNode_0, simpleAction_0, null
    simpleAction_1, finalNode_0, null
    */
}

export {
    diagramToLI
}