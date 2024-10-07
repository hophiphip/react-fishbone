import type { EdgeTypes } from "@xyflow/react";
import StraightEdge from "./straight";

export enum FishboneEdgeTypes {
	StraightEdge = "straight-edge",
}

export const fishboneEdgeTypes: EdgeTypes = {
	[FishboneEdgeTypes.StraightEdge]: StraightEdge,
};
