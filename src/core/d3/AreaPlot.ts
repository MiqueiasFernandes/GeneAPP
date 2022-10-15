import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class AreaPlot extends AbstractPlot {


    plot(data: number[]): Canvas {
        this.rect(this.viewBox.getBoxX0(), this.viewBox.getBoxY0(), this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height)
        return this;
    }
}