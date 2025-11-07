
interface DestructionEventProps {
    nodeId: string;
}

export default function DestructionEvent({nodeId}: DestructionEventProps) {
  return (
    <div className="bg-purple-800 w-40 h-40">DestructionEvent with id: {nodeId}</div>
  )
}
