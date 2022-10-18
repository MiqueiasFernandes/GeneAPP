import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class BarPlot extends AbstractCartesianPlot {

    title: string = "BarPlot";

    y2_var: string;
    y_lim2: number[];
    color2 = (d) => this.color(d);
    y2lab = (x) => x;

    setColor2(fn) {
        this.color2 = fn;
        return this;
    }

    set_ylim2(a, b) {
        this.y_lim2 = [a, b];
        return this;
    }

    setY2(y2_var: string) {
        this.y2_var = y2_var;
        return this
    }

    set_y2lab(y2l) {
        this.y2lab = y2l;
        return this;
    }

    plot(data: any[], gap = .15, fnS = (a, b) => a[1] - b[1]): Canvas {

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

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},0)`)
            .call(d3.axisLeft(Y));


        // barras y1
        this.svg
            .append("g")
            .selectAll("barras1")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => X(d[this.x_var]))
            .attr("y", d => Y(d[this.y_var]))
            .attr("width", X.bandwidth() / (this.y2_var ? 2 : 1))
            .attr("height", d => this.viewBox.getBoxSize().height - (Y(d[this.y_var]) - this.viewBox.getBoxY0()))
            .attr("fill", this.color);

        if (!this.y2_var) return this;

        const ylim2 = [0, this.dom(data.map(x => x[this.y2_var]), this.y_lim2 ? this.y_lim2[0] : null, this.y_lim2 ? this.y_lim2[1] : null)[1]];
        const y_start2 = ylim2[0];
        const y_end2 = ylim2[1];

        const Y2 = d3.scaleLinear()
            .domain([y_start2, y_end2])
            .range([this.viewBox.getBoxY1(), this.viewBox.getBoxY0()]);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX1()},0)`)
            .call(d3.axisRight(Y2));

        // barras y2
        this.svg
            .append("g")
            .selectAll("barras2")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => X(d[this.x_var]) + X.bandwidth() / 2)
            .attr("y", d => Y2(d[this.y2_var]))
            .attr("width", X.bandwidth() / 2)
            .attr("height", d => this.viewBox.getBoxSize().height - (Y2(d[this.y2_var]) - this.viewBox.getBoxY0()))
            .attr("fill", this.color);

        return this;
    }

    legend(ly1: { c: string, t: string }, ly2?: { c: string, t: string }, pt = 0) {
        this.rect(this.viewBox.getBoxX0(), this.viewBox.getBoxY1() + 10 + pt, 10, 10, ly1.c)
        this.text(this.viewBox.getBoxX0() + 12, this.viewBox.getBoxY1() + 15 + pt, ly1.t, { fs: '.8rem', vc: 1, vco: 'central' })
        ly2 && this.rect(this.viewBox.getBoxX0() + 100, this.viewBox.getBoxY1() + 10 + pt, 10, 10, ly2.c)
        ly2 && this.text(this.viewBox.getBoxX0() + 112, this.viewBox.getBoxY1() + 15 + pt, ly2.t, { fs: '.8rem', vc: 1, vco: 'central' })
    }

}

export class BarPlotVertical extends BarPlot {

    plot(data: any[], gap = .15, fnS = (a, b) => a[1] - b[1]): Canvas {

        const vars = data.map(x => [x[this.x_var], x[this.y_var]]).sort(fnS).map(x => x[0]);
        const Y = d3.scaleBand()
            .range([0, this.viewBox.getBoxSize().height])
            .domain(vars)
            .padding(gap);

        this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisLeft(Y));

        const xlim = [0, d3.max(data.map(x => x[this.y_var]))];
        const x_start = 0;
        var x_end = this.y_lim ? this.y_lim[1] : (xlim[1] + Math.pow(10, Math.floor(Math.log10(xlim[1]))));

        const xlim2 = [0, this.y2_var ? d3.max(data.map(x => x[this.y2_var])) : 0];
        const x_start2 = 0;
        var x_end2 = this.y_lim2 ? this.y_lim2[1] : (xlim2[1] + Math.pow(10, Math.floor(Math.log10(1 + xlim2[1]))));
        x_end = x_end2 = Math.max(x_end, x_end2)

        const X = d3.scaleLinear()
            .domain([x_start, x_end])
            .range([0, this.viewBox.getBoxSize().width]);

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY1()})`)
            .call(d3.axisBottom(X))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // barras y1
        this.svg
            .append("g")
            .selectAll("barras1")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => this.viewBox.getBoxX0())
            .attr("y", d => this.viewBox.getBoxY0() + Y(d[this.x_var]))
            .attr("width", d => X(d[this.y_var]))
            .attr("height", d => Y.bandwidth() / (this.y2_var ? 2 : 1))
            .attr("fill", this.color)

        this.svg
            .append("g")
            .selectAll("labbarras1")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => this.viewBox.getBoxX0() + 5 + X(d[this.y_var]))
            .attr("y", d => this.viewBox.getBoxY0() + Y(d[this.x_var]) + Y.bandwidth() / (this.y2_var ? 4 : 2))
            .text(d => d[this.y_var])
            .attr("alignment-baseline", "middle")
            .attr("font-size", ".8rem");

        if (!this.y2_var) return this;


        const X2 = d3.scaleLinear()
            .domain([x_start2, x_end2])
            .range([0, this.viewBox.getBoxSize().width]);

        this.show_ax && this.svg
            .append("g")
            .attr("transform", `translate(${this.viewBox.getBoxX0()},${this.viewBox.getBoxY0()})`)
            .call(d3.axisTop(X2))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "start");

        // barras y2
        this.svg
            .append("g")
            .selectAll("barras2")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => this.viewBox.getBoxX0())
            .attr("y", d => this.viewBox.getBoxY0() + Y.bandwidth() / 2 + Y(d[this.x_var]))
            .attr("width", d => X(d[this.y2_var]))
            .attr("height", d => Y.bandwidth() / (this.y2_var ? 2 : 1))
            .attr("fill", this.color2);


        this.svg
            .append("g")
            .selectAll("labbarras1")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => this.viewBox.getBoxX0() + 5 + X(d[this.y2_var]))
            .attr("y", d => this.viewBox.getBoxY0() + Y(d[this.x_var]) + Y.bandwidth() / 1.25)
            .text(d => d[this.y2_var])
            .attr("alignment-baseline", "middle")
            .attr("font-size", ".8rem");


        return this;
    }

}

export class BarPlotRadial extends BarPlot {

    title: string = "BarPlotRadial";

    y3_var: string;
    y_lim3: number[];
    color3 = (d) => this.color(d);

    setColor3(fn) {
        this.color3 = fn;
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