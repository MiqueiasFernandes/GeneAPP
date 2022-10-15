import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class AreaPlot extends AbstractPlot {

    plot(data: any, maxx?, order = (x) => x): Canvas {

        const categorias = order(Object.keys(data));
        const vals = categorias.map(c => data[c]);
        const plot_data = d3.transpose(vals).map(d => Object.fromEntries(categorias.map((c, i) => [c, d[i]])));
        const stackGen = d3.stack()
            .keys(categorias)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        const stack = stackGen(plot_data);


        var min_y = undefined;
        var max_y = undefined;
        stack.forEach(k => k.map(x => Math.min(x[0], x[1])).forEach(x => !min_y ? (min_y = x) : (min_y = Math.min(x, min_y))));
        stack.forEach(k => k.map(x => Math.max(x[0], x[1])).forEach(x => !max_y ? (max_y = x) : (max_y = Math.max(x, max_y))));

        const min_x = 0;
        const max_x = maxx || Math.max(...stack.map(x => x.length));

        const X = d3.scaleLinear([min_x, max_x], [0, this.viewBox.getBoxSize().width])
        const Y = d3.scaleLinear([min_y, max_y], [this.viewBox.getBoxSize().height, 0])
        //const C = d3.interpolateCool

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X));

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisLeft(Y));

        const area = d3.area()
            .x((d, i) => X(i))
            .y0(d => Y(d[0]))
            .y1(d => Y(d[1]))
            .curve(d3.curveCatmullRom)

        this.svg
            .selectAll("area")
            .data(stack)
            .enter()
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .append("path")
            .attr("d", area)
            .attr("fill", d => this.color(d))
            .style("stroke", "lightgrey")
            .style("stroke-width", "1px")

        return this;
    }
}