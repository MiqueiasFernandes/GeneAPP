import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class Point {
    x: number
    y: number
    color: string
    size: number
    lab: string
    labConf: {}
    categoria: string

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'black'
        this.size = 2
        this.categoria = '?'
    }
}

export class ScatterPlot extends AbstractCartesianPlot {

    plot(data: Point[]): Canvas {

        this.rect(this.viewBox.getBoxX0(), this.viewBox.getBoxY0(),
            this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height, 'white')

        const X = d3.scaleLinear()
            .domain(d3.extent(data.map(d => d.x)))
            .range([0, this.viewBox.getBoxSize().width]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X));

        const Y = d3.scaleLinear()
            .domain(d3.extent(data.map(d => d.y)))
            .range([this.viewBox.getBoxSize().height, 0]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisLeft(Y));

        this.svg
            .append("g")
            .selectAll("pontos")
            .data(data)
            .enter()
            .append("circle")
            .attr('cx', d => this.viewBox.getBoxX0() + X(d.x))
            .attr('cy', d => this.viewBox.getBoxY0() + Y(d.y))
            .attr('r', d => d.size)
            .attr("fill", d => d.color);

        return this;
    }
}