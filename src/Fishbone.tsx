import React from 'react';
import * as d3 from 'd3';
import { FishboneProps } from './Fishbone.types';

import './Fishbone.css';

const Fishbone = (props: FishboneProps) => {
    const {
        width = '100%',
        height = '100%',
        items,
        wrapperStyle,
    } = props;

    const margin = 50;

    const ref = React.useRef<HTMLDivElement>(null);

    const perNodeTick = (d: any) => {};
    
    const linkScale = d3
        .scaleLog()
        .domain([1, 5])
        .range([60, 30]);

    const initialize = () => {
        let nodes: any[] = [];
        let links: any[] = [];
        let node: any, link: any, root: any;

        let force: d3.Simulation<any, undefined> | undefined;

        const svg = d3
            .select(ref.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .datum(items);

        const defs = svg.append('defs').data([1]);
        
        const svgElement = svg.selection().node();

        const svgWidth = () => svgElement?.clientWidth || 0;
        const svgHeight = () => svgElement?.clientHeight || 0;

        function buildNodes(node: any) {
            nodes.push(node);
          
            var cx = 0;
          
            var between = [node, node.connector],
              nodeLinks = [
                {
                  source: node,
                  target: node.connector,
                  arrow: true,
                  depth: node.depth || 0,
                },
              ],
              prev: any,
              childLinkCount;
          
            if (!node.parent) {
              nodes.push((prev = { tail: true }));
              between = [prev, node];
              nodeLinks[0].source = prev;
              nodeLinks[0].target = node;
              node.horizontal = true;
              node.vertical = false;
              node.depth = 0;
              node.root = true;
              node.totalLinks = [];
            } else {
              node.connector.maxChildIdx = 0;
              node.connector.totalLinks = [];
            }
          
            node.linkCount = 1;
          
            (node.children || []).forEach(function (child: any, idx: number) {
              child.parent = node;
              child.depth = (node.depth || 0) + 1;
              child.childIdx = idx;
              child.region = node.region ? node.region : idx & 1 ? 1 : -1;
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

        function tick() {
            const alpha = force?.alpha();
      
            let k = 6 * (alpha || 0),
              width = svgWidth(),
              height = svgHeight(),
              a,
              b;
          
            nodes.forEach(function (d) {
              if (d.root) {
                d.x = width - (margin + root.getBBox().width);
              }
              if (d.tail) {
                d.x = margin;
                d.y = height / 2;
              }
          
              if (d.depth === 1) {
                d.y = d.region === -1 ? margin : height - margin;
                d.x -= 10 * k;
              }
          
              if (d.vertical) {
                d.y += k * d.region;
              }
          
              if (d.depth) {
                d.x -= k;
              }
          
              if (d.between) {
                a = d.between[0];
                b = d.between[1];
          
                d.x = b.x - ((1 + d.childIdx) * (b.x - a.x)) / (b.maxChildIdx + 1);
                d.y = b.y - ((1 + d.childIdx) * (b.y - a.y)) / (b.maxChildIdx + 1);
              }
          
              perNodeTick(d);
            });
          
            node
              .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
          
            link
              .attr('x1', (d: any) => d.source.x)
              .attr('y1', (d: any) => d.source.y)
              .attr('x2', (d: any) => d.target.x)
              .attr('y2', (d: any) => d.target.y);
        }

        defs
            .selectAll(`marker#arrow`)
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

        force = d3.forceSimulation(nodes)
            .nodes(nodes)
            .force('link', 
                d3
                .forceLink()
                .id((d: any) => d.id)
                .links(links)
                .distance((d: any) => (
                    (d.target.maxChildIdx + 1) * linkScale(d.depth + 1)
                ))
            );

        link = svg
            .selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', (d: any) => `link link-${d.depth}`)
            .attr('marker-end', (d: any) => d.arrow 
              ? `url(#arrow)` 
              : null
            );

        node = svg
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', (d: any) => `node ${d.root ? 'root' : ''}`)
            .append('text')
            .attr('class', (d: any) => `label-${d.depth}`)
            .attr('text-anchor', (d: any) => !d.depth 
              ? 'start' 
              : d.horizontal 
                ? 'end' 
                : 'middle'
            )
            .attr('dy', (d: any) => d.horizontal 
              ? '.35em' 
              : d.region === 1 
                ? '1em' 
                : '-.2em'
            )
            .text((d: any) => d.name)
            .classed('node', true)
            .classed('fixed', (d: any) => d.fx !== undefined);

        function clamp(x: any, lo: any, hi: any) {
            return x < lo ? lo : x > hi ? hi : x;
        }
                
        function click(event: any, d: any) {
            delete d.fx;
            delete d.fy;
            d3.select(event.target).classed("fixed", false);
            force?.alpha(1).restart();
        }
                
        function dragstart(event: any) {
            d3.select(event.sourceEvent.target).classed("fixed", true);
        }
                
        function dragged(event: any, d: any) {
            d.fx = clamp(event.x, 0, svgWidth());
            d.fy = clamp(event.y, 0, svgHeight());
            force?.alpha(1).restart();
        }
          
        const drag = d3
          .drag()
          .on("start", dragstart)
          .on("drag", dragged);
          
        node.call(drag).on("click", click);
          
        root = svg.select('.root').node();
          
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
        if (ref.current === null) return;
        // Ref was already initialized (Caused by React.StrictMode)
        if (ref.current.children.length !== 0) return;
        // If no items passed - render nothing
        if (!items) return;

        initialize();
    }, []);

    return (
        <div ref={ref} style={wrapperStyle}>
        </div>
    );
};

export default Fishbone;