import { FishboneEdgeTypes } from "../components/edges";
import { FishboneNodeTypes } from "../components/nodes";
import { getIsHorizontal, nodesAngle, rootId, tailId, xGap, yGap } from "../const";
import type { Connector, Edge, FishboneNode, MinMax, Node } from "../types";

function verticalNodeHandler(
    fishboneNode: FishboneNode,
    minMax: MinMax,
    nodes: Node[],
    edges: Edge[],
    depth: number,
    depthToMaxSize: Map<number, number>,
    connectors: Connector[],
    isTop: boolean,
) {
    const { label, children } = fishboneNode;

    const parentMaxY = minMax.maxY;

    const nodeX = minMax.minX - xGap;
    minMax.minX = nodeX;

    let minXForChildren = minMax.minX;
    const childrenNodes: Node[] = [];

    if (children) {
        const currentMinX = minMax.minX;
        const childrenDepth = depth + 1;

        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            childrenNodes.push(
                horizontalNodeHandler(
                    children[childIndex],
                    minMax,
                    nodes,
                    edges,
                    childrenDepth,
                    depthToMaxSize,
                    connectors,
                    isTop,
                ),
            );

            if (minMax.minX < minXForChildren) {
                minXForChildren = minMax.minX;
            }

            /** Reset X for each child */
            minMax.minX = currentMinX;
        }

        minMax.minX = minXForChildren;
    }

    const nodeY = minMax.maxY + yGap;
    minMax.maxY = nodeY;

    /** ----------------------------------------------------------------------------- */

    const node: Node = {
        id: `${nodes.length}`,
        data: {
            label,
            depth,
            offsetFromParent: 0,
            index: nodes.length,
            isTop,
        },
        position: {
            x: nodeX,
            y: nodeY,
        },
        type: FishboneNodeTypes.FishboneNode,
    };

    nodes.push(node);

    /** ----------------------------------------------------------------------------- */

    /** Add edges and connectors */
    for (const childNode of childrenNodes) {
        const connector: Connector = {
            id: `connector-${childNode.id}-to-${node.id}`,
            data: {
                parentNodeId: node.id,
                fromId: childNode.id,
            },
            position: {
                x: 0,
                y: 0,
            },
            type: FishboneNodeTypes.ConnectorNode,
            draggable: false,
            selectable: false,
        };

        const childNodeToConnector: Edge = {
            id: `${childNode.id}-to-${connector.id}`,
            source: childNode.id,
            target: connector.id,
            type: FishboneEdgeTypes.StraightEdge,
        };

        connectors.push(connector);
        edges.push(childNodeToConnector);
    }

    /** ----------------------------------------------------------------------------- */

    const currentDepthMaxSize = depthToMaxSize.get(depth);
    const currentNodeYOffset = node.position.y - parentMaxY;
    node.data.offsetFromParent = currentNodeYOffset;

    if (currentDepthMaxSize === undefined || currentDepthMaxSize < currentNodeYOffset) {
        depthToMaxSize.set(depth, currentNodeYOffset);
    }

    return node;
}

function horizontalNodeHandler(
    fishboneNode: FishboneNode,
    minMax: MinMax,
    nodes: Node[],
    edges: Edge[],
    depth: number,
    depthToMaxSize: Map<number, number>,
    connectors: Connector[],
    isTop: boolean,
) {
    const { label, children } = fishboneNode;

    const initialMinX = minMax.minX;

    const nodeY = minMax.maxY + yGap;
    minMax.maxY = nodeY;

    let maxYForChildren = minMax.maxY;
    const childrenNodes: Node[] = [];

    if (children) {
        const currentMaxY = minMax.maxY;
        const childrenDepth = depth + 1;

        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            childrenNodes.push(
                verticalNodeHandler(
                    children[childIndex],
                    minMax,
                    nodes,
                    edges,
                    childrenDepth,
                    depthToMaxSize,
                    connectors,
                    isTop,
                ),
            );

            if (minMax.maxY > maxYForChildren) {
                maxYForChildren = minMax.maxY;
            }

            /** Reset Y for each child */
            minMax.maxY = currentMaxY;
        }

        minMax.maxY = maxYForChildren;
    }

    const nodeX = minMax.minX - xGap;
    minMax.minX = nodeX;

    /** ----------------------------------------------------------------------------- */

    const node: Node = {
        id: `${nodes.length}`,
        data: {
            label,
            depth,
            offsetFromParent: 0,
            index: nodes.length,
            isTop,
        },
        position: {
            x: nodeX,
            y: nodeY,
        },
        type: FishboneNodeTypes.FishboneNode,
    };

    nodes.push(node);

    /** ----------------------------------------------------------------------------- */

    for (const childNode of childrenNodes) {
        const connector: Connector = {
            id: `connector-${childNode.id}-${node.id}`,
            data: {
                parentNodeId: node.id,
                fromId: childNode.id,
            },
            position: {
                x: 0,
                y: 0,
            },
            type: FishboneNodeTypes.ConnectorNode,
            draggable: false,
            selectable: false,
        };

        const childNodeToConnector: Edge = {
            id: `${childNode.id}-to-${connector.id}`,
            source: childNode.id,
            target: connector.id,
            type: FishboneEdgeTypes.StraightEdge,
        };

        connectors.push(connector);
        edges.push(childNodeToConnector);
    }

    /** ----------------------------------------------------------------------------- */

    const currentDepthMaxSize = depthToMaxSize.get(depth);
    const currentNodeXOffset = node.position.x - initialMinX;
    node.data.offsetFromParent = currentNodeXOffset;

    if (
        currentDepthMaxSize === undefined ||
        /** X-values are always negative, so we compare it by absolute value,
         * or we can simply invert the comparison */
        currentDepthMaxSize > currentNodeXOffset
    ) {
        depthToMaxSize.set(depth, currentNodeXOffset);
    }

    return node;
}

function getFishboneLayout(fishboneRoot: FishboneNode): [(Node | Connector)[], Edge[]] {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const connectors: Connector[] = [];

    const depthToMaxSize = new Map<number, number>();

    const depth = 0;

    const { label, children } = fishboneRoot;

    const root: Node = {
        id: rootId,
        data: {
            label,
            depth,
            offsetFromParent: 0,
            index: nodes.length,
            isTop: undefined,
        },
        position: {
            x: 0,
            y: 0,
        },
        type: FishboneNodeTypes.FishboneNode,
    };

    nodes.push(root);

    /** ----------------------------------------------------------------------------- */

    const tailToRoot: Edge = {
        id: `${tailId}-to-${rootId}`,
        source: tailId,
        target: rootId,
        type: FishboneEdgeTypes.StraightEdge,
    };

    edges.push(tailToRoot);

    /** ----------------------------------------------------------------------------- */

    const minMax: MinMax = {
        minX: root.position.x,
        maxY: root.position.y,
    };

    let maxYForChildren = minMax.maxY;

    if (children) {
        const childrenNodes: Node[] = [];
        const currentY = minMax.maxY;
        const childrenDepth = depth + 1;

        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            childrenNodes.push(
                verticalNodeHandler(
                    children[childIndex],
                    minMax,
                    nodes,
                    edges,
                    childrenDepth,
                    depthToMaxSize,
                    connectors,
                    childIndex % 2 !== 0,
                ),
            );

            if (minMax.maxY > maxYForChildren) {
                maxYForChildren = minMax.maxY;
            }

            /** Reset Y for each child */
            minMax.maxY = currentY;
        }

        minMax.maxY = maxYForChildren;

        /** Add edges and connectors */
        for (const childNode of childrenNodes) {
            const connector: Connector = {
                id: `connector-${childNode.id}-to-${rootId}`,
                data: {
                    fromId: childNode.id,
                    parentNodeId: rootId,
                },
                position: {
                    x: 0,
                    y: 0,
                },
                type: FishboneNodeTypes.ConnectorNode,
                draggable: false,
                selectable: false,
            };

            const childNodeToConnector: Edge = {
                id: `${childNode.id}-to-${connector.id}`,
                source: childNode.id,
                target: connector.id,
                type: FishboneEdgeTypes.StraightEdge,
            };

            connectors.push(connector);
            edges.push(childNodeToConnector);
        }
    }

    /** ----------------------------------------------------------------------------- */

    const tail: Node = {
        id: tailId,
        data: {
            label: "",
            depth,
            offsetFromParent: 0,
            index: nodes.length,
            isTop: undefined,
        },
        position: {
            x: minMax.minX - xGap,
            y: root.position.y,
        },
        type: FishboneNodeTypes.FishboneNode,
    };

    nodes.push(tail);

    /** ----------------------------------------------------------------------------- */

    /**
     * Normalizing nodes positions.
     * For now only the 1 depth deep.
     * TODO: Need to figure out solution for deeply nested nodes.
     */
    for (const node of nodes) {
        const { data } = node;
        const { depth, offsetFromParent, isTop } = data;

        const isHorizontal = getIsHorizontal(depth);

        if (node.id === rootId) {
            node.position.x += xGap;
        }

        const maxOffsetForDepth = depthToMaxSize.get(depth);
        /** This is a root/tail node, ignore it */
        if (maxOffsetForDepth === undefined) continue;

        if (!isHorizontal && depth === 1) {
            node.position.y = node.position.y - offsetFromParent + maxOffsetForDepth;
        }

        if (isTop) {
            node.position.y *= -1;
        }

        if (node.id !== rootId) {
            node.position.x -= nodesAngle;
        }
    }

    /** ----------------------------------------------------------------------------- */

    return [[...nodes, ...connectors], edges];
}

export {
    getFishboneLayout,
};