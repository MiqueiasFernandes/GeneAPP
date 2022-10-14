import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class RadarPlot extends AbstractPlot {


    fill = (d) => 'yellow';

    setFill(fn) {
        this.fill = fn;
        return this;
    }

    plot(data: any, dom?: number[]): Canvas {

        const vals = Object.values(data).map(v => Object.entries(v)).reduce((a, b) => b.concat(a));

        const eixos =
            [...new Set(Object.values(data).map(v => Object.keys(v)).reduce((a, b) => b.concat(a)))]
                .map((e, i, a) => [e, Math.PI * 2 / a.length * i - Math.PI / 2]) /// voltar 1/2 pi
                .map(e => e.concat([Math.cos(e[1]), Math.sin(e[1])]))
                .map(e => e.concat([
                    dom ? dom[0] : Math.min(...vals.filter(x => x[0] === e[0]).map(x => x[1])),
                    dom ? dom[1] : Math.max(...vals.filter(x => x[0] === e[0]).map(x => x[1]))
                ]))
                .map(e => e.concat([e[5] - e[4]]));

        const centroX = this.viewBox.getBoxCenter()[0];
        const centroY = this.viewBox.getBoxCenter()[1];


        const raio_lab = Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height) / 2;
        const raio = raio_lab - 10;

        const vars = Object.keys(data).map(k => ({ tipo: k, d: [] }));

        eixos.forEach(e => {
            const x = centroX + e[2] * raio
            const y = centroY + e[3] * raio
            this.line(centroX, centroY, x, y, 'lightgray');
            this.text(centroX + e[2] * raio_lab, centroY + e[3] * raio_lab, e[0], { hc: Math.abs(x - centroX) < 10, hco: x < (centroX - 10) ? 'end' : null, fs: '.7rem' })
            vars.forEach(v => v.d.push([centroX + e[2] * (data[v.tipo][e[0]] - e[4]) / e[6] * raio, centroY + e[3] * (data[v.tipo][e[0]] - e[4]) / e[6] * raio]))
        })

        vars.forEach((v, i) => this.path(' M ' + v.d.map(xy => `${xy[0]},${xy[1]} `).join(' L ') + ' Z', this.fill(v.tipo), 2, this.fill(v.tipo)).attr('opacity', '.4'))



        return this;
    }




}