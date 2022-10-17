import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class GraphPlot extends AbstractCartesianPlot {

    plot(data): Canvas {

        data = data || {
            nodes: [{ id: 'a', group: 'x' }, { id: 'b', group: 'y' }, { id: 'c', group: 'x' }],
            links: [{ source: 'a', target: 'b' }, { source: 'a', target: 'c' }, { source: 'b', target: 'c' }]
        };

        const width = this.viewBox.getBoxSize().width
        const height = this.viewBox.getBoxSize().height
        const graph = {
            svg: this.svg
                .attr("transform", `translate(${width / 2},${height / 2})`)
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;"),
            nodes: data.nodes,
            links: data.links
        }
        const args = {
            nodeId: d => d.id,
            nodeGroup: d => d.group,
            nodeTitle: d => `${d.id}`,
            width,
            height,
            linkStrokeWidth: (d) => d.w || .5,
            nodeGroups: [...new Set(data.nodes.map(d => d.group))]
        };

        this.ForceGraph(graph, args)
        return this;
    }

    // Copyright 2021 Observable, Inc.
    // Released under the ISC license.
    // https://observablehq.com/@d3/disjoint-force-directed-graph
    ForceGraph({
        svg,
        nodes, // an iterable of node objects (typically [{id}, …])
        links // an iterable of link objects (typically [{source, target}, …])
    }, {
        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
        nodeGroup = undefined, // given d in nodes, returns an (ordinal) value for color
        nodeGroups = undefined, // an array of ordinal values representing the node groups
        nodeTitle = undefined, // given d in nodes, a title string
        nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
        nodeStroke = "#fff", // node stroke color
        nodeStrokeWidth = 1.5, // node stroke width, in pixels
        nodeStrokeOpacity = 1, // node stroke opacity
        nodeRadius = 5, // node radius, in pixels
        nodeStrength = undefined,
        linkSource = ({ source }) => source, // given d in links, returns a node identifier string
        linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
        linkStroke = "#999", // link stroke color
        linkStrokeOpacity = 0.6, // link stroke opacity
        linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
        linkStrokeLinecap = "round", // link stroke linecap
        linkStrength = undefined,
        colors = d3.schemeTableau10, // an array of color strings, for the node groups
        invalidation = undefined // when this promise resolves, stop the simulation
    } = {}) {
        // Compute values.
        const N = d3.map(nodes, nodeId).map(intern);
        const LS = d3.map(links, linkSource).map(intern);
        const LT = d3.map(links, linkTarget).map(intern);
        if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
        const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
        const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
        const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);

        // Replace the input nodes and links with mutable objects for the simulation.
        nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
        links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));

        // Compute default domains.
        if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

        // Construct the scales.
        const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

        // Construct the forces.
        const forceNode = d3.forceManyBody();
        const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
        if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
        if (linkStrength !== undefined) forceLink.strength(linkStrength);

        const simulation = d3.forceSimulation(nodes)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("center", d3.forceCenter())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

        const link = svg.append("g")
            .attr("stroke", linkStroke)
            .attr("stroke-opacity", linkStrokeOpacity)
            .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
            .attr("stroke-linecap", linkStrokeLinecap)
            .selectAll("line")
            .data(links)
            .join("line");

        if (W) link.attr("stroke-width", ({ index: i }) => W[i]);

        const node = svg.append("g")
            .attr("fill", nodeFill)
            .attr("stroke", nodeStroke)
            .attr("stroke-opacity", nodeStrokeOpacity)
            .attr("stroke-width", nodeStrokeWidth)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", nodeRadius)
            .call(drag(simulation));

        if (G) node.attr("fill", ({ index: i }) => color(G[i]));
        if (T) node.append("title").text(({ index: i }) => T[i]);

        function intern(value) {
            return value !== null && typeof value === "object" ? value.valueOf() : value;
        }

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

       // return Object.assign(svg.node(), { scales: { color } });
    }
}