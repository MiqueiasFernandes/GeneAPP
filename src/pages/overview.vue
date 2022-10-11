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
import { Drawable, Line, Bounds } from '../core/d3';
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;

function plotar() {
    const dw = new Drawable(
        null,
        "graphQC",
        new Bounds(800, 600, 0, 0, {
            top: 20,
            bottom: 50,
            right: 200,
            left: 100,
        })
    );
    new Line(dw, dw.bounds).plot();
}

onMounted(_ => {
    plotar();
})

</script>
    
<template>
    <div class=" bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="table">

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

                    <Button @click="plotar">plotar</Button>

                    <div id="graphQC"></div>

                </template>

            </Tabs>

        </div>
    </div>
</template>
    