import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class UpsetPlot extends AbstractPlot {
    plot(data: any, labs?, cs?): Canvas {

        const tipos = [... new Set(Object.keys(data).join('').split(''))].sort();
        const comb = (x) => (x >>> 0).toString(2).padStart(tipos.length, '0')
        const vars = '-'.repeat(2 ** tipos.length).split('').map((_, i) => comb(i));

        const X = d3.scaleBand()
            .range([this.viewBox.getBoxX0(), this.viewBox.getBoxX1()])
            .domain(vars)
            .padding(.3);


        this.svg
            .append('g')
            .attr("transform", `translate(0,${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .attr("transform", "translate(10,0)rotate(-45)")
            .style("text-anchor", "end")
            .attr('display', 'none');

        const raio = 7;

        tipos.forEach((tipo, i) => {


            const y = (raio * 1.9) + this.viewBox.getBoxY1() + raio * 1.9 * i
            const c = labs && cs ? cs[labs[tipo]] : 'black'

            this.svg
                .append("g")
                .selectAll("defs")
                .data(vars)
                .enter()
                .append("circle")
                .attr("cx", d => X(d) + X.bandwidth() / 2)
                .attr("cy", y)
                .attr("r", raio)
                .style("fill", d => d[i] === '1' ? c : 'lightgrey')

            this.text(this.viewBox.getBoxX0() - 5, y + raio * .2, labs ? labs[tipo] : tipo,
                { vc: 1, hc: 1, hco: 'end', fs: '.7rem', b: 1, c })

        })


        const Y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(data))])
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));


        data = Object.entries(data).map(x => [
            tipos.map(t => x[0].includes(t) ? '1' : '0').join(''),
            x[1]
        ])

        this.svg
            .append("g")
            .selectAll("barras1")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => X(d[0]))
            .attr("y", d => Y(d[1]))
            .attr("width", X.bandwidth())
            .attr("height", d => this.viewBox.getBoxSize().height - (Y(d[1]) - this.viewBox.getBoxY0()))
            .attr("fill", 'darkgray');

        return this;
    }
}