import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class Heatmap extends AbstractCartesianPlot {

    plot(data, lab_Conv = (x) => x): Canvas {

        const C = d3.interpolatePlasma
        // this.rect(this.viewBox.getBoxX0(), this.viewBox.getBoxY0(),
        //     this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height, 'white')

        const xs = [...new Set(data.map(d => d.x))].sort()
        const ys = [...new Set(data.map(d => d.y))]

        const X = d3.scaleBand()
            .domain(xs)
            .range([0, this.viewBox.getBoxSize().width]);

        const Y = d3.scaleBand()
            .domain(ys)
            .range([this.viewBox.getBoxSize().height, 0]);

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisLeft(Y));


        this.svg
            .append("g")
            .selectAll("heats")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => this.viewBox.getBoxX0() + X(d.x))
            .attr("y", d => this.viewBox.getBoxY0() + Y(d.y))
            .attr("width", d => X.bandwidth())
            .attr("height", d => Y.bandwidth())
            .attr("fill", d => C(d.op))


        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .text(k => lab_Conv(k))
            ;


        return this;
    }
}