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
import { Canvas, ViewBox, BarPlot, LinePlot, Padding } from '../core/d3';
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

    const W = wC * 3;
    const H = 250;

    const viewBox = ViewBox.fromSize(W, H, new Padding(10, 20, 20, 30));
    const canvas = new Canvas('graphQc', viewBox, 'white');
    canvas.rect(viewBox.getBoxX0(), viewBox.getBoxY0(), viewBox.getBoxSize().width, viewBox.getBoxSize().height, 'yellow');

    const dataSet = projeto.qc_status.mapColInt("FastQC_mqc-generalstats-fastqc-avg_sequence_length").getRows();

    //  const boxs = viewBox.cols(2, Padding.simetric(2));

    // console.log(boxs);

    new BarPlot()
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .setYlim([0, 160])
        .setColor((d) => projeto.getFatorBySample(d.fator).cor)
        .setCanvas(canvas, viewBox.splitX(3)[0])
        .plot(dataSet);

        new BarPlot()
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-total_sequences")
        .setYlim([0, 1100000])
        .setColor((d) => projeto.getFatorBySample(d.fator).cor)
        .setCanvas(canvas, viewBox.splitX(3)[1])
        .plot(dataSet);

    new BarPlot()
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .setYlim([0, 160])
        .setColor((d) => projeto.getFatorBySample(d.fator).cor)
        .setCanvas(canvas, viewBox.splitX(3)[2])
        .plot(dataSet);

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("Len")
    //    // .setYlim([0, 160])
    //    // .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, viewBox)
    //     .plot(CSV.fromLines(['Sample,Len', 's1,10', 's2,20', 's3,30']).mapColInt('Len').getRows());

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
    //     .setYlim([0, 160])
    //     .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, boxs[1])
    //     .plot(dataSet);


    // new LinePlot()
    //     .setX("x")
    //     .setY("y")
    //     .setYlim([0, 5])
    //     .setCanvas(canvas, viewBox.withWidth(W).withHeight(H * .9).withMX(30, W * .5))
    //     .plot([ {x: 1, y: 3} , {x: 2, y: 4} , {x: 3, y: 1} , ]);

}


function criar() {
    const wC = 1100 / 6;
    // plotar('graphQc', wC * 3, 250);
    plotQC(wC);

    plotar('graphRd', wC * 2, 250);
    plotar('graphMp', wC, 250);

    plotar('graphAs', wC, 250);
    plotar('graphGc', wC * 5, 250);

    plotar('graphCv', wC * 3, 250);
    plotar('graphAn', wC * 3, 250);
}

onMounted(_ => {
    criar();
})

</script>
    
<template>
    <div class=" bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="chart">

                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Table
                </template>
                <template #tableContent>
                    # Genes {{ projeto.getALLGenes().length }}
                </template>

                <template #chart>
                    <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Graphics
                </template>
                <template #chartContent>

                    <Button @click="criar">plotar</Button>


                    <div class="flex flex-wrap justify-center justify-evenly content-evenly my-2">
                        <div class="mx-1 my-1 p-2 bg-sky-500" id="graphQc"></div>
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
    