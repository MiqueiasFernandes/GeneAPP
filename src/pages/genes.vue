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
import { DownloadIcon, BeakerIcon } from '@heroicons/vue/solid'
import { onMounted } from 'vue';
import { PROJETO } from "../core/State";
import { GenePlot, Padding, ViewBox } from '../core/d3';
import { Arquivo } from '../core/utils/Arquivo';

useHead({ title: 'Genes' });

const genes = ref([])
const gene = ref(null)
const idx = ref(0);
const plotou = ref(false)
var GENE_PLOT = null;

function setGene(g) {
    const gx = gene.value = g;
    const vb = ViewBox.fromSize(800, (g.getIsoformas().length + 1) * 50, Padding.simetric(5).center())
    GENE_PLOT = new GenePlot('plotg', vb)
    GENE_PLOT.plot(gx, PROJETO)
    plotou.value = true;
}

function start() {
    setTimeout(() => {
        plotou.value = false;
        genes.value = PROJETO.getALLGenes().filter(x => x.getAnots.length > 0);
        setGene(genes.value[idx.value = 0]);
    }, 300);
}

const next = () => idx.value < genes.value.length - 1 && ++idx.value && setGene(genes.value[idx.value]);
const prev = () => idx.value > 0 && --idx.value && setGene(genes.value[idx.value]);

onMounted(start)

function baixar() {
    GENE_PLOT && Arquivo.download('grafico.svg', GENE_PLOT.download(), 'image/svg+xml');
}

</script>
        
<template>
    <div class="p-4 bg-gray-100 grid grid-cols-1">
        <div class="w-full flex justify-center">
            <div class="p-2 bg-sky-50 rounded-lg drop-shadow-md w-1/2 flex justify-evenly">
                <BeakerIcon class="h-8 w-8 m-1 text-slate-500"></BeakerIcon>
                <Button color="blue" @click="prev" class="mx-2">Prev</Button>
                <Button :disable="!plotou" color="blue" @click="baixar">
                    <DownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Baixar
                </Button>
                <Button color="blue" @click="next" class="mx-2">Next</Button>
                <span class="bg-slate-500/75 rounded-full  text-white inline-flex items-center justify-center p-2">{{
                        idx + 1
                }}/{{ genes.length }}</span>
            </div>
        </div>

        <hr class="my-2" />
        <div id="plotg" class="w-full flex justify-center">
            <Imagem></Imagem>
        </div>
    </div>
</template>
        