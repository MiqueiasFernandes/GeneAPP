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
import { Canvas, ViewBox, BarPlot, InlineDataSet } from '../core/d3';
import { PROJETO } from "../core/State";
import { CSV } from '../core/utils/CSV';
useHead({ title: 'Overview' });

const projeto = PROJETO;

const cors = ['red', 'green', 'blue', 'yellow', 'pink', 'gray', 'orange', 'purple']
var x = 0;

function plotar(id, a, b) {
    const box = new ViewBox(null, 5).withWidth(a).withHeight(b);
    new Canvas(id, box, cors[x++ % 8])
}


function plotQC(wC) {
    // "Sample"
    // "FastQC_mqc-generalstats-fastqc-percent_duplicates"
    // "FastQC_mqc-generalstats-fastqc-percent_gc"
    // "FastQC_mqc-generalstats-fastqc-percent_fails"
    // "FastQC_mqc-generalstats-fastqc-total_sequences"

    const box = new ViewBox().withWidth(wC * 3).withHeight(250).withMY(10, 40).withMX(80);
    const dataSet = new InlineDataSet(projeto.qc_status);
    new BarPlot('graphQc', box, 'white')
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .setFill((d) => projeto.getFatorBySample(d.fator).cor)
        .setYlim([0, 160])
        .plot(dataSet);

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
    