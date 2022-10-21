import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class TreePlot extends AbstractPlot {
    plot(data: any): Canvas {

        const root = d3.stratify().path(x => x.path)(data)
        root.sum(d => Math.max(0, d ? d.value : 0))
        root.sort((a, b) => d3.descending(a.value, b.value));

        d3.treemap()
            .tile(d3.treemapBinary)
            .size([this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height])
            .paddingInner(0)
            .paddingTop(this.viewBox.getPadding().top)
            .paddingRight(this.viewBox.getPadding().right)
            .paddingBottom(this.viewBox.getPadding().bottom)
            .paddingLeft(this.viewBox.getPadding().left)
            .round(true)
            (root);

        const leaves = root.leaves();

        const node = this.svg.selectAll("a")
            .data(leaves)
            .join("a")
            .attr("xlink:href", d => d.data.link)
            .attr("target", '_blank')
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        node.append("rect")
            .attr("fill", _ => d3.interpolateCool(Math.random()))
            .attr("fill-opacity", '.6')
            .attr("stroke", 'black')
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .append("title").text(d => d.data.path);

        return this;
    }
}