import * as d3 from "d3";
import geneVue from "src/pages/gene.vue";
import { CDS, Exon, Gene, Intron, Isoforma, Locus, Projeto } from "../model";
import { ASrmats } from "../model/AlternativeSplicing";
import { AbstractPlot } from "./AbstractPlot";
import { AreaPlot } from "./AreaPlot";
import { Canvas } from "./Canvas";
import { ViewBox } from "./Size";

export class GenePlot extends AbstractPlot {

    exon = (X, Y, W, H, c = 'green', s = 2) => {
        const form = this.rect(X, Y - s * 2, W, H, 'blue', 8)
            .attr('stroke', 'black')
            .attr('stroke-width', s + 'px')
        this.fillGradient(form, c)
        return form
    }

    cds = (X, Y, W, H, s = 2) => {
        const rct = this.rect(X, Y - s * 1.5, W, H + 2, 'blue', 5)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
        this.fillGradient(rct, 'blue')
        return rct;
    }

    domain = (X, Y, W, H, s = 2, o = .3) => {
        const rct = this.rect(X, Y - s * 1.5, W, H + 2, 'blue', 5)
        this.fillPattern(rct, 'cyan', 2, o)
        return rct
    }

    plotExon(exon: Exon, viewBox: ViewBox, R, c?, s?) {
        const [X, W, Y, _, H] = this.getPoints(exon, R, viewBox).concat([15]);
        const rct = this.exon(X, Y, W, H, c, s)
        rct.append("title").text(exon.nome)
    }

    plotCDS(cds: Locus, viewBox: ViewBox, R, s?) {
        const [X, W, Y, _, H] = this.getPoints(cds, R, viewBox).concat([11]);
        const rct = this.cds(X, Y, W, H, s)
        rct.append("title").text(cds.nome)
    }

    plotDomain(locus: Locus, viewBox: ViewBox, R, s?) {
        const [X, W, Y, _, H] = this.getPoints(locus, R, viewBox).concat([11]);
        const rct = this.domain(X, Y, W, H, s)
        rct.append("title").text(locus.nome)
    }

    plotIntron(intron: Intron, viewBox: ViewBox, R, c = 'black') {
        const [X, W, Y, _, H] = this.getPoints(intron, R, viewBox).concat([15]);
        this.wave(X, Y - 1, W, c, 4).append("title").text(intron.nome)
    }

    plotIsoform(projeto: Projeto, isoform: Isoforma, viewBox: ViewBox, R) {
        const [vbTitle, vbIso] = viewBox.splitY()
        const vbT = vbTitle.addPaddingY(vbTitle.getBoxSize().height / 2).addPaddingX(R(isoform.start))
        const xt = this.plotTPM(projeto, vbT, isoform.meta['MRNA'], false)
        this.text(xt + 6, vbT.getBoxCenter()[1], isoform.meta['NID'] || isoform.nome,
            { vc: 1, fs: '.6rem', b: 1, c: 'white', s: 'white' }).style('filter', 'blur(2px)').style('stroke-width', '4px')
        this.text(xt + 6, vbT.getBoxCenter()[1], isoform.meta['NID'] || isoform.nome, { vc: 1, fs: '.6rem', b: 1 })

        isoform.getIntrons().forEach(i => this.plotIntron(i, vbIso, R))
        isoform.getExons().forEach(e => this.plotExon(e, vbIso, R))
        isoform.hasCDS() && isoform.getCDS().getLoci().forEach(cds => this.plotCDS(cds, vbIso, R))
        isoform.getAnots().forEach(a => a.toLoci(isoform).forEach(l => this.plotDomain(l, vbIso, R)))
    }

    plotTPM(projeto, vb: ViewBox, id, gene = true) {
        var x = vb.getBoxX0();
        if (!projeto)
            return x

        const dm = vb.getBoxSize().height * .6
        const ro = Math.round(dm / 2)
        x += ro
        const HM = vb.getBoxCenter()[1]
        const ttpm = (t) => t[1] > 0 ? `(${t[1]}) TPM μ ${t[0]}` : ` ${id} ?`
        const tpmC = projeto.getCtrl().getTPM(id, gene)
        const tpmT = projeto.getTrat().getTPM(id, gene)

        this.circ(x, HM, ro, 'white').attr('stroke', 'black')
        this.circ(x, HM, ro, projeto.getCtrl().cor)
            .attr('opacity', tpmC[0] > tpmT[0] ? 1 : .3)
            .append("title").text(ttpm(tpmC))

        this.circ(3 + x + dm, HM, ro, 'white').attr('stroke', 'black')
        this.circ(x = (3 + x + dm), HM, ro, projeto.getTrat().cor)
            .attr('opacity', tpmT[0] > tpmC[0] ? 1 : .3)
            .append("title").text(ttpm(tpmT))

        return x + ro + 5;
    }

    plotLocus(gene: Locus, l: Locus, viewBox: ViewBox, R) {
        l = l.copy();
        l.start = Math.max(gene.start, l.start)
        l.end = Math.min(gene.end, l.end)
        l.strand = gene.strand
        const [X, W, _, __] = this.getPoints(l, R, viewBox);
        this.wave(X, viewBox.getBoxCenter()[1], W, 'orangered', 2).append("title").text(l.nome)
    }

    plotBED(gene: Gene, viewBox: ViewBox, projeto: Projeto) {
        const dtC = {}
        const dtT = {}
        Object.entries(gene.getBED()).forEach(([E, D]) => {
            const dx = []
            for (let i = 0; i <= gene.size; i++) {
                dx.push(0)
            }
            D.sort((a, b) => a[0] - b[0]).forEach((x, k, a) => {
                for (let i = x[0]; i < ((k < a.length - 1) ? (a[k + 1][0] - 1) : x[1]); i++)
                    dx[i] = x[2]
            })
            if (projeto.getCtrl().samples.map(s => s.nome).includes(E)) {
                dtC[E] = dx
            } else {
                dtT[E] = dx
            }
        })

        const [boxT, boxC] = viewBox.splitY()

        new AreaPlot()
            .stroke(.1)
            .setCanvas(this, boxT)
            .setColor(d => projeto.getFatorBySample(d.key).cor)
            .hidleAx()
            .plot(dtT)

        new AreaPlot()
            .stroke(.1)
            .reverse(true)
            .setCanvas(this, boxC)
            .setColor(d => projeto.getFatorBySample(d.key).cor)
            .hidleAx()
            .plot(dtC)
    }

    getX0 = (l: Locus, R) => R(l.strand ? l.start : l.end)
    getX1 = (l: Locus, R) => R(l.strand ? l.end : l.start)
    getW = (l: Locus, R) => this.getX1(l, R) - this.getX0(l, R)
    getPoints = (l: Locus, R, v: ViewBox, h = 6) => [this.getX0(l, R), this.getW(l, R), v.getBoxCenter()[1] - h / 2, h]

    plotScala(vb: ViewBox, gene: Gene, legendH: number, PB_ZERO = 15) {
        const MH = vb.getBoxCenter()[1]

        const R = d3
            .scaleLinear()
            .domain([gene.start, gene.end])
            .range(gene.strand ?
                [vb.getBoxX0(), vb.getBoxX1()] :
                [vb.getBoxX1(), vb.getBoxX0()]);

        this.svg
            .append('g')
            .attr("transform", `translate(0,${MH})`)
            .call(d3.axisTop(R))
            .selectAll("text")
            .attr('font-size', '.5rem');


        const regua = this.line({ v: -100, y1: MH, y2: vb.full().getBoxY1() - legendH, c: "gray", x1: null, x2: null, h: null });
        const ctext = this.text(0, vb.getBoxY1() - 2, '').attr('font-size', '.6rem')

        const RM = 3
        const RW = vb.getBoxSize().width + RM * 2
        const pbPpx = gene.size / RW
        // const pb = (c) => Math.floor((gene.strand ? gene.start : gene.end) + (c * pbPpx * (gene.strand ? 1 : -1)))
        // var pb2 = c => pb(c)
        // const limitS = (x) => x > 0 && x <= gene.size ? x : ''
        // const calcS = gene.strand ? ((c) => limitS(1 + pb(c) - gene.start)) : ((c) => limitS(gene.size - (pb(c) - gene.start)))
        // var modg = false

        this.rect(vb.getBoxX0() - RM, MH - 4, RW, 8)
            .on('mousemove', ({ offsetX }) => {
                offsetX > 0 && regua &&
                    regua.attr("x1", offsetX) &&
                    regua.attr("x2", offsetX) &&
                    ctext.attr("transform",
                        `translate(${offsetX + (offsetX > vb.getBoxSize().width / 2 ? -5 : 5)},0)`)
                        .style('text-anchor', offsetX > vb.getBoxSize().width / 2 ? 'end' : 'start')
                        .text()///pb2((gene.strand ? 1 : 0) + offsetX - PB_ZERO).toLocaleString())
            })
        //.on('dblclick', _ => (pb2 = (modg = !modg) ? calcS : (c => pb(c))))

        this.text(vb.getBoxX0() - 13, MH, gene.strand ? "5'" : "3'", { fs: '.6rem', b: 1, o: .7 })
        this.text(vb.getBoxX1() + 5, MH, gene.strand ? "3'" : "5'", { fs: '.6rem', b: 1, o: .7 })
        return R;
    }

    plotGene(vb: ViewBox, gene: Gene, R, legendH: number, projeto: Projeto) {
        const as = gene.isAS()
        const [vbTitulo, vbGene] = vb.splitY()
        const vbT = as ? vbTitulo : vb

        const xt = this.plotTPM(projeto, vbT, gene.meta['NID'], true)
        this.text(xt, vbT.getBoxCenter()[1], gene.getNome(), { vc: 1, fs: '.8rem', b: 1 })

        if (!as)
            return

        gene.getCanonic().getIntrons().forEach(intron => this.plotIntron(intron, vbGene, R))
        gene.getCanonic().getExons().forEach(exon => this.plotExon(exon, vbGene, R, 'red'))

        gene.getCanonic().getSites().forEach(s => {
            const x = this.getX0(s, R)
            const y = vbGene.getBoxCenter()[1]
            const w = this.getW(s, R)
            const rct = this.rect(x, y, w, vb.full().getBoxSize().height - legendH - y)
            this.fillPattern(rct, 'lightgray')
            this.rect(x, y - 1, w, 4)
        })
    }

    plotRI(gene: Gene, event, vb: ViewBox, R) {
        const start = parseInt(event.extra['AS_SITE_START'])
        const end = parseInt(event.extra['AS_SITE_END'])
        const id = event.extra['ID']

        const sites = gene.getCanonic().getSites().filter(s => s.start >= start && s.end <= end)
        sites.length < 1 && sites.push(new Locus(null, start, end, gene.strand, null))

        const ptc = event.extra.ptc
        const s1 = ptc ? (Math.min(ptc.f1, 1) + Math.min(ptc.f2, 1) + Math.min(ptc.f3, 1)) : 0
        const s2 = s1 > 2 ? 1.2 : s1 > 1 ? 1 : .8
        const sw = 10 * s2


        const Y = vb.getBoxCenter()[1]
        sites.forEach(locus => {
            const [X, W] = this.getPoints(locus, R, vb);
            const rct = this.rect(X, Y + 3, W, 20)
            this.fillPattern(rct, 'red', 3)
            rct.append("title").text(id)
            ptc && this.star(X + W / 2 - sw, Y, 'black', s2, 'yellow').append("title").text('Prenature Terminator Codon')
        })
    }

    plotSE(gene: Gene, event, vb: ViewBox, R) {
        const start = parseInt(event.extra['upstreamEE'])
        const end = parseInt(event.extra['downstreamES'])
        const locus = new Locus(null, start, end, gene.strand, null)
        const [X, W] = this.getPoints(locus, R, vb);
        const Y = vb.getBoxCenter()[1] + 20
        const rct = this.arrow(X, Y, X + W, Y + 15, 'black', 3)
        rct.append("title").text(event.extra['ID'])
    }

    plotAS(vb: ViewBox, gene: Gene, R) {
        const as = gene.getAS();
        as.filter(a => a['tipo'] === 'RI').forEach(evt => this.plotRI(gene, evt, vb, R))
        as.filter(a => a['tipo'] === 'SE').forEach(evt => this.plotSE(gene, evt, vb, R))
    }

    plotLegend(viewBox: ViewBox, projeto: Projeto) {

        viewBox.splitX(4).forEach((vbs, i) => vbs.splitY(3).forEach((vb, j) => {
            const X = vb.getBoxX0()
            const Y = vb.getBoxCenter()[1]
            switch (i * 10 + j) {
                case 0:
                    this.exon(X, Y - 1, 10, 10, 'red')
                    this.text(X + 12, Y, 'Constitutive exon', { fs: '.6rem', vc: 1 })
                    break;
                case 1:
                    this.exon(X, Y - 1, 10, 10)
                    this.text(X + 12, Y, 'Exon', { fs: '.6rem', vc: 1 })
                    break;
                case 2:
                    this.cds(X, Y - 1, 10, 8)
                    this.text(X + 12, Y + 3, 'CDS', { fs: '.6rem', vc: 1 })
                    break;
                case 10:
                    this.cds(X, Y, 10, 8)
                    this.domain(X, Y, 10, 8, 2, .8)
                    this.text(X + 15, Y + 3, 'PFam domain', { fs: '.6rem', vc: 1 })
                    break;
                case 11:
                    this.wave(X, Y - 1, 10, 'black', 4)
                    this.text(X + 15, Y + 3, 'Intron', { fs: '.6rem', vc: 1 })
                    break;
                case 12:
                    this.rect(X - 2, Y + 1, 12, 4)
                    this.text(X + 15, Y + 3, 'Alternative region', { fs: '.6rem', vc: 1 })
                    break;
                case 20:
                    const rct = this.rect(X - 12, Y, 15, 10)
                    this.fillPattern(rct, 'red', 3)
                    this.text(X + 8, Y + 3, 'Intron retetion event', { fs: '.6rem', vc: 1 })
                    break;
                case 21:
                    this.star(X - 12, Y - 6, 'black', .5, 'yellow')
                    this.text(X + 8, Y + 3, 'Premature terminator codon', { fs: '.6rem', vc: 1 })
                    break;
                case 22:
                    this.arrow(X - 10, Y + 3, X + 3, Y + 3, 'black', 1, 5)
                    this.text(X + 8, Y + 3, 'Exon skiping event', { fs: '.6rem', vc: 1 })
                    break;
                case 30:
                    if (!projeto)
                        break
                    this.circ(X, Y + 3, 5, projeto.getCtrl().cor).attr('stroke', 'black')
                    this.text(X + 8, Y + 3, projeto.getCtrl().nome + ' TPM', { fs: '.6rem', vc: 1 })
                    break;
                case 31:
                    if (!projeto)
                        break
                    this.circ(X, Y + 3, 5, projeto.getTrat().cor).attr('stroke', 'black')
                    this.text(X + 8, Y + 3, projeto.getTrat().nome + ' TPM', { fs: '.6rem', vc: 1 })
                    break;
                case 32:
                    break;
            }

        }))
    }

    plot(gene: Gene, projeto?: Projeto): Canvas {
        if (!gene) return

        const show_gene = gene.isAS()
        const show_bed = gene.hasBED()
        const show_genomic = projeto ? gene.cromossomo.getLoci2(gene.start, gene.end) : null;
        const SCALA_H = 30
        const GENE_H = show_gene ? 50 : 25
        const GENOMIC_H = show_genomic ? 30 : 1
        const BED_H = show_bed ? 100 : 1
        const LEGEND_H = 40
        const ISO_H = (this.viewBox.getBoxSize().height - (SCALA_H + GENE_H + GENOMIC_H + BED_H + LEGEND_H))

        const viewBox = this.viewBox.addPadding(20, 5).center();
        const vbScala = viewBox.withHeight(SCALA_H);
        const vbGene = viewBox.addPaddingY(SCALA_H).withHeight(GENE_H);
        const vbIsoforms = viewBox.addPaddingY(SCALA_H + GENE_H).withHeight(ISO_H);
        const vbGenomic = viewBox.addPaddingY(SCALA_H + GENE_H + ISO_H).withHeight(GENOMIC_H);
        const vbBED = viewBox.addPaddingY(SCALA_H + GENE_H + ISO_H + GENOMIC_H).withHeight(BED_H);
        const vbLeged = viewBox.addPaddingY(SCALA_H + GENE_H + ISO_H + GENOMIC_H + BED_H).withHeight(LEGEND_H);

        //const rc = (vb, c) => this.rect(vb.getBoxX0(), vb.getBoxY0(), vb.getBoxSize().width, vb.getBoxSize().height, c).attr('opacity', '.4')
        //rc(this.viewBox.full(), 'white')
        //vbScala && rc(vbScala, 'yellow')
        //vbGene && rc(vbGene, 'red')
        // vbIsoforms && rc(vbIsoforms, 'green')
        //vbGenomic && rc(vbGenomic, 'blue')
        //vbBED && rc(vbBED, 'magenta')
        //vbLeged && rc(vbLeged, 'orange')

        const R = this.plotScala(vbScala, gene, LEGEND_H);
        this.plotGene(vbGene, gene, R, LEGEND_H, projeto);
        show_genomic && show_genomic.forEach(l => this.plotLocus(gene, l, vbGenomic, R))
        show_bed && this.plotBED(gene, vbBED, projeto)

        const isoBoxs = vbIsoforms.splitY(gene.getIsoformas().length)
        gene.getIsoformas().forEach((iso, i) => this.plotIsoform(projeto, iso, isoBoxs[i], R))
        show_gene && this.plotAS(vbGene, gene, R)

        this.plotLegend(vbLeged, projeto)
        return this;
    }

    invalidate(gene: Gene) {
        this.reset()
        this.plot(gene);
    }

}