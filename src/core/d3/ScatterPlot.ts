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
    form: string
    categoria: string
    p = (x = this.size / 15) => ['M', 15 * x, '0 L', -x * 5, 20 * x * 2, 'L', 25 * x * 1.5, 20 * x * 2, 'Z'].join(' ')

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'black'
        this.form = 'o'
        this.size = 2
        this.categoria = '?'
    }

    setColor(c) {
        this.color = c;
        return this;
    }
    setSize(s) {
        this.size = s;
        return this;
    }
    setForm(f) {
        this.form = f;
        return this;
    }
    setP(p) {
        this.form = p;
        return this;
    }
}

export class ScatterPlot extends AbstractCartesianPlot {

    plot(data: Point[]): Canvas {

        const X = d3.scaleLinear()
            .domain(this.x_lim || d3.extent(data.map(d => d.x)))
            .range([0, this.viewBox.getBoxSize().width]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X));

        const Y = d3.scaleLinear()
            .domain(this.y_lim || d3.extent(data.map(d => d.y)))
            .range([this.viewBox.getBoxSize().height, 0]);

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisLeft(Y));

        this.svg
            .append("g")
            .selectAll("pontos")
            .data(data.filter(d => !d.form || d.form === 'o'))
            .enter()
            .append("circle")
            .attr('cx', d => this.viewBox.getBoxX0() + X(d.x))
            .attr('cy', d => this.viewBox.getBoxY0() + Y(d.y))
            .attr('r', d => d.size)
            .attr("fill", d => d.color);

        this.svg
            .append("g")
            .selectAll("rects")
            .data(data.filter(d => d.form === 'x'))
            .enter()
            .append("rect")
            .attr("x", d => this.viewBox.getBoxX0() + X(d.x) - d.size)
            .attr("y", d => this.viewBox.getBoxY0() + Y(d.y) - d.size)
            .attr("width", d => d.size * 2)
            .attr("height", d => d.size * 2)
            .attr("fill", d => d.color);

        this.svg
            .append("g")
            .selectAll("paths")
            .data(data.filter(d => d.form === 'w'))
            .enter()
            .append("path")
            .attr("d", d => d.p())
            .attr("transform", d => `translate(${X(d.x) - d.size},${Y(d.y) - d.size})`)
            .attr("fill", d => d.color);

        return this;
    }
}