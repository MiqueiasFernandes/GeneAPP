<route lang="json">
{
    "meta": {
        "title": "Events",
        "description": "AS Events",
        "ordem": 4,
        "fbgc": "bg-indigo-800 text-white",
        "hfbgc": "bg-indigo-600 hover:bg-indigo-500 text-white",
        "rqproj": true
    }
}
</route>
          
<script setup>
import { TableIcon, PresentationChartLineIcon, } from '@heroicons/vue/solid';
import { CursorClickIcon } from '@heroicons/vue/outline';
import {
    Padding, ScatterPlot, ViewBox, Point, BarPlot, BarPlotVertical,
    Heatmap, Canvas, GraphPlot, LinesPlot, VennPlot, PiePlot, WordCloudPlot, TreePlot
} from '../core/d3'
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

const show = ref(false);
const graficos = [
    [
        { id: 'graphDar', titulo: 'Gene AS rMATS' },
        { id: 'graphDa', titulo: 'Gene AS 3DRnaSeq' },
        { id: 'graphWc', titulo: 'WordCloud Anotation' },
    ],
    [
        { id: 'graphHm2', titulo: 'Heatmap Iso top TPM' },
        { id: 'graphLk', titulo: 'Gene relatoions' },
    ],
    [
        { id: 'graphBar', titulo: 'AS Discovery' },
        { id: 'graphPie', titulo: 'Premature Terminator Codons on RI events' },
        { id: 'graphScr', titulo: 'AS Impact' },
    ],
    [
        { id: 'graphDea', titulo: 'DE x DAS' },
        { id: 'graphTr', titulo: 'InterPro domain presence' },
        { id: 'graphCov', titulo: 'AS Reads Coverage' }
    ],
    [
        { id: 'graphDe', titulo: 'Gene differential expression' },
        { id: 'graphTop', titulo: 'TOP 10 DAS Genes' },
    ],
    [
        { id: 'graphHm', titulo: 'Heatmap Genes top TPM' },
        { id: 'graphVen', titulo: 'Venn DE x DAS' }
    ],


];

const W = 1100 / 7;
const H = 300;
const as_genes = projeto.getASgenes();

function plotDE() {
    const as_genes = projeto.getASgenes();

    const data = projeto.getDE().map(de =>
        [de.log2FC, -Math.log10(de['adj.pval']), de['adj.pval'], as_genes.includes(de['target'])]
    ).map(de => new
        Point(de[0], de[1])
        .setColor(de[3] ? 'red' : de[2] <= .05 ? 'black' : 'orange')
        .setSize(de[3] ? 2 : 1)
    );
    new ScatterPlot('graphDe', ViewBox.fromSize(W * 2, H, new Padding(30, 30, 30, 40)))
        .setYlim([0, 5])
        .setXlim([-5, 5])
        .hidleAx()
        .plot(data)
}

function plotDA() {
    const data = projeto.getALLDASgenes()
        .filter(de => de['adj.pval'] > 0 && de['adj.pval'] < 1)
        .map(de => [de.maxdeltaPS, -Math.log10(de['adj.pval']), de['adj.pval'], as_genes.includes(de['target'])]
        ).map(de => new
            Point(de[0], de[1])
            .setColor(de[3] ? 'red' : de[2] <= .05 ? 'black' : 'orange')
            .setSize(de[3] ? 2 : 1)
        );

    new ScatterPlot('graphDa', ViewBox.fromSize(W * 1.5, H, new Padding(30, 30, 30, 40)))
        .setYlim([0, 5])
        .setXlim([-.8, .8])
        .hidleAx()
        .plot(data)
}

function plotDAr() {
    const dx = projeto.getDASGenes()
        .filter(x => x.evidence === 'rMATS' && x.qvalue < 1 && x.qvalue > 0)
        .map(x => [as_genes.includes(x.gene.meta.NID), x.qvalue, x.dps, -Math.log10(x.qvalue), x.tipo]).map(
            x => new
                Point(x[2], x[3])
                .setColor(x[1] <= .05 ? 'black' : x[1] > .9 ? 'gray' : 'orange')
                .setForm(x[4] === 'RI' ? 'x' : x[4] === 'SE' ? 'w' : 'o')
        )

    new ScatterPlot('graphDar', ViewBox.fromSize(W * 1.5, H, new Padding(30, 30, 30, 40)))
        .setYlim([0, 5])
        .setXlim([-.8, .8])
        .hidleAx()
        .plot(dx)
}

function plotBar() {

    const filter = (evid, fdr) => projeto.getDASGenes().filter(x => x.evidence === evid && x.qvalue <= fdr)
    const genes_count = (x) => [...new Set(x.map(x => x.gene.nome))].length

    const rmats = filter('rMATS', .05);
    const threeD = filter('3DRNASeq', .05)
    const maser = rmats.filter(x => !x.hasMASER())
    const a3ss = rmats.filter(x => x.tipo === 'A3SS')
    const a5ss = rmats.filter(x => x.tipo === 'A5SS')
    const ri = rmats.filter(x => x.tipo === 'RI')
    const se = rmats.filter(x => x.tipo === 'SE')

    const data = [
        {
            tipo: 'rMATS',
            eventos: rmats.length,
            genes: genes_count(rmats),
        },
        {
            tipo: '3DRNAseq',
            eventos: threeD.length,
            genes: genes_count(threeD),
        },
        {
            tipo: 'MASER',
            eventos: maser.length,
            genes: genes_count(maser),
        },
        {
            tipo: 'RI',
            eventos: ri.length,
            genes: genes_count(ri)
        },
        {
            tipo: 'SE',
            eventos: se.length,
            genes: genes_count(se)
        },
        {
            tipo: 'A3SS',
            eventos: a3ss.length,
            genes: genes_count(a3ss)
        },
        {
            tipo: 'A5SS',
            eventos: a5ss.length,
            genes: genes_count(a5ss)
        }
    ]
    new BarPlotVertical('graphBar', ViewBox.fromSize(W * 2, H, Padding.simetric(10).toLeft(60).toBottom(20)))
        .setX('tipo')
        .setY('eventos')
        .setY2('genes')
        .setColor(_ => '#66f5f7')
        .setColor2(_ => '#d0ff00')
        .hidleAx()
        .plot(data)
        .legend({ t: 'Qtd. events', c: '#66f5f7' }, { t: 'Qtd. genes', c: '#d0ff00' })
}

function plotScater() {

    const dx = projeto.getDASGenes()
        .filter(x => x.evidence === 'rMATS' && x.qvalue < 1 && x.qvalue > 0);

    const maxsRI = dx.filter(x => x.tipo === 'RI').map(d => d.extra['IMPACT']).reduce((a, b) => Math.max(a, b), 0);
    const maxsSE = dx.filter(x => x.tipo === 'SE').map(d => d.extra['IMPACT']).reduce((a, b) => Math.max(a, b), 0);
    const maxsASS = dx.filter(x => x.tipo.startsWith('A')).map(d => d.extra['IMPACT']).reduce((a, b) => Math.max(a, b), 0);

    const data = dx.map(x => [x.dps, x.qvalue, -Math.log10(x.qvalue), x.extra['IMPACT'], x.tipo]).map(
        x => new
            Point(x[0], x[2])
            .setSize(x[3] / (x[4] === 'RI' ? maxsRI : x[4] === 'SE' ? maxsSE : maxsASS) * 5)
            .setColor(x[1] <= .05 ? 'black' : x[1] > .9 ? 'gray' : 'orange')
            .setForm(x[4] === 'RI' ? 'x' : x[4] === 'SE' ? 'w' : 'o')
    )

    new ScatterPlot('graphScr', ViewBox.fromSize(W * 2, H, new Padding(30, 30, 30, 40)))
        .setYlim([0, 5])
        .setXlim([-.8, .8])
        .hidleAx()
        .plot(data)
}

function plotHeatmap() {

    const dctrl = []
    const dtrat = []
    const genes = [...new Set(projeto.getDASGenes().map(g => g.gene.meta.NID))];

    const ctrl = projeto.getCtrl();
    const trat = projeto.getTrat();
    ctrl.samples.forEach(s => genes.forEach(g => dctrl.push({ x: g, y: s.nome, tpm: s.tpm_genes[g] })))
    trat.samples.forEach(s => genes.forEach(g => dtrat.push({ x: g, y: s.nome, tpm: s.tpm_genes[g] })))

    const max_ctrl = dctrl.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.max(a, b), 0)
    const min_ctrl = dctrl.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.min(a, b), dctrl[0].tpm)
    const dif_ctrl = max_ctrl - min_ctrl;
    dctrl.forEach(e => e.op = (e.tpm - min_ctrl) / dif_ctrl)

    const max_ctrlt = dtrat.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.max(a, b), 0)
    const min_ctrlt = dtrat.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.min(a, b), dtrat[0].tpm)
    const dif_ctrlt = max_ctrlt - min_ctrlt;
    dtrat.forEach(e => e.op = (e.tpm - min_ctrlt) / dif_ctrlt)


    const viewBox = ViewBox.fromSize(W * 4, H, Padding.simetric(20));
    const canvas = new Canvas('graphHm', viewBox)
    const box = viewBox.splitY()

    const controle_filt = dctrl.filter(g => g.op > .03)

    new Heatmap()
        .setCanvas(canvas, box[0].toPadding(new Padding(30, 10, 20, 40)))
        .plot(controle_filt)

    const gsel = [...new Set(controle_filt.map(o => o.x))]
    new Heatmap()
        .setCanvas(canvas, box[1].toPadding(new Padding(30, 10, 20, 40)))
        .plot(dtrat.filter(d => gsel.includes(d.x)))
}

function plotHeatmapIso() {

    const dctrl = []
    const dtrat = []
    const isos = [... new Set(projeto.getASIsosID().map(i => [i.meta.MRNA, i.nome, i.gene.nome, [i.meta, i.gene.meta]]))];
    const ctrl = projeto.getCtrl();
    const trat = projeto.getTrat();
    ctrl.samples.forEach(s => isos.forEach(i => dctrl.push({ gt: [i[2], i[1]], y: s.nome, tpm: s.tpm_trans[i[0]] })))
    trat.samples.forEach(s => isos.forEach(i => dtrat.push({ gt: [i[2], i[1]], y: s.nome, tpm: s.tpm_trans[i[0]] })))
    dctrl.map(d => d.x = d.gt.join('/'))
    dtrat.map(d => d.x = d.gt.join('/'))

    const lab_conv = Object.fromEntries(isos.map(i => [i[2] + '/' + i[1], `${i[3][1].NID} ${i[3][0].Name}`]))

    const max_ctrl = dctrl.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.max(a, b), 0)
    const min_ctrl = dctrl.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.min(a, b), dctrl[0].tpm)
    const dif_ctrl = max_ctrl - min_ctrl;
    dctrl.forEach(e => e.op = (e.tpm - min_ctrl) / dif_ctrl)

    const max_ctrlt = dtrat.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.max(a, b), 0)
    const min_ctrlt = dtrat.map(x => x.tpm && (x.tpm + 1) > x.tpm ? x.tpm : 0).reduce((a, b) => Math.min(a, b), dtrat[0].tpm)
    const dif_ctrlt = max_ctrlt - min_ctrlt;
    dtrat.forEach(e => e.op = (e.tpm - min_ctrlt) / dif_ctrlt)

    const controle_filt = dctrl.filter(g => g.op > .05)

    const gns = [...new Set(controle_filt.map(d => d.gt[0]))]
    dctrl.forEach(d => gns.includes(d.gt[0]) ? controle_filt.push(d) : null)
    const gsel = [...new Set(controle_filt.map(o => o.x))]


    const viewBox = ViewBox.fromSize(W * 2.8, H * 2, Padding.simetric(5));
    const canvas = new Canvas('graphHm2', viewBox)
    const box = viewBox.splitX()

    const dt1 = controle_filt;
    const dt2 = dtrat.filter(d => gsel.includes(d.x));
    const pd = new Padding(30, 20, 0, 120)
    new Heatmap()
        .setCanvas(canvas, box[0].toPadding(pd))
        .plot(dt1, (x) => lab_conv[x], true)

    new Heatmap()
        .setCanvas(canvas, box[1].toPadding(pd))
        .plot(dt2, (x) => lab_conv[x], true)
}

function plotLk() {

    ///relacao - cromossomo - ok
    ///relacao - proximidade - ok - 30k(T.A.D.)
    ///relacao - anotacao - ok

    const _MAX_DIST_ = 30000
    const _ANOT_ = ['Pfam', 'GO']

    const nodes = [... new Set(projeto.getDASGenes().map(g => g.gene))];
    nodes.forEach(n => n.group = 'a-gene')

    const links = []

    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (j <= i) return;
            if (n1.cromossomo === n2.cromossomo) {
                const dist = Math.max(n1.start, n2.start, n1.end, n2.end) - Math.min(n1.start, n2.start, n1.end, n2.end);
                if (dist < _MAX_DIST_)
                    return links.push({ source: n1.nome, target: n2.nome, w: (_MAX_DIST_ - dist) / _MAX_DIST_ * 5 })
            }
            const a1 = n1.getAnots(_ANOT_)
            if (a1.length < 1) return
            const a2 = n2.getAnots(_ANOT_)
            if (a2.length < 1) return
            const b = a1.filter(a => a2.includes(a))
            if (b.length < 1) return
            links.push({ source: n1.nome, target: n2.nome, w: b.length + 1 })
        })
    })

    nodes.forEach(g => links.push({ source: g.cromossomo.nome, target: g.nome }))
    projeto.cromossomos.forEach(c => nodes.push({ nome: c.nome, group: 'z-cromossomo' }))

    const data = {
        nodes: nodes.map(g => ({ id: g.nome, group: g.group })), links
    }

    new GraphPlot('graphLk', ViewBox.fromSize(W * 4, H * 2))
        .plot(data);
}

function plotCov() {

    const viewBox = ViewBox.fromSize(W * 3, H, Padding.simetric(20).toLeft(20));
    const canvas = new Canvas('graphCov', viewBox)
    const box = viewBox.splitY()

    const raw = projeto.getDASGenes()
        .filter(x => x.evidence === 'rMATS' && x.qvalue < 1 && x.qvalue > 0)
        .filter(e => e.tipo === "RI" || e.tipo === "SE")
        .map(evt => [evt, evt.getGene().getBED(evt.getASsite())])
        .filter(evt => Math.min(...Object.values(evt[1]).map(s => s.length)) > 200);

    const data = {}

    projeto.fatores.forEach(fator => {
        const cor = fator.cor
        fator.samples.forEach(sample => {
            raw.forEach(r => {
                const evt = r[0]
                const bed = r[1][sample.nome]
                const size = evt.extra['IMPACT']
                const id = evt.extra['ID']
                const tipo = evt.tipo
                const comeco = evt.getASsite()[0]
                data[id] = []
                bed.forEach(b => {
                    const x1 = (b[0] - comeco) / size * 100
                    const y = Math.log2(1 + b[2])
                    data[id].push({ x: x1, y, cor, tipo })
                })
            })
        })
    })

    new LinesPlot()
        .setX('x')
        .setY('y')
        .setCanvas(canvas, box[0].addPaddingY(30))
        .plot(data)

    canvas.text(box[0].getBoxCenter()[0], box[0].getBoxY0() + 10, 'RI and SE', { hc: 1, b: 1 })

    const m = 150

    const raw2 = projeto.getDASGenes()
        .filter(x => x.evidence === 'rMATS' && x.qvalue < 1 && x.qvalue > 0)
        .filter(e => e.tipo === "A3SS" || e.tipo === "A5SS")
        .map(evt => [evt, evt.getGene().getBED([evt.getASpb() - m, evt.getASpb() + m])])
        .filter(evt => Math.min(...Object.values(evt[1]).map(s => s.length)) > 50);

    const data2 = {}

    projeto.fatores.forEach(fator => {
        const cor = fator.cor
        fator.samples.forEach(sample => {
            raw2.forEach(r => {
                const evt = r[0]
                const bed = r[1][sample.nome]
                const size = m * 2
                const id = evt.extra['ID']
                const tipo = evt.tipo
                const comeco = bed.map(x => x[0]).reduce((p, c) => p ? Math.min(p, c) : c)
                data2[id] = []
                bed.forEach(b => {
                    const x1 = (b[0] - comeco) / size * 100
                    const y = Math.log2(1 + b[2])
                    data2[id].push({ x: x1 - 50, y, cor, tipo })

                })
            })
        })
    })

    new LinesPlot()
        .setX('x')
        .setY('y')
        .setCanvas(canvas, box[1].addPaddingY(30))
        .plot(data2)

    canvas.text(box[1].getBoxCenter()[0], box[1].getBoxY0() + 40, 'A3SS and A5SS', { hc: 1, b: 1 })

}

function plotVen() {

    const das = [...new Set(projeto.getDASGenes().map(x => x.getGene().meta.NID))];
    const des = [...new Set(projeto.Significant_DE_genes.map(x => x['target']))];
    new VennPlot('graphVen', ViewBox.fromSize(W * 2.5, H, Padding.simetric(50)))
        .plot({
            'A': des.filter(d => !das.includes(d)).length,
            'B': das.filter(d => !des.includes(d)).length,
            'AB': das.filter(d => des.includes(d)).length,
            'A_LAB': 'DE',
            'B_LAB': 'DAS'
        });
}

function plotDEA() {

    const dataDA = projeto.getDASGenes()
        .filter(x => x.evidence === 'rMATS' && x.qvalue < 1 && x.qvalue > 0)
        .map(x => [x.dps, x.qvalue, x.getGene().meta.NID])
        .reduce((p, c) => {
            const gene = c[2];
            if (p[gene]) {
                if (Math.abs(c[0]) > Math.abs(p[gene][0])) {
                    p[gene].dps = c[0]
                    p[gene].qvalue = c[1]
                }
            } else {
                p[gene] = { dps: c[0], qvalue: c[1] }
            }
            return p;
        }, {});

    projeto
        .getDE().map(de => [de.log2FC, de['target'], parseFloat(de['adj.pval'])])
        .forEach(gde => {
            if (dataDA[gde[1]]) {
                dataDA[gde[1]].log2fc = gde[0]
                dataDA[gde[1]].qvalue2 = gde[2]
            }
        });

    const data = Object.values(dataDA).filter(x => !!x.log2fc).map(d =>
        new Point(d.dps, d.log2fc).setSize(-Math.log10(d.qvalue) * .5).interpolate(-Math.log10(d.qvalue2) / 3)
    )

    new ScatterPlot('graphDea', ViewBox.fromSize(W * 2, H, new Padding(30, 30, 30, 40)))
        .setYlim([-2, 2])
        .setXlim([-.8, .8])
        .plot(data)
}

function plotTop() {

    const evts = projeto.getDASGenes()
        .filter(x => x.qvalue <= .05)
        .map(x => ({ isrmats: x.evidence === 'rMATS', tipo: x.tipo, absdpsi: Math.abs(x.dps), pos: x.dps >= 0, gene: x.gene.meta.NID }))
        .sort((b, a) => a.absdpsi - b.absdpsi)

    const threeD = evts.filter(x => !x.isrmats)
    const rmats = evts.filter(x => x.isrmats)
    const a3ss = rmats.filter(x => x.tipo === 'A3SS');
    const a5ss = rmats.filter(x => x.tipo === 'A5SS');
    const ri = rmats.filter(x => x.tipo === 'RI');
    const se = rmats.filter(x => x.tipo === 'SE');

    const viewBox = ViewBox.fromSize(W * 5, H, new Padding(50, 10, 100, 50))
    const canvas = new Canvas('graphTop', viewBox)
    const boxes = viewBox.splitX(5)
    const top = dt => dt.slice(0, 10)
    const sort = (b, a) => a[1] - b[1]

    boxes.forEach((box, i) => {

        const bars = new BarPlot()
            .setX('gene')
            .setY('absdpsi')
            .setYlim([0, 1])
            .setColor(d => d.pos ? '#66f5f7' : '#d0ff00')
            .setCanvas(canvas, box.addPaddingX(10))
        i > 0 && bars.hidleAx()

        i === 0 && bars.plot(top(threeD), .1, sort)
        i === 1 && bars.plot(top(a3ss), .1, sort)
        i === 2 && bars.plot(top(a5ss), .1, sort)
        i === 3 && bars.plot(top(ri), .1, sort)
        i === 4 && bars.plot(top(se), .1, sort)

        i === 0 && canvas.text(box.getBoxCenter()[0], box.getBoxY0() - 10, '3DRNASeq', { hc: 1, b: 1 })
        i === 1 && canvas.text(box.getBoxCenter()[0], box.getBoxY0() - 10, 'A3SS', { hc: 1, b: 1 })
        i === 2 && canvas.text(box.getBoxCenter()[0], box.getBoxY0() - 10, 'A5SS', { hc: 1, b: 1 })
        i === 3 && canvas.text(box.getBoxCenter()[0], box.getBoxY0() - 10, 'RI', { hc: 1, b: 1 })
        i === 4 && canvas.text(box.getBoxCenter()[0], box.getBoxY0() - 10, 'SE', { hc: 1, b: 1 })

        i === 0 && bars.legend({ t: 'Δ PSI > 0', c: '#66f5f7' }, { t: 'Δ PSI < 0', c: '#d0ff00' }, 60)
    })

}

function plotPTC() {
    const ptc = projeto.getPTC().map(x => [x.f1 >= 0, x.f2 >= 0, x.f3 >= 0, x.f1 / x.len, x.f2 / x.len, x.f3 / x.len]);

    const em3phase = ptc.filter(x => x[0] + x[1] + x[2] === 3).length
    const em2phase = ptc.filter(x => x[0] + x[1] + x[2] === 2).length
    const em1phase = ptc.filter(x => x[0] + x[1] + x[2] === 1).length
    const em0phase = ptc.filter(x => x[0] + x[1] + x[2] === 0).length

    const inicio = ptc.filter(x => (x[0] && (x[3] < .1)) || (x[1] && (x[4] < .1)) || (x[2] && (x[5] < .1))).length
    const fim = ptc.filter(x => (x[0] && (x[3] > .7)) || (x[1] && (x[4] > .7)) || (x[2] && (x[5] > .7))).length
    const meio = ptc.length - inicio - fim;

    const viewBox = ViewBox.fromSize(W * 2.5, H, Padding.simetric(20))
    const canvas = new Canvas('graphPie', viewBox)
    const boxes = viewBox.splitX(2, 20)

    const data1 = {
        'PTC in all reading phases': em3phase,
        'PTC in two reading phases': em2phase,
        'PTC in some reading phases': em1phase,
        'PTC is not in reading phases': em0phase
    }
    const data2 = {
        'PTC found at begin retained intron': inicio,
        'PTC found at middle of retained intron': meio,
        'PTC found at end of retained intron': fim,
    }

    new PiePlot().setCanvas(canvas, boxes[0]).plot(data1)
    new PiePlot().setCanvas(canvas, boxes[1]).plot(data2)

}

function wordCloud() {

    var words = []
    projeto.getALLASIsos().map(i => i.getAnotsText('InterPro').forEach(a => words = words.concat(a.split(' '))))
    projeto.getALLASIsos().map(i => i.getAnotsText('Pfam').forEach(a => words = words.concat(a.split(' '))))

    new WordCloudPlot('graphWc', ViewBox.fromSize(W * 3, H, Padding.simetric(20)))
        .plot(words)

}

function plotTr() {

    const pfam = Object.entries([...new Set(projeto
        .getALLASIsos().map(
            i => i.getAnots('InterPro').map(p => `${i.nome};${p.value};${p.anotations.stop - p.anotations.start}`)
        ).reduce((p, c) => p.concat(c)))].map(x => x.split(';')).map(x => [x[1], parseInt(x[2])])
        .reduce((p, c) => { p[c[0]] ? (p[c[0]] += c[1]) : (p[c[0]] = c[1]); return p }, {}))
        .filter(x => x && x[0].startsWith('IPR'))
        .map(x => ({ path: x[0], value: x[1], link: `https://www.ebi.ac.uk/interpro/entry/InterPro/${x[0]}/` }))

    new TreePlot('graphTr', ViewBox.fromSize(W * 2, H, Padding.simetric(0)))
        .plot(pfam);


}

function criar() {
    show.value = true;
    setTimeout(() => {
        plotDE();
        plotDA();
        plotDAr();
        plotBar();
        plotScater();
        plotHeatmap();
        plotHeatmapIso();
        plotLk();
        plotCov();
        plotVen();
        plotDEA();
        plotTop();
        plotPTC();
        wordCloud();
        plotTr();
    }, 300);
}

onMounted(() => (show.value = false) || (setTimeout(() => criar(), 100)))
onUpdated(() => (show.value = false) || (setTimeout(() => criar(), 100)))

</script>
        
<template>
    <div class=" bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="chart">

                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Table
                </template>
                <template #tableContent>
                    tabela
                </template>

                <template #chart>
                    <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Graphics
                </template>
                <template #chartContent>
                    <Button class="m-4" v-if="!show" @click="criar()">
                        <CursorClickIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Plot
                    </Button>

                    <template v-else>
                        <div class="flex flex-wrap justify-center justify-evenly content-evenly"
                            v-for="row in graficos">
                            <div class="m-4 rounded-md shadow-md bg-gray-200" v-for="grafico in row">
                                <div class="w-full flex justify-center" :id="grafico.id"></div>
                                <div
                                    class="w-full bg-gray-100 px-6 pt-4 pb-2 text-gray-700  font-bold text-xl text-center ">
                                    {{grafico.titulo}}
                                </div>
                            </div>
                        </div>
                    </template>
                </template>

            </Tabs>

        </div>
    </div>
</template>
        