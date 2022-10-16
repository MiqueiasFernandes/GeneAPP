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
import { Padding, ScatterPlot, ViewBox, Point, BarPlotVertical, Heatmap, Canvas } from '../core/d3'
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

const show = ref(false);
const graficos = [
    [
        { id: 'graphBar', titulo: 'AS Discovery' },
        { id: 'graphScr', titulo: 'AS Impact' },
        { id: 'graphDe', titulo: 'Gene differential expression' },
    ],
    [
        { id: 'graphDa', titulo: 'Gene AS 3DRnaSeq' },
        { id: 'graphDar', titulo: 'Gene AS rMATS' },
        { id: 'graphHm', titulo: 'Heatmap Genes top TPM' }
    ],
    [
        { id: 'graphHm2', titulo: 'Heatmap Iso top TPM' },
    ]
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


    const viewBox = ViewBox.fromSize(W * 4, H, Padding.simetric(10));
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

    const lab_conv = Object.fromEntries(isos.map(i => [i[2] + '/' + i[1], `${i[3][1].NID}_${i[3][0].Name}`]))

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

    const viewBox = ViewBox.fromSize(W * 4, H, Padding.simetric(10));
    const canvas = new Canvas('graphHm2', viewBox)
    const box = viewBox.splitY()

    new Heatmap()
        .setCanvas(canvas, box[0].toPadding(new Padding(30, 10, 20, 40)))
        .plot(controle_filt, (x) => lab_conv[x])

    const gsel = [...new Set(controle_filt.map(o => o.x))]
    new Heatmap()
        .setCanvas(canvas, box[1].toPadding(new Padding(30, 10, 20, 40)))
        .plot(dtrat.filter(d => gsel.includes(d.x)), (x) => lab_conv[x])
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
    }, 300);
}

onMounted(() => (show.value = false) || (setTimeout(() => criar(), 300)))
onUpdated(() => (show.value = false) || (setTimeout(() => criar(), 300)))

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
        