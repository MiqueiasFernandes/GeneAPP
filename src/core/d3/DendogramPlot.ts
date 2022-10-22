import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class DendogramPlot extends AbstractCartesianPlot {

    plot(data): Canvas {

        const outerRadius = Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height) / 2;
        const innerRadius = Math.floor(outerRadius * .7);
        const svg = this.svg.append('g')
            .attr("transform", `translate(${this.viewBox.getBoxCenter().join()})`)

        var root = d3.hierarchy(data, d => d.branchset).sum(d => d.branchset ? 0 : 1)
            .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

        d3.cluster()
            .size([360, innerRadius])
            .separation((a, b) => 1)(root)

        const maxLength = d => d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
        const setRadius = (d, y0, k) => {
            d.radius = (y0 += d.data.length) * k;
            if (d.children) d.children.forEach(d => setRadius(d, y0, k));
        }

        setRadius(root, root.data.length = 0, innerRadius / maxLength(root));

        const linkStep = (startAngle, startRadius, endAngle, endRadius) => {
            const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
            const s0 = Math.sin(startAngle);
            const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
            const s1 = Math.sin(endAngle);
            return "M" + startRadius * c0 + "," + startRadius * s0
                + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
                + "L" + endRadius * c1 + "," + endRadius * s1;
        }

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.25)
            .selectAll("path")
            .data(root.links().filter(d => !d.target.children))
            .join("path")
            .each(function (d) { d.target.linkExtensionNode = this; })
            .attr("d", d => linkStep(d.target.x, d.target.y, d.target.x, innerRadius));

        const linkConstant = d => linkStep(d.source.x, d.source.y, d.target.x, d.target.y);

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .selectAll("path")
            .data(root.links())
            .join("path")
            .each(function (d) { d.target.linkNode = this; })
            .attr("d", linkConstant)
            .attr("stroke", d => d.target.color);

        svg.append("g")
            .selectAll("text")
            .data(root.leaves())
            .join("text")
            .attr("dy", ".31em")
            .attr("transform", d => `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}`)
            .attr("text-anchor", d => d.x < 180 ? "start" : "end")
            .style('font-size', '.4rem')
            .text(d => d.data.name.replace(/_/g, " "))

        return this;
    }
}


