import DataIncomingEdge from "../components/canvas/activities-diagram/DataIncomingEdge";
import DataOutgoingEdge from "../components/canvas/activities-diagram/DataOutgoingEdge";
import ExceptionHandlingEdge from "../components/canvas/activities-diagram/ExceptionHandlingEdge";
import { LabeledEdge } from "../components/canvas/LabeledEdge";


export const edgeTypes = {
  'labeledEdge': LabeledEdge,
  'dataIncomingEdge': DataIncomingEdge,
  'dataOutgoingEdge': DataOutgoingEdge,
  'exceptionHandlingEdge': ExceptionHandlingEdge,
};