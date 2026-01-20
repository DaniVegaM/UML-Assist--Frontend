import AcceptEvent from "../components/canvas/activities-diagram/AcceptEvent";
import AcceptTimeEvent from "../components/canvas/activities-diagram/AcceptTimeEvent";
import CallOperation from "../components/canvas/activities-diagram/CallOperation";
import DecisionControl from "../components/canvas/activities-diagram/DecisionControl";
import FinalFlowNode from "../components/canvas/activities-diagram/FinalFlowNode";
import FinalNode from "../components/canvas/activities-diagram/FinalNode";
import InitialNode from "../components/canvas/activities-diagram/InitialNode";
import SendSignal from "../components/canvas/activities-diagram/SendSignal";
import SimpleAction from "../components/canvas/activities-diagram/SimpleAction";
import DataNode from "../components/canvas/activities-diagram/DataNode";
import ObjectNode from "../components/canvas/activities-diagram/ObjectNode";
import MergeNode from "../components/canvas/activities-diagram/MergeNode";
import ParallelizationNode from "../components/canvas/activities-diagram/ParallelizationNode";
import ConnectorNode from "../components/canvas/activities-diagram/ConnectorNode";
import CallBehaviorNode from "../components/canvas/activities-diagram/CallBehaviorNode";
import Activity from "../components/canvas/activities-diagram/Activity";
import ExceptionHandling from "../components/canvas/activities-diagram/ExceptionHandling";
import LifeLine from "../components/canvas/sequence-diagram/LifeLine";
import AddLifeLineButton from "../components/canvas/sequence-diagram/AddLifeLineButton";
import AltFragmentNode from "../components/canvas/sequence-diagram/AltFragmentNode";
import OptFragmentNode from "../components/canvas/sequence-diagram/OptFragmentNode";
import LoopFragmentNode from "../components/canvas/sequence-diagram/LoopFragmentNode";
import BreakFragmentNode from "../components/canvas/sequence-diagram/BreakFragmentNode";
import SeqFragmentNode from "../components/canvas/sequence-diagram/SeqFragmentNode";
import StrictFragmentNode from "../components/canvas/sequence-diagram/StrictFragmentNode";
import ParFragmentNode from "../components/canvas/sequence-diagram/ParFragmentNode";

export const activitiesNodeTypes = {
  activity: Activity,
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
  decisionControl: DecisionControl,
  mergeNode: MergeNode,
  parallelizationNode: ParallelizationNode,
  connectorNode: ConnectorNode,
  callBehavior: CallBehaviorNode,
  exceptionHandling: ExceptionHandling,
};

export const sequenceNodeTypes = {
  lifeLine: LifeLine,
  addLifeLineBtn: AddLifeLineButton,
  altFragment: AltFragmentNode,
  optFragment: OptFragmentNode,
  loopFragment: LoopFragmentNode,
  breakFragment: BreakFragmentNode,
  seqFragment: SeqFragmentNode,
  strictFragment: StrictFragmentNode,
  parFragment: ParFragmentNode,
};