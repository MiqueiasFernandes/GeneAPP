import * as d3 from "d3";
import { AbstractPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";

export class WordCloudPlot extends AbstractPlot {

    plot(data: string[]): Canvas {

        const MIN = 4
        const MED = 6
        const MAX = 9

        data = data.map(word => {
            var w = word.trim().replace(/^\W|\W+$/g, '').replace(/^\d+$/g, '');

            w.indexOf('(') > 0 && w.indexOf(')') < 0 && (w = w.replace('(', ''))
            w.indexOf(')') > 0 && w.indexOf('(') < 0 && (w = w.replace(')', ''))

            w.indexOf('[') > 0 && w.indexOf(']') < 0 && (w = w.replace('[', ''))
            w.indexOf(']') > 0 && w.indexOf('[') < 0 && (w = w.replace(']', ''))

            w.indexOf('{') > 0 && w.indexOf('}') < 0 && (w = w.replace('{', ''))
            w.indexOf('}') > 0 && w.indexOf('{') < 0 && (w = w.replace('}', ''))

            return w.toUpperCase();
        }).filter(w => w.length >= MIN && w.length <= MAX)

        var words = [...new Set(data)];
        const wconts = Object.fromEntries(words.map(w => [w,
            { word: w, len: w.length, count: Math.log2(data.filter(x => x === w).length + 1) }
        ]))

        const qtd = 1

        const rows = parseInt('' + 20 * qtd)
        const cols = parseInt('' + 10 * qtd)
        words = words.sort((b, a) => wconts[a].count - wconts[b].count).slice(0, rows * cols).sort()
        const menor = words.map(w => wconts[w].count).reduce((p, c) => p ? Math.min(p, c) : c)
        const maior = words.map(w => wconts[w].count).reduce((p, c) => Math.max(p, c), 0)
        const base = maior - menor;

        var w = 0;
        var col_sz = this.viewBox.getBoxSize().width / cols;
        var row_sz = this.viewBox.getBoxSize().height / rows;

        for (let r = 0; r < rows && w < words.length; r++) {
            for (let c = 0; c < cols && w < words.length; c++) {
                const dw = wconts[words[w++]]
                const x = this.viewBox.getBoxX0() + (col_sz / 2) + (c * col_sz)
                const y = this.viewBox.getBoxY0() + (row_sz / 2) + (r * row_sz)
                this.text(
                    x,
                    y,
                    dw.word, {
                    mono: 0, hc: 1, vc: 1,
                    b: dw.len === MIN,
                    fs: dw.len > MED ? '.6rem' : '.9rem',
                    c: d3.interpolatePlasma((dw.count - menor) / base)
                })
                    .attr('id', `_W_${r}_${c}_`)
                    .attr('letter-spacing', dw.len > MED - 1 ? '-1.5' : '-1.2')
                    .attr('opacity', '.6')
                    .style('cursor', 'pointer')
                    .attr("transform", `rotate(${(Math.random() - .5) * 20},${x},${y})`)
                    .on('mouseover', function () {
                        d3.select(this)
                            .attr('opacity', '.9')
                            .attr('letter-spacing', 'unset')
                            .style('font-size', '2rem')
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .attr('opacity', '.6')
                            .attr('letter-spacing', dw.len > MED - 1 ? '-1.5' : '-1.2')
                            .style('font-size', dw.len > MED ? '.6rem' : '.9rem')
                    })
            }
        }

        return this;
    }
}