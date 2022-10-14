import * as d3 from "d3";
import { ViewBox } from "./Size";

export class Canvas {
    viewBox: ViewBox;
    elID: string;
    bg: string;
    svg: any;

    constructor(elID?: string, viewBox?: ViewBox, bg?: string) {
        if (!elID)
            return;
        this.elID = elID;
        this.viewBox = viewBox;
        this.bg = bg || 'yellow';
        this.svg = d3.select(`#${elID}`).select(`svg`);
        !this.svg.empty() && this.svg.remove();
        this.svg = d3
            .select(`#${elID}`)
            .append("svg")
            .style("background", bg)
            .attr("width", viewBox.getViewSize().width)
            .attr("height", viewBox.getViewSize().height)
            .append("g");
    }

    plotOn(canvas: Canvas, viewBox?: ViewBox, name?: string): Canvas {
        this.viewBox = viewBox || this.viewBox || canvas.viewBox;
        this.elID = canvas.elID;
        this.bg = canvas.bg;
        this.svg = canvas.svg.append("g");
        name && this.svg.attr("id", name);
        return canvas;
    }

    rect(x: number, y: number, w: number, h: number, c = "black", r = 0, o = 1, svg?) {
        return (svg || this.svg)
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("rx", r || 0)
            .attr("ry", r || 0)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", c)
            .attr("opacity", o);
    }

    text(x: number, y: number, text: string, estilo: any = {}, svg?) {
        const txt = (svg || this.svg).append("text").attr("x", x).attr("y", y).text(text);
        if (estilo.b) txt.style('font-weight', 'bold')
        if (estilo.serif) txt.style('font-family', 'serif')
        if (estilo.fs) txt.style('font-size', estilo.fs)
        if (estilo.r) txt.attr('transform', `rotate(${estilo.r} ${x},${y})`)
        if (estilo.hc) txt.style('text-anchor', 'middle')
        if (estilo.vc) txt.style("alignment-baseline", 'middle')
        if (estilo.c) txt.style('fill', estilo.c)
        if (estilo.s) txt.style('stroke', estilo.s)
        return txt;
    }

    line(x1, y1, x2, y2, c = "black", sw = 2) {
        return this.svg
            .append("line")
            .style("stroke", c)
            .style("stroke-width", sw)
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2);
    }

    path(p: string, c = 'black', sw: number = 2, f = 'none') {
        this.svg
            .append("path")
            .attr("d", p)
            .attr("fill", f)
            .attr("stroke", c)
            .attr("stroke-width", sw);
    }

}

