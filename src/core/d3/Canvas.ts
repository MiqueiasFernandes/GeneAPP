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

    rect(x: number, y: number, w: number, h: number, c = "black", r = 0, o = 1) {
        return this.svg
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

}

