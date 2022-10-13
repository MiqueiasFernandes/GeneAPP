import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class BarPlot extends AbstractCartesianPlot {

    plot(data: any[], gap = .15): Canvas {

        const vars = data.map(x => x[this.x_var]).sort();
        const X = d3.scaleBand()
            .range([this.viewBox.getBoxX0(), this.viewBox.getBoxX1()])
            .domain(vars)
            .padding(gap);

        this.svg
            .append('g')
            .attr("transform", `translate(0,${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        const ylim = [0, d3.max(data.map(x => x[this.y_var]))];
        const y_start = this.y_lim ? this.y_lim[0] : (ylim[0] - Math.log10(d3.max([1, ylim[0]])));
        const y_end = this.y_lim ? this.y_lim[1] : (ylim[1] + Math.log10(d3.max([1, ylim[1]])));

        const Y = d3.scaleLinear()
            .domain([y_start, y_end])
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));

        // barras
        this.svg
            .append("g")
            .selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => X(d[this.x_var]))
            .attr("y", d => Y(d[this.y_var]))
            .attr("width", X.bandwidth())
            .attr("height", d => this.viewBox.getBoxSize().height - (Y(d[this.y_var]) - this.viewBox.getBoxY0()))
            .attr("fill", this.color);

        return this;
    }

}