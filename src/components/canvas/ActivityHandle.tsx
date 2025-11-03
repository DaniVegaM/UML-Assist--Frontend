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
                className={`${showDeleteBtn ? 'opacity-100' : 'opacity-0'} absolute -top-2 right-2 cursor-pointer w-[15px] h-[15px] bg-red-400 rounded-full`}
                onClick={deleteThisHandle}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" className="size-6 w-full h-full">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
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