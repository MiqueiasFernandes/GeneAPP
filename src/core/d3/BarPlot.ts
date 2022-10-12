import * as d3 from "d3";
import { Canvas } from "./Canvas";
import { InlineDataSet } from "./DataSet";
import { IPlot } from "./IPlot";

export class BarPlot extends Canvas implements IPlot<InlineDataSet> {

    private x_var: string;
    private y_var: string;
    private y_lim: number[];
    private fill = (x) => "#69b3a2";

    setX(x_var: string): BarPlot {
        this.x_var = x_var;
        return this;
    }

    setY(y_var: string): BarPlot {
        this.y_var = y_var;
        return this;
    }

    setYlim(y_lim: number[]): BarPlot {
        this.y_lim = y_lim;
        return this;
    }

    setFill(fn): BarPlot {
        this.fill = fn;
        return this;
    }

    plot(dataSet: InlineDataSet, gap = .15): Canvas {

        // eixo X
        const vars = dataSet.data.map(x => x[this.x_var]).sort();
        const X = d3.scaleBand()
            .range([this.viewBox.getX(), this.viewBox.getX1()])
            .domain(vars)
            .padding(gap);

        this.svg
            .append('g')
            .attr("transform", `translate(0,${this.viewBox.getY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // eixo Y
        const ylim = dataSet.range(this.y_var)
        const y_start = this.y_lim ? this.y_lim[0] : (ylim[0] - Math.log10(ylim[0]));
        const y_end = this.y_lim ? this.y_lim[1] : (ylim[1] + Math.log10(ylim[1]));

        const Y = d3.scaleLinear()
            .domain([y_start, y_end])
            .range([this.viewBox.getY1(), this.viewBox.getY()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getX()},0)`)
            .call(d3.axisLeft(Y));


        // barras
        this.svg
            .append("g")
            .selectAll("mybar")
            .data(dataSet.data)
            .enter()
            .append("rect")
            .attr("x", d => X(d[this.x_var]))
            .attr("y", d => Y(d[this.y_var]))
            .attr("width", X.bandwidth())
            .attr("height", d => this.viewBox.getBox().height - (Y(d[this.y_var]) - this.viewBox.getY()))
            .attr("fill", this.fill);

        return this;
    }

}