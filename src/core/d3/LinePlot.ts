import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class LinePlot extends AbstractCartesianPlot {

    plotX(data) {
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
        return X

    }

    plotY(data) {

        const Y = d3.scaleLinear()
            .domain(d3.extent(data.map(x => x[this.y_var])))
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));
        return Y
    }

    plot(data: any[]): Canvas {
        const X = this.plotX(data)
        const Y = this.plotY(data)

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


export class LinesPlot extends LinePlot {
    plot(data: any[], disting?): Canvas {

        const all = Object.values(data).reduce((p, c) => p.concat(c), []);
        const X = this.plotX(all);
        const Y = this.plotY(all);


        Object.entries(data).forEach(e => {
            const k = e[0]
            const dt = e[1]
const cor = d3.interpolateCool(Math.random())
            const sorted_data = dt.map(x => [x[this.x_var], x[this.y_var]]).sort((a, b) => a[0] - b[0]);
            const lim = sorted_data.length - 1
            sorted_data.forEach((d, i) => {
                if (i >= lim)
                    return;
                const x0 = d[0];
                const x1 = sorted_data[i + 1][0];
                const y0 = d[1];
                const y1 = sorted_data[i + 1][1];
                this.svg.append("path")
                    .attr("stroke", cor)
                    .datum([[x0, y0], [x1, y1]])
                    .attr("stroke-width", 2)
                    .attr("d", 
                    d3.line().curve(d3.curveCatmullRom)
                        .x((d) => X(d[0]))
                        .y((d) => Y(d[1]))
                    )
            })

        });


        return this;
    }
}