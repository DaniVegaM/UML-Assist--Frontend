import DataIncomingEdge from "../components/canvas/activities-diagram/DataIncomingEdge";
import DataOutgoingEdge from "../components/canvas/activities-diagram/DataOutgoingEdge";
import ExceptionHandlingEdge from "../components/canvas/activities-diagram/ExceptionHandlingEdge";
import { LabeledEdge } from "../components/canvas/LabeledEdge";
import { MessageEdge } from "../components/canvas/MessageEdge";
import { SelfMessageEdge } from "../components/canvas/SelfMessageEdge";
import { LostMessageEdge } from "../components/canvas/LostMessageEdge";
import { FoundMessageEdge } from "../components/canvas/FoundMessageEdge";
import { CreateLifeLineEdge } from "../components/canvas/CreateLifeLineEdge";
import { NoteEdge } from "../components/canvas/NoteEdge";


export const edgeTypes = {
  'labeledEdge': LabeledEdge,
  'messageEdge': MessageEdge,
  'selfMessageEdge': SelfMessageEdge,
  'lostMessageEdge': LostMessageEdge,
  'foundMessageEdge': FoundMessageEdge,
  'createLifeLineEdge': CreateLifeLineEdge,
  'dataIncomingEdge': DataIncomingEdge,
  'dataOutgoingEdge': DataOutgoingEdge,
  'exceptionHandlingEdge': ExceptionHandlingEdge,
  'noteEdge': NoteEdge,
};