import "react-contexify/dist/ReactContexify.css";
import { useSequenceDiagram } from "../../../../hooks/useSequenceDiagram";

interface ChangeHandleTypeProps {
    id: string;
    onClose: () => void;
    lifeLineId: string;
    handleId: string | null;
}

export default function ChangeHandleType({ onClose, handleId, lifeLineId }: ChangeHandleTypeProps) {

    const { setNodes } = useSequenceDiagram();

    const handleItemClick = (action: string) => {
        setNodes(prev => {
            return prev.map(node => {
                if (node.id === lifeLineId) {
                    const updatedHandles = node.data.orderedHandles?.map(handle => {
                        if (handle.id === handleId) {
                            return {
                                ...handle,
                                id: action === 'default' ? `defaultHandle_${handle.id.split('_').slice(1).join('_')}`
                                    :
                                    `destroyHandle_${handle.id.split('_').slice(1).join('_')}`
                            };
                        } else{
                            return handle;
                        }
                    });

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            orderedHandles: updatedHandles
                        }
                    }
                }
                else {
                    return node;
                }
            });
        })
        //NOTA: En este caso no necesitamos colocar el updateNodeInternals porque igual
        //eso ya ese hace en el useEffect del LifeLine que escucha los cambios en los nodos.
        onClose();
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-sky-600 dark:border-neutral-700 min-w-[200px] overflow-hidden">
            <div
                onClick={() => handleItemClick('default')}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="rounded-full bg-neutral-400 dark:bg-neutral-300 w-6 h-6"></div>
                <p>Handle predeterminado</p>
            </div>
            <div className="border-b border-sky-600 dark:border-neutral-700"></div>
            <div
                onClick={() => handleItemClick('destroy')}
                className="flex items-center gap-3 px-4 py-2 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer text-sm dark:text-white"
            >
                <div className="rounded-full w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
                <p>Evento de destrucción</p>
            </div>
        </div>
    )
}