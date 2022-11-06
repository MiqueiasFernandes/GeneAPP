<route lang="json">
{
    "meta": {
        "title": "Gene",
        "description": "Gene View",
        "ordem": -1,
        "rqproj": false
    }
}
</route>
              
<script setup>
import { DownloadIcon, LightningBoltIcon } from '@heroicons/vue/solid'
import { DocumentTextIcon, PresentationChartLineIcon } from '@heroicons/vue/outline';
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue';
import { GenePlot, Padding, ViewBox } from '../core/d3';
import { Gene } from '../core/model';
import { PROJETO, notificar } from "../core/State";
import { Arquivo } from '../core/utils/Arquivo';
import { getNCBIaa, getInterpro, withEmail, getNCBIgene, getNCBInc } from '../core/ClientAPI'

useHead({ title: 'Gene View' });

const route = useRoute()
const query = route.query
const status = ref('Parametro invalido, use .../gene?id=2')
const anotou = ref(false)
const plotou = ref(false)
var GENE = null;
var GENE_PLOT = null;
var genes = ref([])

function anotar() {
    if (!GENE_PLOT) return
    if (!GENE || GENE.getIsoformas().length < 2) return
    withEmail(_ => {
        anotou.value = true
        GENE.getIsoformas().forEach(iso => {
            const ptnas = iso.getAnots('Protein')
            if (ptnas.length === 1) {
                const ptn = ptnas[0].value
                getNCBIaa(ptn, (seq) => {
                    notificar(`${ptn} obtida da API do eutis/NCBI`)
                    iso.seq = seq
                    getInterpro(seq,
                        (status, t) => notificar(status, t > 1 ? 'warn' : 'success', 60),
                        (anots) => {
                            iso.add_anotacoes(anots)
                            GENE_PLOT.invalidate(GENE)
                        })


                }).catch(_ => notificar(`Erro ao obter aa ${ptn} pelo NCBI.`, 'danger', 60))
            }
        });
    })
}

function baixar() {
    GENE_PLOT && GENE && Arquivo.download(GENE.nome + '.svg', GENE_PLOT.download(), 'image/svg+xml');
}

function repaint() {
    setTimeout(() => GENE_PLOT.invalidate(GENE), 300);
}

function setGene(g) {
    const gene = GENE = g
    genes.value.push(gene)
    PROJETO.nome = gene.nome;
    route.meta.description = "Gene View " + query.id;
    const vb = ViewBox.fromScreen((gene.getIsoformas().length) * 50 + 150, Padding.simetric(5).center())
    GENE_PLOT = new GenePlot('plot', vb)
    GENE_PLOT.plot(gene)
    plotou.value = true
}

const seq = ref(null)
const modo = ref('graph')
const modo2 = ref(1)

function carregar() {
    if (query.id) {
        notificar(`Carregando gene ${query.id} pelo NCBI`)
        status.value = 'carregando gene ' + query.id
        getNCBIgene(query.id, (gene) => {
            status.value = 'gene carregado!'
            setGene(gene)
            getNCBInc(gene, (fna) => seq.value = gene.seq = fna)
        }).catch(_ => status.value = 'erro ao carregar ' + url)
    }
    if (query.x) {
        const dt = JSON.parse(atob(query.x))
        const gene = Gene.fromShare(dt)
        setGene(gene)
    }
}


onMounted(carregar)

</script>
            
<template>
    <div class="p-4 bg-gray-100 grid grid-cols-1">
        <div class="w-full flex justify-center">
            <div class="p-2 bg-sky-50 rounded-lg drop-shadow-md w-1/2 flex justify-evenly">
                <Button :disable="!plotou || anotou" color="blue" @click="anotar">
                    <LightningBoltIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true"></LightningBoltIcon>Anotar
                </Button>
                <Button :disable="!plotou" color="blue" @click="baixar">
                    <DownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Baixar
                </Button>
                <Button v-if="modo === 'graph' && seq" :disable="!plotou" color="blue" @click="modo = 'seq'">
                    <DocumentTextIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Sequence
                </Button>
                <Button v-if="modo === 'seq'" :disable="!plotou" color="blue" @click="repaint(modo = 'graph')">
                    <PresentationChartLineIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Graphic
                </Button>
                <Button v-if="modo === 'seq' && anotou && modo2 < 2" :disable="!plotou" color="blue" @click="modo2 = 2">
                    <DocumentTextIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Protein
                </Button>
                <Button v-if="modo === 'seq' && modo2 > 1" :disable="!plotou" color="blue" @click="modo2 = 1">
                    <DocumentTextIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Genomic
                </Button>
            </div>
        </div>

        <hr class="my-2" />

        <div id="plot" class="w-full flex justify-center p-2" v-if="modo === 'graph'">
            <Imagem></Imagem>
        </div>

        <Sequence v-if="modo === 'seq'" :modo="modo2" :gene="genes[0].getNome().slice(0, 9)" :genes="genes"
            :isos="genes[0].getIsoformas()" />
    </div>
</template>