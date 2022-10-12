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
import { Canvas, ViewBox } from '../core/d3';
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

const cors = ['red', 'green', 'blue', 'yellow', 'pink', 'gray', 'orange', 'purple']
var x = 0;

function plotar(id, a, b) {
    const box = new ViewBox(null, 5).withWidth(a).withHeight(b);
    new Canvas(id, box, cors[x++ % 8])
}


function criar() {
    const wC = 1100 / 6;
    plotar('graphQc', wC * 3, 250);
    plotar('graphRd', wC * 2, 250);
    plotar('graphMp', wC, 250);

    plotar('graphAs', wC, 250);
    plotar('graphGc', wC * 5, 250);

    plotar('graphCv', wC * 3, 250);
    plotar('graphAn', wC * 3, 250);
}

onMounted(_ => {
    criar();
    console.log(projeto.qc_status)
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
                        <div class="mx-1 my-1" id="graphQc"></div>
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
    