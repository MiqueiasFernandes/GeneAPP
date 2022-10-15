import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class ViolinPlot extends AbstractPlot {


    plot(data: number[], start = 0, end?, fs = 10, tick = 50): Canvas {

        const dom = this.dom(data, start, end);
        const y_start = dom[0];
        const y_end = dom[1];

        const Y = d3.scaleLinear()
            .domain([y_start, y_end])
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));

        var kde = this.kernelDensityEstimator(this.kernelEpanechnikov(fs), Y.ticks(tick));

        const freqs = kde(data);

        const w = this.viewBox.getBoxSize().width / 2;
        const maxFreq = this.dom(freqs.map(x => x[1]))[1]
        var xNum = d3.scaleLinear()
            .range([-w, w])
            .domain([-maxFreq, maxFreq])

        this.svg
            .selectAll("myViolin")
            .data([freqs])
            .enter()
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxCenter()[0]},0)`)
            .append("path")
            .style("stroke", "none")
            .style("fill", this.color(null))
            .attr("d", d3.area()
                .x0(d => xNum(-d[1]))
                .x1(d => xNum(d[1]))
                .y(d => Y(d[0]))
                .curve(d3.curveCatmullRom)
            )

        this.text(this.viewBox.getBoxCenter()[0], this.viewBox.getBoxY0() - 15, this.title, { hc: 1, b: 1, fs: '.8rem' })

        return this;
    }


    kernelDensityEstimator = (kernel, X) => (V) => X.map((x) => [x, d3.mean(V, function (v) { return kernel(x - v); })])
    kernelEpanechnikov = (k) => (v) => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;


}