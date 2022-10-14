<route lang="json">
{
    "meta": {
        "title": "Overview",
        "description": "Overview of experiment",
        "ordem": 3,
        "fbgc": "bg-indigo-800 text-white",
        "hfbgc": "bg-indigo-600 hover:bg-indigo-500 text-white",
        "rqproj": true
    }
}
</route>
      
<script setup>
import { onMounted } from 'vue';
import { TableIcon, PresentationChartLineIcon } from '@heroicons/vue/solid';
import { Canvas, ViewBox, BarPlot, RadarPlot, Padding, BarPlotRadial } from '../core/d3';
import { PROJETO } from "../core/State";
import { CSV } from '../core/utils/CSV';
useHead({ title: 'Overview' });

const projeto = PROJETO;

const cors = ['red', 'green', 'blue', 'yellow', 'pink', 'gray', 'orange', 'purple']
var x = 0;

function plotar(id, a, b) {
    const box = ViewBox.fromSize(a, b, Padding.simetric(5));
    new Canvas(id, box, cors[x++ % 8])
}


function plotQC(wC) {
    // "Sample"
    // "FastQC_mqc-generalstats-fastqc-percent_duplicates"
    // "FastQC_mqc-generalstats-fastqc-percent_gc"
    // "FastQC_mqc-generalstats-fastqc-percent_fails"
    // "FastQC_mqc-generalstats-fastqc-total_sequences"

    const W = wC * 2;
    const H = 250;

    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(10));
    const canvas = new Canvas('graphQc', viewBox)//, '#efefef');

    const dataSet = projeto.qc_status
        .mapColInt("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .mapColInt("FastQC_mqc-generalstats-fastqc-total_sequences")
        .mapCol("FastQC_mqc-generalstats-fastqc-percent_fails", parseFloat)
        .getRows();

    //const boxs = viewBox.splitX(2, 10);

    new BarPlotRadial()
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-total_sequences")
        .setY3("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .setY2("FastQC_mqc-generalstats-fastqc-percent_fails")
        .set_ylim2(0, 100)
        .setColor2(() => 'red')
        .setColor((d) => projeto.getFatorBySample(d.fator).cor)
        .set_y2lab(x => parseInt(x) + '%')
        .setCanvas(canvas, viewBox)
        .setTitle('QC')
        .plot(dataSet)


    // const boxs = viewBox.splitX(3, 10);
    // canvas.rect(boxs[0].getBoxX0(), boxs[0].getBoxY0(), boxs[0].getBoxSize().width, boxs[0].getBoxSize().height, 'blue', 0, .4);
    // canvas.rect(boxs[1].getBoxX0(), boxs[1].getBoxY0(), boxs[1].getBoxSize().width, boxs[1].getBoxSize().height, 'orange', 0, .3);
    // const sy =   boxs[2].splitY(3, 20);
    // const sya = sy[0];
    // const syb= sy[1];
    // const syc = sy[2];
    // canvas.rect(sya.getBoxX0(), sya.getBoxY0(), sya.getBoxSize().width, sya.getBoxSize().height, 'green', 0, .3);
    // canvas.rect(syb.getBoxX0(), syb.getBoxY0(), syb.getBoxSize().width, syb.getBoxSize().height, 'blue', 0, .3);
    // canvas.rect(syc.getBoxX0(), syc.getBoxY0(), syc.getBoxSize().width, syc.getBoxSize().height, 'red', 0, .3);

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
    //     .setYlim([0, 160])
    //     .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, boxs[0])
    //     .plot(dataSet);

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("FastQC_mqc-generalstats-fastqc-total_sequences")
    //     .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, boxs[1])
    //     .plot(dataSet);

    // canvas.rect(boxs[2].getBoxX0(), boxs[2].getBoxY0(), boxs[2].getBoxSize().width, boxs[2].getBoxSize().height, 'red', 0, .3);



    // new LinePlot()
    //     .setX("x")
    //     .setY("y")
    //     .setYlim([0, 5])
    //     .setCanvas(canvas,  boxs[2])
    //     .plot([ {x: 1, y: 3} , {x: 2, y: 4} , {x: 3, y: 1} , ]);

}


function plotMp(wC) {
    const W = wC * 2;
    const H = 250;

    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(10));

    new RadarPlot('graphRd', viewBox, 'yellow').plot({
        genoma: { smp1: 10, smp2: 10, smp3: 10, smp4: 10, smp5: 10 },
        genes: { smp1: 20, smp2: 20, smp3: 20, smp4: 20, smp5: 20 },
        dest: { smp1: 30, smp2: 5, smp3: 30, smp4: 30, smp5: 30 },
        xpto: { smp1: 40, smp2: 0, smp3: 40, smp4: 40, smp5: 40 },
    });
}


function criar() {
    const wC = 1100 / 6;
    // plotar('graphQc', wC * 3, 250);
    plotQC(wC);
    plotMp(wC);

    // plotar('graphRd', wC * 2, 250);
    plotar('graphMp', wC, 250);

    plotar('graphAs', wC, 250);
    plotar('graphGc', wC * 5, 250);

    plotar('graphCv', wC * 3, 250);
    plotar('graphAn', wC * 3, 250);
}

onMounted(_ => {
    criar();
})


const cols = ['Etapa', 'Tool', 'Fator', 'Sample', 'Propriedade', 'Valor'];
const rows = [
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
];

</script>
    
<template>
    <div class="bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="chart">

                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Table
                </template>
                <template #tableContent>
                    <Table :cols="cols" :rows="rows"></Table>
                </template>

                <template #chart>
                    <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Graphics
                </template>
                <template #chartContent>

                    <Button @click="criar">plotar</Button>


                    <div class="flex flex-wrap justify-center justify-evenly content-evenly my-2">
                        <div class="mx-1 my-1 rounded-md shadow-md bg-gray-100" id="graphQc">
                        </div>
                        <div class="mx-1 my-1" id="graphRd"></div>
                        <div class="mx-1 my-1" id="graphMp"></div>
                    </div>

                    <div class="flex flex-wrap justify-center justify-evenly content-evenly my-2">
                        <div class="mx-1 my-1" id="graphAs"></div>
                        <div class="mx-1 my-1" id="graphGc"></div>
                    </div>

                    <div class="flex flex-wrap justify-center justify-evenly content-evenly my-2">
                        <div class="mx-1 my-1" id="graphCv"></div>
                        <div class="mx-1 my-1" id="graphAn"></div>
                    </div>



                </template>

            </Tabs>

        </div>
    </div>
</template>
    