import {
	Background,
	ControlButton,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";

import { memo, useCallback, useEffect } from "react";

import { alteratingFishboneLayout } from "../layout";
import type { Connector, Edge, FishboneProps, Node } from "../types";

import ReloadIcon from "./icons/reload";

import { fishboneEdgeTypes } from "./edges";
import { fishboneNodeTypes } from "./nodes";

import "@xyflow/react/dist/style.css";

/** ----------------------------------------------------------------------------- */

function FishboneFlowBase({ items, reactFlowProps, layout = alteratingFishboneLayout  }: FishboneProps) {
	const { fitView } = useReactFlow();

	const [nodes, setNodes, onNodesChange] = useNodesState<Node | Connector>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

	const onLayout = useCallback(() => {
		const [nodes, edges] = layout(items);

		setNodes(nodes);
		setEdges(edges);

		window.requestAnimationFrame(() => {
			fitView();
		});
	}, [layout, setNodes, setEdges, fitView, items]);

	/**
	 * biome-ignore lint/correctness/useExhaustiveDependencies: update nodes and edges only on `items` change,
	 * or rebuild layout completely when layout function was changed.
	 */
	useEffect(() => {
		onLayout();
	}, [items, layout]);

	return (
		<ReactFlow
			fitView
			nodes={nodes}
			edges={edges}
			edgeTypes={fishboneEdgeTypes}
			nodeTypes={fishboneNodeTypes}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			{...reactFlowProps}
		>
			<Background />

			<Controls>
				<ControlButton onClick={onLayout}>
					<ReloadIcon />
				</ControlButton>
			</Controls>
		</ReactFlow>
	);
}

const FishboneFlow = memo(FishboneFlowBase);

const Fishbone = (props: FishboneProps) => {
	return (
		<ReactFlowProvider>
			<FishboneFlow {...props} />
		</ReactFlowProvider>
	);
};

export default Fishbone;
