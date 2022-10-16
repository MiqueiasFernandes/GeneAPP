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
import { Padding, ScatterPlot, ViewBox, Point } from '../core/d3'
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

const show = ref(false);
const graficos = [
    [{ id: 'graphDe', titulo: 'Gene differential expression' }]
];

const W = 1100 / 7;
const H = 300;

function plotDE() {
    console.log(projeto.getDE())
    new ScatterPlot('graphDe', ViewBox.fromSize(W * 3, H, Padding.simetric(30)))
        .plot(projeto.getDE().map(de => new Point(de.log2fc, de.qvalue)))
}

function criar() {
    show.value = true;
    setTimeout(() => {
        plotDE();
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
        