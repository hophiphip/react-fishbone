import React, { useCallback } from 'react';
import * as d3 from 'd3';
import type { FishboneNode, FishboneProps, LineConfig, NodeConfig } from './Fishbone.types';

export interface RootNode extends d3.SimulationNodeDatum {
    maxChildIdx: number;
    childIdx?: never;
    depth: 0;
    vertical: false;
    name: string;
    root: true;
    connector?: never;
    children?: FishboneNode[]; 
}

export interface TextNode extends Omit<
    RootNode, 
    'childIdx' | 'root' | 'depth' | 'vertical' | 'connector'
> {
    childIdx: number;
    depth: number;
    vertical: boolean;
    parent: Node;
    region: number;
    root?: never;
    connector: ConnectorNode;
}

export interface ConnectorNode extends Omit<
    RootNode, 
    'childIdx' | 'depth' | 'vertical' | 'name' | 'root' | 'connector' | 'children'
> {
    maxChildIdx: number;
    childIdx: number;
    between: [TailNode, RootNode] | [TextNode, ConnectorNode];
}

export interface TailNode extends Omit<
    TextNode,
    'childIdx' | 'depth' | 'vertical' | 'parent' | 'region' | 'root' | 'connector' | 'maxChildIdx' | 'name' | 'children'
> {
    tail: true,
}

export type Node = RootNode | TextNode | ConnectorNode | TailNode;

export interface Link extends d3.SimulationLinkDatum<Node> {
    depth: number;
    arrow: boolean;
    source: TailNode | TextNode;
    target: RootNode | ConnectorNode | TextNode;
}

/** -------------------------------------------------------------------- */

function isRootNode(node: Node): node is RootNode {
    return 'root' in node && node.root === true;
}

function isConnectorNode(node: Node): node is ConnectorNode {
    return 'between' in node;
}

function isTailNode(node: Node): node is TailNode {
    return 'tail' in node && node.tail === true;
}

function isTextNode(node: Node): node is TextNode {
    return 'name' in node;
}

/** -------------------------------------------------------------------- */

const arrowElementId = 'arrow';
const margin = 50;

const nodeClassName = 'node';
const tailNodeClassName = 'tail';
const connectorNodeClassName = 'connector';
const rootNodeClassName = 'root';
const linkClassName = 'link';

const linkScale = d3
    .scaleLog()
    .domain([1, 5])
    .range([60, 30]);

const defaultLinesConfig = [
    {
        color: '#000',
        strokeWidthPx: 2
    },
    {
        color: '#333',
        strokeWidthPx: 1,
    },
    {
        color: '#666',
        strokeWidthPx: 0.5,
    },
];
    
const defaultNodesConfig = [
    {
        color: '#000',
        fontSizeEm: 2,
    },
    {
        color: '#111',
        fontSizeEm: 1.5,
    },
    {
        color: '#444',
        fontSizeEm: 1,
    },
    {
        color: '#888',
        fontSizeEm: 0.9,
    },
    {
        color: '#aaa',
        fontSizeEm: 0.8,
    },
];

/** -------------------------------------------------------------------- */

function clamp(value: number, low: number, high: number) {
    return value < low ? low : value > high ? high : value;
}

function getNodeClass(node: Node) {
    if (isTailNode(node))
        return `${nodeClassName} ${tailNodeClassName}`;

    if (isConnectorNode(node))
        return `${nodeClassName} ${connectorNodeClassName}`;

    return `${nodeClassName}${node.root ? ` ${rootNodeClassName}` : ''}`;
}

function getNodeLabelClass(node: Node) {
    if (isTextNode(node))
        return `label-${node.depth}`;

    return null;
}

function getNodeTextAnchor(node: Node) {
    if (isTextNode(node)) {
        return !node.depth 
            ? 'start' 
            : !node.vertical 
                ? 'end' 
                : 'middle';
    }

    return null;
}

function getNodeDy(node: Node) {
    if (isTextNode(node)) {
        return !node.vertical 
            ? '.35em' 
            : node.region === 1 
                ? '1em' 
                : '-.2em';
    }

    return null;
}

function getNodeText(node: Node) {
    if (isTextNode(node))
        return node.name;

    return null;
}

function getIsNodeFixed(node: Node) {
    return node.fx !== undefined;
}

function getLinkClass(link: Link) {
    return `${linkClassName} ${linkClassName}-${link.depth}`;
}

function getLinkDistance(link: Link) {
    return (link.target.maxChildIdx + 1) * linkScale(link.depth + 1);
}

function getLinkSelectMarkerEnd(link: Link) {
    return link.arrow 
        ? `url(#${arrowElementId})` 
        : null;
}

/** -------------------------------------------------------------------- */

const Fishbone = (props: FishboneProps) => {
    const {
        width = '100%',
        height = '100%',
        items,
        linesConfig = defaultLinesConfig,
        nodesConfig = defaultNodesConfig,
        wrapperStyle,
        angleCoefficient = 6,
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const lineConfigByDepth = React.useCallback((depth: number | undefined | null): LineConfig => {
        if (depth === undefined || depth === null || depth < 0) return linesConfig[0];
        const maxIndex = linesConfig.length - 1;
        return linesConfig[Math.min(maxIndex, depth)];
    }, [linesConfig]);

    const nodeConfigByDepth = React.useCallback((depth: number | undefined | null): NodeConfig => {
        if (depth === undefined || depth === null || depth < 0) return nodesConfig[0];
        const maxIndex = nodesConfig.length - 1;
        return nodesConfig[Math.min(maxIndex, depth)];
    }, [nodesConfig]);

    const getNodeFontSize = useCallback((node: Node) => {
        if (isConnectorNode(node) || isTailNode(node)) return null;
        return `${nodeConfigByDepth(node.depth).fontSizeEm}em`;
    }, [nodeConfigByDepth]);

    const getNodeFill = useCallback((node: Node) => {
        if (isConnectorNode(node) || isTailNode(node)) return null;
        return nodeConfigByDepth(node.depth).color;
    }, [nodeConfigByDepth]);

    const getLinkStroke = useCallback((link: Link) => {
        return lineConfigByDepth(link.depth).color;
    }, [lineConfigByDepth]);

    const getLinkStrokeWidth = useCallback((link: Link) => {
        const width = lineConfigByDepth(link.depth).strokeWidthPx; 
        return `${width}px`;
    }, [lineConfigByDepth]);

    const initialize = () => {
        const nodes: Node[] = [];
        const links: Link[] = [];

        const datum = items;

        const svg = d3
            .select(containerRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const defs = svg.append('defs').data([1]);
        
        const svgElement = svg.selection().node();

        const svgWidth = () => svgElement?.clientWidth || 0;
        const svgHeight = () => svgElement?.clientHeight || 0;

        function initializeTextNode(node: TextNode) {
            nodes.push(node);

            const nodeLinks: Link[] = [
                {
                    source: node,
                    target: node.connector,
                    arrow: true,
                    depth: node.depth,
                },
            ];

            let prev: ConnectorNode | null;
            let childLinkCount: number | null;

            let cx = 0;
            const between: ConnectorNode['between'] = [node, node.connector];
            let nodeLinkCount = 1;

            node.children?.forEach((childFishboneNode, childIndex) => {
                const childConnector: ConnectorNode = {
                    between,
                    childIdx: cx++,
                    maxChildIdx: 0,
                };

                const childNode: TextNode = {
                    parent: node,
                    depth: node.depth + 1,
                    childIdx: childIndex,
                    region: node.region,
                    vertical: !node.vertical,
                    connector: childConnector,
                    maxChildIdx: 0,
                    name: childFishboneNode.name,
                    children: childFishboneNode.children,
                };

                prev = childConnector;
                nodes.push(prev);

                nodeLinks.push({
                    source: childNode,
                    target: childNode.connector,
                    depth: childNode.depth,
                    arrow: false,
                });

                childLinkCount = initializeTextNode(childNode);
                nodeLinkCount += childLinkCount;
            });

            between[1].maxChildIdx = cx;
            links.unshift(...nodeLinks);

            return nodeLinkCount;
        }

        function initializeRootNode(node: FishboneNode) {
            const root: RootNode = {
                depth: 0,
                maxChildIdx: 1,
                name: node.name,
                root: true,
                vertical: false,
                children: node.children,
            };

            const tail: TailNode = {
                tail: true,
            };

            nodes.push(root);
            nodes.push(tail);

            const nodeLinks: Link[] = [
                {
                    source: tail,
                    target: root,
                    arrow: true,
                    depth: root.depth,
                }
            ];

            let prev: TailNode | TextNode | null = tail;
            const between: ConnectorNode['between'] = [prev, root];
            let cx = 0;
            let childLinkCount: number | null;
            let nodeLinkCount = 1;

            node.children?.forEach((childFishboneNode, childIndex) => {
                const childConnector: ConnectorNode = (() => {
                    if (prev && !isTailNode(prev)) {
                        const connector = {
                            between,
                            childIdx: prev.childIdx,
                            maxChildIdx: 0,
                        };

                        prev = null;

                        return connector;
                    } else  {
                        return {
                            between,
                            childIdx: cx++,
                            maxChildIdx: 0,
                        };
                    }
                })();

                const childNode: TextNode = {
                    parent: root,
                    depth: root.depth + 1,
                    childIdx: childIndex,
                    region: childIndex % 2 ? -1 : 1,
                    vertical: !root.vertical,
                    name: childFishboneNode.name,
                    children: childFishboneNode.children,
                    maxChildIdx: 0,
                    connector: childConnector,
                };

                nodes.push(childConnector);

                nodeLinks.push({
                    source: childNode,
                    target: childNode.connector,
                    depth: childNode.depth,
                    arrow: false,
                });

                childLinkCount = initializeTextNode(childNode);
                nodeLinkCount += childLinkCount;
            });

            between[1].maxChildIdx = cx;
            links.unshift(...nodeLinks);

            return nodeLinkCount;
        }

        defs
            .selectAll(`marker#${arrowElementId}`)
            .data([1])
            .enter()
            .append('marker')
            .attr('id', arrowElementId)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('refY', 0)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');

        if (datum) {
            initializeRootNode(datum);
        }

        const linkForce = d3
            .forceLink<Node, Link>()
            .links(links)
            .distance(getLinkDistance);

        const simultation = d3.forceSimulation(nodes)
            .nodes(nodes)
            .force('link', linkForce);
            
        const linkSelect = svg
            .selectAll(`.${linkClassName}`)
            .data(links)
            .enter()
            .append('line')
            .attr('class', getLinkClass)
            .attr('marker-end', getLinkSelectMarkerEnd)
            .style('stroke', getLinkStroke)
            .style('stroke-width', getLinkStrokeWidth);

        function click(event: any, d: Node) {
            delete d.fx;
            delete d.fy;
            d3.select(event.target).classed('fixed', false);
            simultation.alpha(1).restart();
        }
                    
        const dragstart = (event: any) => {
            setIsDragging(true);
            d3.select(event.sourceEvent.target).classed('fixed', true);
        };
                    
        function dragged(event: MouseEvent, d: Node) {
            d.fx = clamp(event.x, 0, svgWidth());
            d.fy = clamp(event.y, 0, svgHeight());
            simultation.alpha(1).restart();
        }
    
        const dragend = () => {
            setIsDragging(false);
        };

        const nodesSelect = 
            svg
                .selectAll(`.${nodeClassName}`)
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', getNodeClass)
                .append('text')
                .attr('class', getNodeLabelClass)
                .style('font-size', getNodeFontSize)
                .style('fill', getNodeFill)
                .attr('text-anchor', getNodeTextAnchor)
                .attr('dy', getNodeDy)
                .text(getNodeText)
                .classed('node', true)
                .classed('fixed', getIsNodeFixed);
          
        nodesSelect
            .call(
                d3
                    .drag<SVGTextElement, Node>()
                    .on('start', dragstart)
                    .on('drag', dragged)
                    .on('end', dragend)
            ).on('click', click);

        const root = svg.select('.root').node() as SVGGraphicsElement;
          
        function tick() {
            if (isDragging) return;

            const alpha = simultation.alpha();
      
            const k = angleCoefficient * alpha;
            const width = svgWidth();
            const height = svgHeight();

            nodes.forEach((node) => {
                if (isTailNode(node)) {
                    node.x = margin;
                    node.y = height / 2;
                }
                else if (isConnectorNode(node)) {
                    const source = node.between[0];
                    const target = node.between[1];
          
                    node.x = target.x! - ((1 + node.childIdx!) * (target.x! - source.x!)) / (target.maxChildIdx! + 1);
                    node.y = target.y! - ((1 + node.childIdx!) * (target.y! - source.y!)) / (target.maxChildIdx! + 1);
                } else if (isRootNode(node)) {
                    node.x = width - (margin + root.getBBox().width);
                } else {
                    if (node.depth === 1) {
                        node.y = node.region === -1 ? margin : height - margin;
                        node.x! -= 10 * k;
                    }
            
                    if (node.vertical) {
                        node.y! += k * node.region!;
                    }
            
                    if (node.depth) {
                        node.x! -= k;
                    }
                }     
            });
          
            nodesSelect
                .attr('transform', (node) => `translate(${node.x!},${node.y!})`);
          
            linkSelect
                .attr('x1', (link) => link.source.x!)
                .attr('y1', (link) => link.source.y!)
                .attr('x2', (link) => link.target.x!)
                .attr('y2', (link) => link.target.y!);
        }

        simultation.on('tick', tick);
          
        d3.select(window).on('resize', function () {
            svg
                .attr('width', svgWidth())
                .attr('height', svgHeight());
              
            const resizeFinished = setTimeout(() => {
                simultation.restart();
            }, 200);
              
            clearTimeout(resizeFinished);
        });
    };

    React.useEffect(() => {
        // Ref is not initialized
        if (containerRef.current === null) return;
        // Ref was already initialized (Caused by React.StrictMode)
        if (containerRef.current.children.length !== 0) return;
        // If no items passed - render nothing
        if (!items) return;

        initialize();
    }, [
        containerRef,
        width,
        height, 
        items,
        linesConfig,
        nodesConfig,
        wrapperStyle,
    ]);

    return (
        <div ref={containerRef} style={wrapperStyle}>
        </div>
    );
};

export default Fishbone;