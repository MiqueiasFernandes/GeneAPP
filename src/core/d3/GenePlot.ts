import * as d3 from "d3";
import { CDS, Exon, Gene, Intron, Isoforma, Locus, Projeto } from "../model";
import { AbstractPlot } from "./AbstractPlot";
import { AreaPlot } from "./AreaPlot";
import { Canvas } from "./Canvas";
import { Padding, ViewBox } from "./Size";

export class GenePlot extends AbstractPlot {

    plotExon(exon: Exon, viewBox: ViewBox, R) {
        const [X, W, Y, _, H] = this.getPoints(exon, R, viewBox).concat([15]);
        const rct = this.rect(X, Y, W, H, 'blue', 8)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
        rct.append("title").text(exon.nome)
        this.fillGradient(rct, 'green')
    }

    plotCDS(cds: Locus, viewBox: ViewBox, R) {
        const [X, W, Y, _, H] = this.getPoints(cds, R, viewBox).concat([11]);
        const rct = this.rect(X, Y + 1, W, H + 2, 'blue', 5)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
        rct.append("title").text(cds.nome)
        this.fillGradient(rct, 'blue')
    }

    plotDomain(locus: Locus, viewBox: ViewBox, R) {
        const [X, W, Y, _, H] = this.getPoints(locus, R, viewBox).concat([11]);
        const rct = this.rect(X, Y + 1, W, H + 2, 'blue', 5)
        rct.append("title").text(locus.nome)
        this.fillPattern(rct, 'cyan', 2)
    }

    plotIntron(intron: Intron, viewBox: ViewBox, R) {
        const [X, W, Y, _, H] = this.getPoints(intron, R, viewBox).concat([15]);
        this.wave(X, Y + 3, W, 'black', 4).append("title").text(intron.nome)
    }

    plotIsoform(projeto: Projeto, isoform: Isoforma, viewBox: ViewBox, R) {
        const [X, W, Y, H] = this.getPoints(isoform, R, viewBox);
        const xt = this.plotTPM(projeto, X, Y + 5, isoform.meta['MRNA'], false, 15, 10)
        this.text(xt + 6, Y + 7, isoform.meta['NID'] || isoform.nome, { vc: 1, fs: '.6rem', b: 1 })

        isoform.getIntrons().forEach(i => this.plotIntron(i, viewBox.addPaddingY(20), R))
        isoform.getExons().forEach(e => this.plotExon(e, viewBox.addPaddingY(20), R))
        isoform.hasCDS() && isoform.getCDS().getLoci().forEach(cds => this.plotCDS(cds, viewBox.addPaddingY(20), R))
        isoform.getAnots().forEach(a => a.toLoci(isoform).forEach(l => this.plotDomain(l, viewBox.addPaddingY(20), R)))
    }

    plotTPM(projeto, x, y, id, gene = true, paddingX = 5, dm = 16) {
        const ro = dm / 2
        const ttpm = (t) => t[1] > 0 ? `(${t[1]}) TPM μ ${t[0]}` : ` ${id} ?`
        var x;
        if (projeto) {
            const tpmC = projeto.getCtrl().getTPM(id, gene)
            const tpmT = projeto.getTrat().getTPM(id, gene)

            this.circ(paddingX + x, y + ro / 2, ro, 'white').attr('stroke', 'black')
            this.circ(paddingX + x, y + ro / 2, ro, projeto.getCtrl().cor)
                .attr('opacity', tpmC[0] > tpmT[0] ? 1 : .3)
                .append("title").text(ttpm(tpmC))

            this.circ(paddingX + 3 + x + dm, y + ro / 2, ro, 'white').attr('stroke', 'black')
            this.circ(x = (paddingX + 3 + x + dm), y + ro / 2, ro, projeto.getTrat().cor)
                .attr('opacity', tpmT[0] > tpmC[0] ? 1 : .3)
                .append("title").text(ttpm(tpmT))
        }
        return x + 3;
    }

    plotLocus(gene: Locus, l: Locus, viewBox: ViewBox, R) {
        l = l.copy();
        l.start = Math.max(gene.start, l.start)
        l.end = Math.min(gene.end, l.end)
        l.strand = gene.strand
        const [X, W, _, __] = this.getPoints(l, R, viewBox);
        this.wave(X, viewBox.getBoxY1() - 100, W, 'orangered', 2).append("title").text(l.nome)
    }

    plotBED(R, gene: Gene, viewBox: ViewBox, projeto) {
        console.log()
        const dt = {}
        Object.entries(gene.getBED()).forEach(([E, D]) => {
            const dx = []
            for (let i = 0; i <= gene.size; i++) {
                dx.push(0)
            }
            D.sort((a, b) => a[0] - b[0]).forEach((x, k, a) => {
                for (let i = x[0]; i < ((k < a.length - 1) ? (a[k + 1][0] - 1) : x[1]); i++)
                    dx[i] = x[2]
            })
            dt[E] = dx
        })
        new AreaPlot()
            .stroke(.1)
            .setCanvas(this, viewBox.toPadding(new Padding(viewBox.getBoxSize().height - 85, 0, 0, 0)))
            .setColor(d => projeto.getFatorBySample(d.key).cor)
            .hidleAx()
            .plot(dt)
    }

    getX0 = (l: Locus, R) => R(l.strand ? l.start : l.end)
    getX1 = (l: Locus, R) => R(l.strand ? l.end : l.start)
    getW = (l: Locus, R) => this.getX1(l, R) - this.getX0(l, R)
    getPoints = (l: Locus, R, v: ViewBox) => [this.getX0(l, R), this.getW(l, R), v.getBoxY0(), v.getBoxSize().height]

    plot(gene: Gene, projeto?: Projeto): Canvas {
        if (!gene) return

        const viewBox = this.viewBox.addPadding(15, 5).center();
        const GH = 40
        const boxGene = viewBox.withHeight(GH)

        const R = d3
            .scaleLinear()
            .domain([gene.start, gene.end])
            .range(gene.strand ?
                [boxGene.getBoxX0(), boxGene.getBoxX1()] :
                [boxGene.getBoxX1(), boxGene.getBoxX0()]);

        this.svg
            .append('g')
            .attr("transform", `translate(0,${boxGene.getBoxY0() + GH * .4})`)
            .call(d3.axisTop(R))
            .selectAll("text")
            .attr('font-size', '.5rem');

        if (gene.isAS()) {
            gene.getCanonic().getSites().forEach(s => {
                const rct = this.rect(this.getX0(s, R), boxGene.getBoxY1() + 13, this.getW(s, R), viewBox.getBoxSize().height - 52)
                this.fillPattern(rct, 'gray')
            })
        }

        const gnY = boxGene.getBoxY0() + GH * .7
        const xt = this.plotTPM(projeto, boxGene.getBoxX0(), gnY, gene.meta['NID'], true, 15)
        this.text(xt + 10, gnY + 4, gene.meta['NID'], { vc: 1, fs: '.8rem', b: 1 })
        this.text(boxGene.getBoxX0() - 13, boxGene.getBoxY0() + 20, gene.strand ? "5'" : "3'", { fs: '.6rem', b: 1, o: .5 })
        this.text(boxGene.getBoxX1() + 5, boxGene.getBoxY0() + 20, gene.strand ? "3'" : "5'", { fs: '.6rem', b: 1, o: .5 })

        const regua = this.line({ v: 0, y1: boxGene.getBoxY0() + 10, y2: viewBox.getBoxY1() + 5, c: "gray", x1: null, x2: null, h: null });
        const ctext = this.text(0, boxGene.getBoxY1() + 10, '').attr('font-size', '.5rem')
        const RM = 2
        const RW = boxGene.getBoxSize().width + RM * 2
        const pbPpx = gene.size / RW
        this.rect(boxGene.getBoxX0() - RM, boxGene.getBoxY0() + GH * .3, RW, 8)
            .on('mousemove', coord => {
                regua &&
                    regua.attr("x1", coord.offsetX) &&
                    regua.attr("x2", coord.offsetX) &&
                    ctext.attr("transform",
                        `translate(${coord.offsetX + (coord.offsetX > boxGene.getBoxSize().width / 2 ? -5 : 5)},0)`)
                        .text(Math.floor((gene.strand ? gene.start : gene.end) + ((coord.offsetX - 3 * RM - 6) * pbPpx * (gene.strand ? 1 : -1))).toLocaleString())
                        .style('text-anchor', coord.offsetX > boxGene.getBoxSize().width / 2 ? 'end' : 'start')
            })

        const boxes = viewBox.addPaddingY(GH + 10).toPadding(new Padding(0, 0, projeto ? 100 : 0, 0)).splitY(gene.getIsoformas().length)
        gene.getIsoformas().forEach((iso, i) => this.plotIsoform(projeto, iso, boxes[i], R))
        projeto && gene.cromossomo.getLoci(gene.start, gene.end).forEach(l => this.plotLocus(gene, l, viewBox, R))
        projeto && this.plotBED(R, gene, viewBox, projeto)
        return this;
    }

    invalidate(gene: Gene) {
        this.reset()
        this.plot(gene);
    }

}