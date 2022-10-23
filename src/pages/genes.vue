<route lang="json">
{
    "meta": {
        "title": "Genes",
        "description": "AS Genes View",
        "ordem": 5,
        "fbgc": "bg-indigo-800 text-white",
        "hfbgc": "bg-indigo-600 hover:bg-indigo-500 text-white",
        "rqproj": true
    }
}
</route>
          
<script setup>
import { onMounted } from 'vue';
import { PROJETO } from "../core/State";
import { GenePlot, Padding, ViewBox } from '../core/d3';

useHead({ title: 'Genes' });

const genes = ref([])
const gene = ref(null)
const idx = ref(0);

function setGene(g) {
    const gx = gene.value = g;
    const vb = ViewBox.fromSize(800, (g.getIsoformas().length + 1) * 50, Padding.simetric(5).center())
    new GenePlot('plotg', vb).plot(gx)
}

const next = () => idx.value < genes.value.length - 1 && ++idx.value && setGene(genes.value[idx.value]);
const prev = () => idx.value > 0 && --idx.value && setGene(genes.value[idx.value]);

onMounted(() => {
    genes.value = PROJETO.getALLGenes().filter(x => x.getAnots.length>0);
})

</script>
        
<template>
    <div class="bg-gray-50  text-center">

        <div class="p-2 bg-sky-50 m-4  max-w-xl rounded-2xl px-8
            flex flex-wrap justify-center justify-evenly content-evenly drop-shadow-md">
            <Button color="blue" @click="prev" class="mx-2">Prev</Button>
            <Button color="blue" @click="next" class="mx-2">Next</Button>
        </div>

        <div class="min-w-full bg-gray-100 px-6 pt-4 pb-2 text-gray-700  font-bold text-xl text-center min-w-xxl">
            <div id="plotg"></div>
        </div>

    </div>
</template>
        