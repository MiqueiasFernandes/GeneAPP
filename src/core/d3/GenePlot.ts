import * as d3 from "d3";
import { CDS, Exon, Gene, Intron, Isoforma, Locus } from "../model";
import { AbstractCartesianPlot } from "./AbstractPlot";
import { Canvas } from "./Canvas";
import { ViewBox } from "./Size";

export class GenePlot extends AbstractCartesianPlot {

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
        this.fillPattern(rct, 'cyan')
    }

    plotIntron(intron: Intron, viewBox: ViewBox, R) {
        const [X, W, Y, _, H] = this.getPoints(intron, R, viewBox).concat([15]);
        this.wave(X, Y + 3, W, 'black', 4).append("title").text(intron.nome)
    }

    plotIsoform(isoform: Isoforma, viewBox: ViewBox, R) {
        const [X, W, Y, H] = this.getPoints(isoform, R, viewBox);
        this.text(X, Y + 5, isoform.nome, { vc: 1, fs: '.6rem', b: 1 })

        isoform.getIntrons().forEach(i => this.plotIntron(i, viewBox.addPaddingY(20), R))
        isoform.getExons().forEach(e => this.plotExon(e, viewBox.addPaddingY(20), R))
        isoform.getCDS().getLoci().forEach(cds => this.plotCDS(cds, viewBox.addPaddingY(20), R))
        isoform.getAnots().forEach(a => a.toLoci(isoform).forEach(l => this.plotDomain(l, viewBox.addPaddingY(20), R)))
    }

    getX0 = (l: Locus, R) => R(l.strand ? l.start : l.end)
    getX1 = (l: Locus, R) => R(l.strand ? l.end : l.start)
    getW = (l: Locus, R) => this.getX1(l, R) - this.getX0(l, R)
    getPoints = (l: Locus, R, v: ViewBox) => [this.getX0(l, R), this.getW(l, R), v.getBoxY0(), v.getBoxSize().height]

    plot(gene: Gene): Canvas {

        const viewBox = this.viewBox.addPadding(5, 5).center();
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

        const regua = this.line({ v: 30, y1: boxGene.getBoxY0() + 10, y2: viewBox.getBoxY1() + 5, c: "gray", x1: null, x2: null, h: null });

        const ctext = this.text(0, boxGene.getBoxY1() + 5, '').attr('font-size', '.5rem')

        this.text(boxGene.getBoxX0(), boxGene.getBoxY0() + GH * .7, gene.nome, { vc: 1, fs: '.8rem', b: 1 })
        this.rect(boxGene.getBoxX0() - 2, boxGene.getBoxY0() + GH * .4, boxGene.getBoxSize().width + 4, 5)
            .on('mousemove', coord => {
                regua &&
                    regua.attr("x1", coord.offsetX) &&
                    regua.attr("x2", coord.offsetX) &&
                    ctext.attr("transform",
                        `translate(${coord.offsetX + (coord.offsetX > boxGene.getBoxSize().width / 2 ? -5 : 5)},0)`)
                        .text(coord.offsetX)
                        .style('text-anchor', coord.offsetX > boxGene.getBoxSize().width / 2 ? 'end' : 'start')
            })
        const boxes = viewBox.addPaddingY(GH + 10).splitY(gene.getIsoformas().length)
        gene.getIsoformas().forEach((iso, i) => this.plotIsoform(iso, boxes[i], R))

        return
    }





}