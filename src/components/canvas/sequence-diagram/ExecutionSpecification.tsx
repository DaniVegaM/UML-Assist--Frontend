
interface ExecutionSpecificationProps {
    nodeId: string;
}

export default function ExecutionSpecification({nodeId}: ExecutionSpecificationProps) {
  return (
    <div className="bg-purple-800 w-40 h-40">ExecutionSpecification with id: {nodeId}</div>
  )
}
