import DataIncomingEdge from "../components/canvas/activities-diagram/DataIncomingEdge";
import DataOutgoingEdge from "../components/canvas/activities-diagram/DataOutgoingEdge";
import ExceptionHandlingEdge from "../components/canvas/activities-diagram/ExceptionHandlingEdge";
import { LabeledEdge } from "../components/canvas/LabeledEdge";
import { MessageEdge } from "../components/canvas/MessageEdge";
import { SelfMessageEdge } from "../components/canvas/SelfMessageEdge";


export const edgeTypes = {
  'labeledEdge': LabeledEdge,
  'messageEdge': MessageEdge,
  'selfMessageEdge': SelfMessageEdge,
  'dataIncomingEdge': DataIncomingEdge,
  'dataOutgoingEdge': DataOutgoingEdge,
  'exceptionHandlingEdge': ExceptionHandlingEdge,
};