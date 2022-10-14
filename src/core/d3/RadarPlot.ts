import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class RadarPlot extends AbstractPlot {




    plot(data: any): Canvas {

        const vals = Object.values(data).map(v => Object.entries(v)).reduce((a, b) => b.concat(a));

        const eixos =
            [...new Set(Object.values(data).map(v => Object.keys(v)).reduce((a, b) => b.concat(a)))]
                .map((e, i, a) => [e, Math.PI * 2 / a.length * i])
                .map(e => e.concat([Math.cos(e[1]), Math.sin(e[1])]))
                .map(e => e.concat([
                    Math.min(...vals.filter(x => x[0] === e[0]).map(x => x[1]))-10,
                    Math.max(...vals.filter(x => x[0] === e[0]).map(x => x[1])) + 10
                ]))
                .map(e => e.concat([e[5]-e[4]]));

        console.log(eixos);

        const centroX = this.viewBox.getBoxCenter()[0];
        const centroY = this.viewBox.getBoxCenter()[1];


        const raio = Math.min(this.viewBox.getBoxSize().width, this.viewBox.getBoxSize().height)/2;

        const vars = Object.keys(data).map(k => ({ tipo: k, d: [] }));

        eixos.forEach(e => {
            const x = centroX + e[2] * raio
            const y = centroY + e[3] * raio
            this.line(centroX, centroY, x, y);
            this.text(x, y, e[0])
            vars.forEach(v => v.d.push([centroX + e[2] * (data[v.tipo][e[0]] - e[4]) / e[6] * raio, centroY + e[3] * (data[v.tipo][e[0]] - e[4]) / e[6] * raio ]))
        })

        vars.forEach((v, i) => this.path(' M ' + v.d.map(xy => `${xy[0]},${xy[1]} `).join(' L ') + ' Z', ['red', 'blue', 'green', 'white'][i]))



        return this;
    }




}