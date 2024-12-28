import type { ReactFlowProps, Edge as XyFlowEdge, Node as XyFlowNode } from "@xyflow/react";
import type { ReactNode } from "react";
import type { alteratingFishboneLayout } from "./layout";

export type FishboneNode = {
	label?: ReactNode;
	children?: FishboneNode[];
};

export type MinMax = {
	minX: number;
	maxY: number;
};

export type NodeData = {
	index: number;
	depth: number;
	label: FishboneNode["label"];
	offsetFromParent: number;
	isTop: boolean | undefined;
};

export type ConnectorNodeData = {
	parentNodeId: string;
	fromId: string;
};

export type Node = XyFlowNode<NodeData>;
export type Connector = XyFlowNode<ConnectorNodeData>;
export type Edge = XyFlowEdge<Node>;

type LayoutFunction = typeof alteratingFishboneLayout;

export type FishboneProps = {
	items: FishboneNode;
	layout?: LayoutFunction;
	reactFlowProps?: Omit<
		ReactFlowProps<Node | Connector, Edge>,
		"fitView" | "nodes" | "edges" | "onNodesChange" | "onEdgesChange"
>
};
