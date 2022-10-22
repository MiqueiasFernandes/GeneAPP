import * as d3 from "d3";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class FunilPlot extends AbstractCartesianPlot {

    plot(data): Canvas {
        data = data.sort((a, b) => a.value - b.value)
        const prop = (this.viewBox.getBoxSize().width * .8) / data[data.length - 1].value;


        const X = this.viewBox.getBoxCenter()[0]
        const Y = this.viewBox.getBoxY0();
        const h = this.viewBox.getBoxSize().height / (data.length + 1)

        data.forEach((step, i) => {
            const y = Y + h * (data.length - i) - h / 2;
            this.rect(
                X - step.value * prop / 2,
                y,
                step.value * prop,
                h + 5,
                d3.interpolateCool(Math.random()),
                5)
                .attr('filter', 'drop-shadow( 0px 3px 3px rgba(0, 0, 0, .3))')

            this.text(X, y + h / 2, step.value, { hc: 1, vc: 1, b: 1, fs: '1rem', c: 'white' })
                .attr('filter', 'drop-shadow( 0px 3px 4px rgba(0, 0, 0, .3))')
            this.text(X, y + h / 1.2, step.name, { hc: 1, vc: 1, b: 1, fs: '.7rem', c: 'darkgray' })
        });

        return this;
    }
}