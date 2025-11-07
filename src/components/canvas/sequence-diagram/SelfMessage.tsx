
interface SelfMessageProps {
    nodeId: string;
}

export default function SelfMessage({nodeId}: SelfMessageProps) {
  return (
    <div className="bg-purple-800 w-40 h-40">SelfMessage with id: {nodeId}</div>
  )
}
