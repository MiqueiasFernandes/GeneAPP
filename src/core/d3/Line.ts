import * as d3 from "d3";
import { Bounds } from "./Bounds";
import { Drawable } from "./Drawable";

export class Line extends Drawable {
  
      data: any;
    constructor(
        drawable: Drawable, bounds: Bounds, data: any = {
            line1: [[1, 1], [2, 2], [3, 3]],
            line2: [[1, 2], [2, 3], [3, 2]]
        }
    ) {
        super(drawable, null, bounds, null, 'lines')
        this.data = data;
    }

    plot() {
        const vals = Object.keys(this.data).map(k => this.data[k]);

        const all_x = vals.map(x => x.map(k => k[0]).join(";")).join(";").split(';').map(x => parseFloat(x))
        const all_y = vals.map(x => x.map(k => k[1]).join(";")).join(";").split(';').map(x => parseFloat(x))


        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain(d3.extent(all_x, (d) => d))
            .range([0, this.bounds.width]);
        this.svg.append("g")
            .attr("transform", "translate(0," + this.bounds.height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain(d3.extent(all_y, (d) => d))
            .range([this.bounds.height, 0]);
        this.svg.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        Object.keys(this.data).map(k => [k, this.data[k]]).forEach(v => {
           // const tipo = v[0]
            const vals = v[1]
            this.svg.append("path")
                .datum(vals)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x( (d) => x(d[0]))
                    .y( (d) => y(d[1]))
                    )
        });

    }
}