import { memo } from "react";

import { BaseEdge, type GetStraightPathParams, getStraightPath } from "@xyflow/react";

/**
 * NOTE: Seems xyflow already has straight edge implementation: https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/StraightEdge.tsx
 * Might remove this component later.
 */
function StraightEdgeBase({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
}: { id: string | undefined } & GetStraightPathParams) {
	const [edgePath] = getStraightPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return <BaseEdge id={id} path={edgePath} />;
}

const StraightEdge = memo(StraightEdgeBase);
export default StraightEdge;
