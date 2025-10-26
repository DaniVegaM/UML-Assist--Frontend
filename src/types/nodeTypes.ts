import AcceptEvent from "../components/canvas/activities-diagram/AcceptEvent";
import AcceptTimeEvent from "../components/canvas/activities-diagram/AcceptTimeEvent";
import CallOperation from "../components/canvas/activities-diagram/CallOperation";
import FinalNode from "../components/canvas/activities-diagram/FinalNode";
import InitialNode from "../components/canvas/activities-diagram/InitialNode";
import SendSignal from "../components/canvas/activities-diagram/SendSignal";
import SimpleAction from "../components/canvas/activities-diagram/SimpleAction";

export const activitiesNodeTypes = {
  simpleAction: SimpleAction,
  acceptEvent: AcceptEvent,
  acceptTimeEvent: AcceptTimeEvent,
  sendSignal: SendSignal,
  callOperation : CallOperation,
  initialNode: InitialNode,
  finalNode: FinalNode,
};