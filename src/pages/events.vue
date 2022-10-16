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
import { Padding, ScatterPlot, ViewBox, Point, BarPlotVertical } from '../core/d3'
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

const show = ref(false);
const graficos = [
    [
        { id: 'graphDe', titulo: 'Gene differential expression' },
        { id: 'graphDa', titulo: 'Gene AS 3DRnaSeq' },
        { id: 'graphDar', titulo: 'Gene AS rMATS' },
    ],
    [
        { id: 'graphBar', titulo: 'AS Discovery' },
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

    new ScatterPlot('graphDa', ViewBox.fromSize(W * 2, H, new Padding(30, 30, 30, 40)))
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

    new ScatterPlot('graphDar', ViewBox.fromSize(W * 2, H, new Padding(30, 30, 30, 40)))
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

    const ordem = ['rMATS', '3DRNAseq', 'MASER', 'SE', 'RI', 'A5SS', 'A3SS']

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

function criar() {
    show.value = true;
    setTimeout(() => {
        plotDE();
        plotDA();
        plotDAr();
        plotBar();
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
        