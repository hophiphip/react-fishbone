import { Handle, Position, useInternalNode } from "@xyflow/react";
import { type CSSProperties, memo, useMemo } from "react";
import { getIsHorizontal, nodeHeight, nodeWidth, rootId, tailId } from "../../const";
import { useIsFishboneDebug } from "../../contexts/fishbone-debug";
import type { NodeData } from "../../types";

/** ----------------------------------------------------------------------------- */

const rootArrowStyle: CSSProperties = {
	width: 0,
	height: 0,
	borderTop: "5px solid transparent",
	borderBottom: "5px solid transparent",
	borderRight: "5px solid transparent",
	boxSizing: "border-box",
	background: "transparent",
	borderLeft: "20px solid black",
	paddingRight: "0.5rem",
	borderRadius: 0,
};

function NodeHandleBase({
	id,
	data,
	isConnectable,
}: {
	id: string;
	data: NodeData;
	isConnectable: boolean | undefined;
}) {
	switch (id) {
		case tailId:
			return <Handle type="source" position={Position.Right} isConnectable={isConnectable} />;

		case rootId:
			return (
				<Handle
					type="target"
					style={rootArrowStyle}
					position={Position.Left}
					isConnectable={isConnectable}
				/>
			);

		default:
			return getIsHorizontal(data.depth) ? (
				<Handle type="source" position={Position.Right} isConnectable={isConnectable} />
			) : data.isTop ? (
				<Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
			) : (
				<Handle type="source" position={Position.Top} isConnectable={isConnectable} />
			);
	}
}

const NodeHandle = memo(NodeHandleBase);

/** ----------------------------------------------------------------------------- */

function FishboneNodeDebugInfo({
	id,
	data,
}: {
	id: string;
	data: NodeData;
}) {
	const nodeInternal = useInternalNode(id);

	return (
		<>
			<span style={{ fontSize: 6 }}>
				({nodeInternal?.internals.positionAbsolute.x},{" "}
				{nodeInternal?.internals.positionAbsolute.y})
			</span>

			<span style={{ fontSize: 6 }}>Top: {`${data.isTop}`}</span>
		</>
	);
}

/** ----------------------------------------------------------------------------- */

function getNodeLabelStyles(data: NodeData): CSSProperties {
	const { depth } = data;

	const depthToFontSize = (depth: number): CSSProperties["fontSize"] => {
		switch (depth) {
			case 0:
				return 24;
			case 1:
				return 16;
			case 2:
				return 14;
			case 3:
				return 12;
			default:
				return 10;
		}
	};

	const depthToFontWeight = (depth: number): CSSProperties["fontWeight"] => {
		switch (depth) {
			case 0:
				return "bold";
			default:
				return undefined;
		}
	};

	return {
		display: "block",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		fontSize: depthToFontSize(depth),
		fontWeight: depthToFontWeight(depth),
	};
}

function FishboneNodeBase({
	id,
	isConnectable,
	data,
}: {
	id: string;
	isConnectable: boolean | undefined;
	data: NodeData;
}) {
	const { label, depth, isTop } = data;

	const isFishoneDebug = useIsFishboneDebug();

	const nodeStyle: CSSProperties = useMemo(() => {
		const isRoot = id === rootId;
		const isHorizontal = getIsHorizontal(depth);

		return {
			width: nodeWidth,
			height: nodeHeight,
			display: "flex",
			justifyContent: isHorizontal ? "center" : isTop ? "end" : "start",
			alignItems: isRoot ? "start" : isHorizontal ? "end" : "center",
			paddingBottom: isTop === true ? "0.2rem" : undefined,
			paddingTop: isTop === false ? "0.2rem" : undefined,
			paddingInline: "0.5rem",
			flexDirection: "column",
			overflow: "hidden",
			boxSizing: "border-box",
		} as const;
	}, [id, depth, isTop]);

	return (
		<div style={nodeStyle}>
			<span style={useMemo(() => getNodeLabelStyles(data), [data])}>{label}</span>

			{isFishoneDebug && <FishboneNodeDebugInfo id={id} data={data} />}

			<NodeHandle id={id} data={data} isConnectable={isConnectable} />
		</div>
	);
}

const FishboneNode = memo(FishboneNodeBase);
export default FishboneNode;
