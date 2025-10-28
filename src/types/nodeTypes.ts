import SimpleAction from "../components/canvas/activities-diagram/SimpleAction";
import DataNode from "../components/canvas/activities-diagram/DataNode";
import ObjectNode from "../components/canvas/activities-diagram/ObjectNode";

export const activitiesNodeTypes = {
  simpleAction: SimpleAction,
  data: DataNode,
  object: ObjectNode,
};