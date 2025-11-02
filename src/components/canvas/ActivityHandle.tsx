import { Handle, Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import type { ActivityHandleProps } from "../../types/canvas";
import { useState } from "react";

export default function ActivityHandle({ id, position, setSourceHandle, setTargetHandle }: ActivityHandleProps) {
    const nodeId = useNodeId();
    const [showDeleteBtn, setShowDeleteBtn] = useState(false);
    const updateNodeInternals = useUpdateNodeInternals();


    const deleteThisHandle = () => {
        console.log("Deleting handle with id:", id);

        if (setSourceHandle) {
            setSourceHandle(prev => {
                if (prev) {
                    return prev.filter(handleId => handleId !== id);
                } else {
                    return null;
                }
            })
        }
        if (setTargetHandle) {
            setTargetHandle(prev => {
                if (prev) {
                    return prev.filter(handleId => handleId !== id);
                } else {
                    return null;
                }
            })
        }
        updateNodeInternals(nodeId!);
    }

    return (
        <div
            onMouseEnter={() => setShowDeleteBtn(true)}
            onMouseLeave={() => setShowDeleteBtn(false)}
            className="relative"
        >
            <button
                className={`${showDeleteBtn ? 'opacity-100' : 'opacity-0'} absolute -top-4 cursor-pointer w-[20px] h-[20px]`}
                onClick={deleteThisHandle}
            >
                <svg className='w-full h-full' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                </svg>
            </button>
            
            <Handle
                id={`${nodeId}_Handle-${id}`}
                type={'source'}
                position={position ? position : Position.Top}
                className='!relative !w-9 !h-7 !my-[24px] z-40'
                style={{
                    borderRadius: 'inherit',
                    backgroundColor: 'white',
                    border: 'solid 2px #71717B',
                }}
            />
        </div>
    )
}