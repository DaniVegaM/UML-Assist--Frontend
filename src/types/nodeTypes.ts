import AcceptEvent from "../components/canvas/activities-diagram/AcceptEvent";
import AcceptTimeEvent from "../components/canvas/activities-diagram/AcceptTimeEvent";
import CallOperation from "../components/canvas/activities-diagram/CallOperation";
import FinalFlowNode from "../components/canvas/activities-diagram/FinalFlowNode";
import FinalNode from "../components/canvas/activities-diagram/FinalNode";
import InitialNode from "../components/canvas/activities-diagram/InitialNode";
import SendSignal from "../components/canvas/activities-diagram/SendSignal";
import SimpleAction from "../components/canvas/activities-diagram/SimpleAction";
import DataNode from "../components/canvas/activities-diagram/DataNode";
import ObjectNode from "../components/canvas/activities-diagram/ObjectNode";

export const activitiesNodeTypes = {
  simpleAction: SimpleAction,
  dataNode: DataNode,
  objectNode: ObjectNode,
  acceptEvent: AcceptEvent,
  acceptTimeEvent: AcceptTimeEvent,
  sendSignal: SendSignal,
  callOperation : CallOperation,
  initialNode: InitialNode,
  finalNode: FinalNode,
  finalFlowNode: FinalFlowNode,
};