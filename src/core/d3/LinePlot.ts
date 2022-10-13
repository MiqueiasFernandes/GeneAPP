import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class LinePlot extends AbstractCartesianPlot {

    plot(data: any[]): Canvas {

        const X = d3
            .scaleLinear()
            .domain(d3.extent(data.map(x => x[this.x_var])))
            .range([this.viewBox.getBoxX0(), this.viewBox.getBoxX1()]);

        this.svg
            .append('g')
            .attr("transform", `translate(0,${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");


        const ylim = d3.extent(data.map(x => x[this.y_var]))
        const y_start = this.y_lim ? this.y_lim[0] : (ylim[0] - Math.log10(ylim[0]));
        const y_end = this.y_lim ? this.y_lim[1] : (ylim[1] + Math.log10(ylim[1]));

        const Y = d3.scaleLinear()
            .domain([y_start, y_end])
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));

        const sorted_data = data.map(x => [x[this.x_var], x[this.y_var]]).sort((a, b) => a[0] - b[0]);
        const lim = sorted_data.length - 1
        sorted_data.forEach((d, i) => {
            if (i >= lim)
                return;
            const x0 = d[0];
            const x1 = sorted_data[i + 1][0];
            const y0 = d[1];
            const y1 = sorted_data[i + 1][1];
            this.svg.append("path")
                .datum([[x0, y0], [x1, y1]])
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x((d) => X(d[0]))
                    .y((d) => Y(d[1]))
                )
        })
        return this;

    }


}