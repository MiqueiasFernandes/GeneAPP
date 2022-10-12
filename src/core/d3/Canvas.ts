import * as d3 from "d3";
import { ViewBox } from "./Size";

export class Canvas {
    viewBox: ViewBox;
    elID: string;
    bg: string;
    svg: any;

    constructor(elID: string, viewBox?: ViewBox, bg?: string) {
        this.elID = elID;
        this.viewBox = viewBox;
        this.bg = bg || 'yellow';
        this.svg = d3.select(`#${elID}`).select(`svg`);
        !this.svg.empty() && this.svg.remove();
        this.svg = d3
            .select(`#${elID}`)
            .append("svg")
            .style("background", bg)
            .attr("width", viewBox.getBox().width)
            .attr("height", viewBox.getBox().height);
        this.svg = this.svg.append("g");
    }


}

