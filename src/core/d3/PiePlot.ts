import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class PiePlot extends AbstractPlot {


    plot(data: any, raio?): Canvas {

        raio = raio || Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height) / 2
        const centro = this.viewBox.getBoxCenter().join(',')

        data = data || { a: 9, b: 20, c: 30, d: 8, e: 12 };
        var pie = d3.pie().value(d => d[1])
        var data_ready = pie(Object.entries(data).map((d, i) => d.concat([i])))
        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(raio)

        this.svg
            .selectAll('pie')
            .data(data_ready)
            .enter()
            .append("g")
            .attr("transform", `translate(${centro})`)
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', x => d3.interpolateRainbow(x.data[2] / data_ready.length))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.8)

        this.svg
            .selectAll('pielabs')
            .data(data_ready)
            .enter()
            .append("g")
            .attr("transform", `translate(${centro})`)
            .append('text')
            .text(d => d.data[0])
            .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("alignment-baseline", 'middle')
            .style("font-size", 17)

        return this;
    }

}