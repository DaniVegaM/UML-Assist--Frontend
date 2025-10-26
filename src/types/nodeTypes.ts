import AcceptEvent from "../components/canvas/activities-diagram/AcceptEvent";
import AcceptTimeEvent from "../components/canvas/activities-diagram/AcceptTimeEvent";
import SendSignal from "../components/canvas/activities-diagram/SendSignal";
import SimpleAction from "../components/canvas/activities-diagram/SimpleAction";

export const activitiesNodeTypes = {
  simpleAction: SimpleAction,
  acceptEvent: AcceptEvent,
  acceptTimeEvent: AcceptTimeEvent,
  sendSignal: SendSignal,
};