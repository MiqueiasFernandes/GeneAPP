import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class BarPlot extends AbstractCartesianPlot {

    title: string = "BarPlot";

    plot(data: any[], gap = .15, fnS=(a,b)=>a[1]-b[1]): Canvas {

        const vars = data.map(x => [x[this.x_var], x[this.y_var]]).sort(fnS).map(x => x[0]);
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
        const y_start = 0;
        const y_end = this.y_lim ? this.y_lim[1] : (ylim[1] + Math.pow(10, Math.floor(Math.log10(ylim[1]))));

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

export class BarPlotRadial extends AbstractCartesianPlot {

    title: string = "BarPlotRadial";

    y2_var: string;
    y_lim2: number[];
    color2 = (d) => this.color(d);
    y2lab = (x) => x;

    y3_var: string;
    y_lim3: number[];
    color3 = (d) => this.color(d);

    setColor2(fn) {
        this.color2 = fn;
        return this;
    }
    setColor3(fn) {
        this.color3 = fn;
        return this;
    }

    set_ylim2(a, b) {
        this.y_lim2 = [a, b];
        return this;
    }

    setY2(y2_var: string): BarPlotRadial {
        this.y2_var = y2_var;
        return this
    }

    set_y2lab(y2l) {
        this.y2lab = y2l;
        return this;
    }

    set_ylim3(a, b) {
        this.y_lim3 = [a, b];
        return this
    }

    setY3(y3_var: string): BarPlotRadial {
        this.y3_var = y3_var;
        return this
    }

    plot(data: any): Canvas {

        const svg = this.svg.append("g");
        svg.attr("transform", `translate(${this.viewBox.getBoxCenter().join(',')})`)

        const innerRadius = Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height) / 4;
        const outerRadius = Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height) / 2;
        const padAngle = .05;
        const paddinner = .8;
        const center_lim = 5;

        const vars = data.map(x => x[this.x_var]).sort();
        var X = d3.scaleBand()
            .range([0, 2 * Math.PI])
            .align(0)
            .domain(vars);

        const ylim1 = [0, d3.max(data.map(x => x[this.y_var]))];
        const y_start1 = this.y_lim ? this.y_lim[0] : (ylim1[0] - Math.log10(d3.max([1, ylim1[0]])));
        const y_end1 = this.y_lim ? this.y_lim[1] : (ylim1[1] + Math.log10(d3.max([1, ylim1[1]])));
        var Y1 = d3.scaleRadial()
            .range([innerRadius, outerRadius])
            .domain([y_start1, y_end1]);
        svg.append("g").attr("id", "bar_y1")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", d => this.color(d))
            .attr("d", d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(d => Y1(d[this.y_var]))
                .startAngle(d => X(d[this.x_var]))
                .endAngle(d => X(d[this.x_var]) + (this.y3_var ? ((X.bandwidth() / 2) + padAngle / 2) : X.bandwidth()))
                .padAngle(padAngle)
                .padRadius(innerRadius)
            );

        if (this.y2_var) {
            const ylim2 = [0, d3.max(data.map(x => x[this.y2_var]))];
            const y_start2 = this.y_lim2 ? this.y_lim2[0] : (ylim2[0] - Math.log10(d3.max([1, ylim2[0]])));
            const y_end2 = this.y_lim2 ? this.y_lim2[1] : (ylim2[1] + Math.log10(d3.max([1, ylim2[1]])));
            var Y2 = d3.scaleRadial()
                .range([innerRadius - paddinner, center_lim])
                .domain([y_start2, y_end2]);

            svg.append("g").attr("id", "bar_y2")
                .selectAll("path")
                .data(data)
                .enter()
                .append("path")
                .attr("fill", d => this.color2(d))
                .attr("d", d3.arc()
                    .innerRadius(Y2(0))
                    .outerRadius(d => Y2(d[this.y2_var]))
                    .startAngle(d => X(d[this.x_var]))
                    .endAngle(d => X(d[this.x_var]) + X.bandwidth())
                    .padAngle(0.05)
                    .padRadius(innerRadius));
        }

        if (this.y3_var) {
            const ylim3 = [0, d3.max(data.map(x => x[this.y3_var]))];
            const y_start3 = this.y_lim3 ? this.y_lim3[0] : (ylim3[0] - Math.log10(d3.max([1, ylim3[0]])));
            const y_end3 = this.y_lim3 ? this.y_lim3[1] : (ylim3[1] + Math.log10(d3.max([1, ylim3[1]])));
            var Y3 = d3.scaleRadial()
                .range([innerRadius, outerRadius])
                .domain([y_start3, y_end3]);
            svg.append("g").attr("id", "bar_y3")
                .selectAll("path")
                .data(data)
                .enter()
                .append("path")
                .attr("fill", d => this.color3(d))
                .attr("opacity", '.6')
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(d => Y3(d[this.y3_var]))
                    .startAngle(d => X(d[this.x_var]) + (X.bandwidth() / 2) - padAngle / 2)
                    .endAngle(d => X(d[this.x_var]) + X.bandwidth())
                    .padAngle(padAngle)
                    .padRadius(innerRadius)
                )
        }

        const fnLab = (l, p, s, c) => {
            const fnPI = d => (X(d[this.x_var]) + X.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI;

            svg
                .append("g").attr("id", "labs")
                .selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("text-anchor", d => fnPI(d) ? "end" : "start")
                .attr("transform", d => `rotate(${((X(d[this.x_var]) + X.bandwidth() / 2 + (padAngle / (fnPI(d) ? -2 : +2))) * 180 / Math.PI - 90)}) translate(${(Y1(d[this.y_var]) + p)},0)`)
                .append("text")
                .text(l)
                .attr("transform", d => fnPI(d) ? "rotate(180)" : "rotate(0)")
                .style("font-size", s)
                .attr("alignment-baseline", "middle")
                .style('fill', c)
        }

        fnLab(d => d[this.x_var], -50, '.8rem', 'white');
        fnLab((d) => this.y2lab(d[this.y2_var]), -95, '.5rem', 'gray');
        this.text(this.viewBox.getBoxCenter()[0], this.viewBox.getBoxCenter()[1], this.title, { hc: 1, vc: 1, fs: '2rem', b: 1 })
        return this.svg;
    }

}