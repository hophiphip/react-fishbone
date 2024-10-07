import type { NodeTypes } from "@xyflow/react";
import ConnectorNode from "./connector";
import FishboneNode from "./node";

export enum FishboneNodeTypes {
	RootNode = "root-node",
	TailNode = "tail-node",
	ConnectorNode = "connector-node",
	FishboneNode = "fishbone-node",
}

export const fishboneNodeTypes: NodeTypes = {
	[FishboneNodeTypes.ConnectorNode]: ConnectorNode,
	[FishboneNodeTypes.FishboneNode]: FishboneNode,
};
