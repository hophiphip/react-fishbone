import React, { DragEvent, useCallback } from 'react';
import * as d3 from 'd3';
import type { FishboneProps, LineConfig, NodeConfig } from './Fishbone.types';

interface Node extends d3.SimulationNodeDatum {
    id?: number;
    childIdx?: number;
    maxChildIdx?: number;
    depth?: number;
    horizontal?: boolean;
    vertical?: boolean;
    linkCount?: number;
    name?: string;
    parent?: Node;
    root?: boolean;
    region?: number;
    tail?: boolean;
    totalLinks?: number[];
    connector?: Node;
    children?: Node[];
    between?: [Node, Node];
}

interface Link extends d3.SimulationLinkDatum<Node> {
    id?: number;
    depth: number;
    arrow: boolean;
    source: Node;
    target: Node;
}

/** -------------------------------------------------------------------- */

const arrowElementId = 'arrow';
const margin = 50;

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
    return `node ${node.root ? 'root' : ''}`;
}

function getNodeLabelClass(node: Node) {
    return `label-${node.depth}`;
}

function getNodeTextAnchor(node: Node) {
    return !node.depth 
        ? 'start' 
        : node.horizontal 
            ? 'end' 
            : 'middle';
}

function getNodeDy(node: Node) {
    return node.horizontal 
        ? '.35em' 
        : node.region === 1 
            ? '1em' 
            : '-.2em';

}

function getIsNodeFixed(node: Node) {
    return node.fx !== undefined;
}

function getLinkClass(link: Link) {
    return `link link-${link.depth}`;
}

function getLinkDistance(link: Link) {
    return (link.target.maxChildIdx! + 1) * linkScale(link.depth + 1);
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
        items = {
            name: 'Test',
        },
        linesConfig = defaultLinesConfig,
        nodesConfig = defaultNodesConfig,
        wrapperStyle,
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
        return nodeConfigByDepth(node.depth).fontSizeEm;
    }, [nodeConfigByDepth]);

    const getNodeFill = useCallback((node: Node) => {
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

        const svg = d3
            .select(containerRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .datum(items);

        const defs = svg.append('defs').data([1]);
        
        const svgElement = svg.selection().node();

        const svgWidth = () => svgElement?.clientWidth || 0;
        const svgHeight = () => svgElement?.clientHeight || 0;

        function buildNodes(node: Node) {
            nodes.push(node);
          
            let cx = 0;
            let between: [Node, Node] = [node, node.connector!];
            
            const nodeLinks = [
                {
                    source: node,
                    target: node.connector,
                    arrow: true,
                    depth: node.depth || 0,
                },
            ];

            let prev: Node | null;
            let childLinkCount: number | null;
          
            if (!node.parent) {
                nodes.push((prev = { tail: true }));
                between = [prev, node];
                nodeLinks[0].source = prev;
                nodeLinks[0].target = node;
                node.vertical = false;
                node.depth = 0;
                node.root = true;
                node.totalLinks = [];
            } else {
                if (!node.connector) {
                    node.connector = {};
                }
                node.connector.maxChildIdx = 0;
                node.connector.totalLinks = [];
            }
          
            node.linkCount = 1;
          
            node.children?.forEach(function (child: Node, idx: number) {
                child.parent = node;
                child.depth = (node.depth || 0) + 1;
                child.childIdx = idx;
                child.region = node.region ? node.region : idx % 2 ? -1 : 1;
                child.horizontal = !node.horizontal;
                child.vertical = !node.vertical;
          
                if (node.root && prev && !prev.tail) {
                    nodes.push(
                        (child.connector = {
                            between: between,
                            childIdx: prev.childIdx,
                        })
                    );
                    prev = null;
                } else {
                    nodes.push(
                        (prev = child.connector = { between: between, childIdx: cx++ })
                    );
                }
          
                nodeLinks.push({
                    source: child,
                    target: child.connector,
                    depth: child.depth,
                    arrow: false,
                });
          
                childLinkCount = buildNodes(child);
                node.linkCount += childLinkCount;
                between[1].totalLinks.push(childLinkCount);
            });
          
            between[1].maxChildIdx = cx;
          
            Array.prototype.unshift.apply(links, nodeLinks);
          
            return node.linkCount;
        }

        defs
            .selectAll(`marker#${arrowElementId}`)
            .data([1])
            .enter()
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('refY', 0)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');

        buildNodes(svg.datum());

        const linkForce = d3
            .forceLink<Node, Link>()
            .id((link) => link.id!)
            .links(links)
            .distance(getLinkDistance);

        const force = d3.forceSimulation(nodes)
            .nodes(nodes)
            .force('link', linkForce);

        const linkSelect = svg
            .selectAll('.link')
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
            force?.alpha(1).restart();
        }
                    
        const dragstart = (event: any) => {
            setIsDragging(true);
            d3.select(event.sourceEvent.target).classed('fixed', true);
        };
                    
        function dragged(event: MouseEvent, d: Node) {
            d.fx = clamp(event.x, 0, svgWidth());
            d.fy = clamp(event.y, 0, svgHeight());
            force?.alpha(1).restart();
        }
    
        const dragend = () => {
            setIsDragging(false);
        };

        const nodesSelect = 
            svg
                .selectAll('.node')
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
                .text((node) => node.name!)
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

            const alpha = force?.alpha();
      
            const k = 6 * (alpha || 0);
            const width = svgWidth();
            const height = svgHeight();

            let a;
            let b;
          
            nodes.forEach((node) => {
                if (node.root) {
                    node.x = width - (margin + root.getBBox().width);
                }

                if (node.tail) {
                    node.x = margin;
                    node.y = height / 2;
                }
          
                if (node.depth === 1) {
                    node.y = node.region === -1 ? margin : height - margin;
                    node.x -= 10 * k;
                }
          
                if (node.vertical) {
                    node.y += k * node.region;
                }
          
                if (node.depth) {
                    node.x -= k;
                }
          
                if (node.between) {
                    a = node.between[0];
                    b = node.between[1];
          
                    node.x = b.x - ((1 + node.childIdx) * (b.x - a.x)) / (b.maxChildIdx + 1);
                    node.y = b.y - ((1 + node.childIdx) * (b.y - a.y)) / (b.maxChildIdx + 1);
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

        force.on('tick', tick);
          
        d3.select(window).on('resize', function () {
            svg
                .attr('width', svgWidth())
                .attr('height', svgHeight());
              
            const resizeFinished = setTimeout(() => {
                force?.restart();
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