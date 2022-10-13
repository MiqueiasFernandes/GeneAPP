import { Canvas } from "./Canvas";
import { ViewBox } from "./Size";

export abstract class AbstractPlot extends Canvas {
    title: string;
    color = (d) => 'black';

    setColor(fn): AbstractPlot {
        this.color = fn;
        return this;
    }

    setTitle(t: string) {
        this.title = t;
        return this;
    }

    setCanvas(canvas: Canvas, viewBox?: ViewBox): AbstractPlot {
        this.plotOn(canvas, viewBox, this.title || 'plot');
        return this;
    }

    abstract plot(data: any): Canvas;
}

export abstract class AbstractCartesianPlot extends AbstractPlot {

    x_var: string;
    y_var: string;
    y_lim: number[];

    setX(x_var: string): AbstractCartesianPlot {
        this.x_var = x_var;
        return this;
    }

    setY(y_var: string): AbstractCartesianPlot {
        this.y_var = y_var;
        return this;
    }

    setYlim(y_lim: number[]): AbstractCartesianPlot {
        this.y_lim = y_lim;
        return this;
    }

    abstract plot(data: any): Canvas;
}