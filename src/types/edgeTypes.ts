import DataIncomingEdge from "../components/canvas/activities-diagram/DataIncomingEdge";
import DataOutgoingEdge from "../components/canvas/activities-diagram/DataOutgoingEdge";
import { LabeledEdge } from "../components/canvas/LabeledEdge";


export const edgeTypes = {
  'labeledEdge': LabeledEdge,
  'dataIncomingEdge': DataIncomingEdge,
  'dataOutgoingEdge': DataOutgoingEdge
};