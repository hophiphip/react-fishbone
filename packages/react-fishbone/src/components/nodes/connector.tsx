import {
	Handle,
	Position,
	type ReactFlowStore,
	applyNodeChanges,
	useInternalNode,
	useNodesInitialized,
	useReactFlow,
	useStore,
} from "@xyflow/react";

import { 
	type CSSProperties, 
	memo, 
	useCallback, 
	useEffect, 
	useRef 
} from "react";

import {
	connectorSize,
	getIsHorizontal,
	nodeHeight,
	nodeWidth,
	nodesAngle,
	rootId,
} from "../../const";

import { useIsFishboneDebug } from "../../contexts/fishbone-debug";

import type { ConnectorNodeData, Node } from "../../types";

/** ----------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function getPartitionPoint({
	sourceX,
	sourceY,
	targetX,
	targetY,
	part,
}: {
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	part: number;
}) {
	const xOffset = Math.abs(targetX - sourceX) * part;
	const partX =
		targetX < sourceX
			? clamp(targetX + xOffset, targetX, sourceX)
			: clamp(targetX - xOffset, sourceX, targetX);

	const yOffset = Math.abs(targetY - sourceY) * part;
	const partY =
		targetY < sourceY
			? clamp(targetY + yOffset, targetY, sourceY)
			: clamp(targetY - yOffset, sourceY, targetY);

	return [partX, partY, xOffset, yOffset];
}

/** ----------------------------------------------------------------------------- */

const ConnectorDebugInfo = ({
	connectorCenterX,
	connectorCenterY,
	isHorizontal,
	id,
}: {
	connectorCenterY: number;
	connectorCenterX: number;
	isHorizontal: boolean | undefined;
	id: string;
}) => {
	const internalNode = useInternalNode(id);

	return (
		<span
			style={{
				fontSize: 6,
				position: "absolute",
				left: isHorizontal ? connectorSize + 1 : undefined,
				bottom: isHorizontal ? undefined : connectorSize + 1,
				whiteSpace: "nowrap",
				display: "block",
			}}
		>
			({connectorCenterX}, {connectorCenterY}) / ({internalNode?.internals.positionAbsolute.x}, {internalNode?.internals.positionAbsolute.y})
		</span>
	);
};

/** ----------------------------------------------------------------------------- */

const connectorContainerStyle: CSSProperties = {
	width: connectorSize,
	height: connectorSize,
	borderRadius: "100%",
	boxSizing: "border-box",
	position: "relative",
};

function ConnectorNodeBase({
	id,
	data,
	isConnectable,
}: {
	id: string;
	data: ConnectorNodeData;
	isConnectable: boolean | undefined;
}) {
	const { fromId, parentNodeId } = data;
	const { setNodes } = useReactFlow();
	const areNodesInitialized = useNodesInitialized();

	const isFishboneDebug = useIsFishboneDebug();

	const initialFromNodeOffset = useRef<number | undefined>();

	const [connectorCenterX, connectorCenterY, isHorizontal, isTop] = useStore(
		useCallback(
			(store: ReactFlowStore): [number, number, boolean, boolean | undefined] => {
				const parentNode = store.nodeLookup.get(parentNodeId) as Node | undefined;
				if (!parentNode) {
					return [0, 0, false, false];
				}

				const isRoot = parentNodeId === rootId;

				const parentConnectionKey = isRoot
					? `${parentNodeId}-target-null`
					: `${parentNodeId}-source-null`;

				const parentConnections = store.connectionLookup.get(parentConnectionKey);
				if (!parentConnections) {
					return [0, 0, false, false];
				}

				const parentConnectionsIterator = parentConnections.values().next();
				const firstParentConnection = parentConnectionsIterator.done
					? undefined
					: parentConnectionsIterator.value;
				if (!firstParentConnection) {
					return [0, 0, false, false];
				}

				const edgeId = firstParentConnection.edgeId;
				const edge = store.edgeLookup.get(edgeId);

				if (!edge) return [0, 0, false, false];

				const fromNode = store.nodeLookup.get(fromId) as Node | undefined;
				const edgeSourceNode = store.nodeLookup.get(edge.source) as Node | undefined;
				const edgeTargetNode = store.nodeLookup.get(edge.target) as Node | undefined;

				if (
					fromNode === undefined ||
					edgeSourceNode === undefined ||
					edgeTargetNode === undefined
				)
					return [0, 0, false, false];

				const isHorizontal = getIsHorizontal(fromNode.data.depth);

				if (initialFromNodeOffset.current === undefined) {
					initialFromNodeOffset.current = isHorizontal
						? fromNode.position.y
						: fromNode.position.x;
				}

				const fromSourceToNode = isHorizontal
					? Math.abs(
							edgeSourceNode.position.y -
								(initialFromNodeOffset.current + nodeHeight / 2),
						)
					: Math.abs(
							edgeSourceNode.position.x +
								nodeWidth -
								(initialFromNodeOffset.current + nodeWidth / 2) -
								nodesAngle,
						);

				const fromSourceToTarget = isHorizontal
					? Math.abs(
							edgeSourceNode.position.y - (edgeTargetNode.position.y + connectorSize),
						)
					: Math.abs(edgeSourceNode.position.x + nodeWidth - edgeTargetNode.position.x);

				const { sourceX, sourceY, targetX, targetY, part } = isHorizontal
					? {
							sourceX: edgeSourceNode.position.x + nodeWidth / 2,
							sourceY: edgeSourceNode.position.y,
							targetX: edgeTargetNode.position.x + connectorSize / 2,
							targetY: edgeTargetNode.position.y + connectorSize,
							part: (fromSourceToTarget - fromSourceToNode) / fromSourceToTarget,
						}
					: {
							sourceX: edgeSourceNode.position.x + nodeWidth,
							sourceY: edgeSourceNode.position.y + nodeHeight / 2,
							targetX: edgeTargetNode.position.x,
							targetY:
								edgeTargetNode.position.y +
								(isRoot ? nodeHeight / 2 : connectorSize / 2),
							part: (fromSourceToTarget - fromSourceToNode) / fromSourceToTarget,
						};

				const [centerX, centerY] = getPartitionPoint({
					sourceX,
					sourceY,
					targetX,
					targetY,
					part,
				});

				if (isHorizontal) {
					return [
						centerX - connectorSize / 2,
						centerY - connectorSize / 2,
						isHorizontal,
						fromNode.data.isTop,
					];
				}

				return [
					centerX - connectorSize / 2,
					centerY - connectorSize / 2,
					isHorizontal,
					fromNode.data.isTop,
				];
			},
			[fromId, parentNodeId],
		),
	);

	useEffect(() => {
		if (areNodesInitialized) {
			setNodes((nodes) => {
				return applyNodeChanges(
					[
						{
							id,
							type: "position",
							position: {
								x: connectorCenterX,
								y: connectorCenterY,
							},
						},
					],
					nodes,
				);
			});
		}
	}, [
		id, 
		areNodesInitialized,
		connectorCenterX, 
		connectorCenterY, 
		setNodes
	]);

	return (
		<div style={connectorContainerStyle}>
			{isFishboneDebug && (
				<ConnectorDebugInfo
					connectorCenterX={connectorCenterX}
					connectorCenterY={connectorCenterY}
					isHorizontal={isFishboneDebug}
					id={id}
				/>
			)}

			<Handle
				type="target"
				isConnectable={isConnectable}
				position={isHorizontal ? Position.Left : isTop ? Position.Top : Position.Bottom}
			/>
		</div>
	);
}

const ConnectorNode = memo(ConnectorNodeBase);
export default ConnectorNode;