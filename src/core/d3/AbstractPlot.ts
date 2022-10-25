import { Arquivo } from "../utils/Arquivo";
import { Canvas } from "./Canvas";
import { ViewBox } from "./Size";

export abstract class AbstractPlot extends Canvas {
    title: string;
    show_ax = true;
    color = (d?) => 'black';

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

    dom(obs: number[], a?, b?) {
        const lim = [Math.min(...obs), Math.max(...obs)];
        const marg = Math.pow(10, Math.floor(Math.log10(Math.max(lim[1], Math.abs(lim[0])))));
        return [a || (lim[0] - marg), b || (lim[1] + marg)];
    }

    hidleAx() {
        this.show_ax = false;
        return this;
    }

    baixar(nome?: string) {
        Arquivo.download(nome || 'grafico.svg', super.download(), 'image/svg+xml');
    }

    abstract plot(data: any): Canvas;
}

export abstract class AbstractCartesianPlot extends AbstractPlot {

    x_var: string;
    y_var: string;
    y_lim: number[];
    x_lim: number[];

    setX(x_var: string): AbstractCartesianPlot {
        this.x_var = x_var;
        return this;
    }

    setY(y_var: string): AbstractCartesianPlot {
        this.y_var = y_var;
        return this;
    }

    setXlim(x_lim: number[]): AbstractCartesianPlot {
        this.x_lim = x_lim;
        return this;
    }
    setYlim(y_lim: number[]): AbstractCartesianPlot {
        this.y_lim = y_lim;
        return this;
    }

    abstract plot(data: any): Canvas;
}