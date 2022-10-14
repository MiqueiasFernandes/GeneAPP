import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class VennPlot extends AbstractPlot {

    fill = (c) => 'yellow';
    setFill(fn) {
        this.fill = fn;
        return this;
    }

    plot(data: any): Canvas {

        const tipo3 = !!data.ABC;

        const w = this.viewBox.getBoxSize().width / 4;
        const h = this.viewBox.getBoxSize().height / 2;
        const ph = tipo3 ? (- h / 6) : 0;
        const R = Math.min(w, h);
        const xc = this.viewBox.getBoxCenter()[0];
        const yc = this.viewBox.getBoxCenter()[1];

        this.circ(xc - w / 2, yc + ph, R, '#5ce55c').attr('opacity', '.6')
        this.circ(xc + w / 2, yc + ph, R, '#8e8ee8').attr('opacity', '.6')
        tipo3 && this.circ(xc, yc + h / 2 + ph, R, '#f7da81').attr('opacity', '.6')

        const yt = yc + h / 20 + (tipo3 ? 0 : ph);

        this.text(xc, yt, data.ABC || data.AB, { hc: 1, });

        this.text(xc - w, yt - (tipo3 ? h / 6 : 0), data.A, { hc: 1, });
        this.text(xc + w, yt - (tipo3 ? h / 6 : 0), data.B, { hc: 1, });

        this.text(xc - w * 1.5, yt - (tipo3 ? h / 6 : 0) - h / 1.5, data.A_LAB || "A", { hc: 1, b: 1 });
        this.text(xc + w * 1.5, yt - (tipo3 ? h / 6 : 0) - h / 1.5, data.B_LAB || "B", { hc: 1, b: 1 });

        tipo3 && this.text(xc, yt - h / 3, data.AB, { hc: 1, });
        tipo3 && this.text(xc, yt + h / 2, data.C || '?', { hc: 1, });
        tipo3 && this.text(xc - w / 1.6, yt + h / 5.5, data.AC || '?', { hc: 1, });
        tipo3 && this.text(xc + w / 1.6, yt + h / 5.5, data.BC || '?', { hc: 1, });
        tipo3 && this.text(xc, yt + h * .98, data.B_LAB || "C", { hc: 1, b: 1 });
        return this;
    }



}
