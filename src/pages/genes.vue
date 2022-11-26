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
import { BeakerIcon, ChatIcon, FilterIcon } from '@heroicons/vue/solid'
import {
    CursorClickIcon, DownloadIcon, ShareIcon, BadgeCheckIcon, ArrowSmLeftIcon,
    ArrowSmRightIcon, PresentationChartLineIcon, DocumentTextIcon
} from '@heroicons/vue/outline';
import { onMounted } from 'vue';
import { PROJETO, MODALS, notificar, LINGUAGEM } from "../core/State";
import { GenePlot, Padding, ViewBox } from '../core/d3';
import { Arquivo } from '../core/utils/Arquivo';
// import { getUniprot } from '../core/ClientAPI'

useHead({ title: 'Genes' });

const genes = ref([])
const isos = ref([])
const gene = ref(null)
const idx = ref(0);
const plotou = ref(false)
var GENE_PLOT = null;
const modal = ref('modal')
const compartilhar = ref('compartilhar')
const filtro = ref('filtro')
const confirm = ref(false)
const cgs = {}

function setGene(g) {
    const gx = gene.value = g;
    plotou.value = false;
    confirm.value = false;
    GENE_PLOT && GENE_PLOT.reset()
    if (!g) return

    const vb = ViewBox.fromScreen((g.getIsoformas().length + 1) * 50 + 200, Padding.simetric(5).center())
    GENE_PLOT = new GenePlot('plotg', vb)
    GENE_PLOT.plot(gx, PROJETO)
    plotou.value = true;
    const plt = {}
    plt[gx.nome + '.svg'] = { data: GENE_PLOT.download(), tipo: 'image/svg+xml' }
    PROJETO.addResultados(plt)
    if (!cgs[gx.nome]) {
        const conf = gx.checkAS(PROJETO)
        cgs[gx.nome] = conf && conf.startsWith('AS') ? 2 : 1
        if (cgs[gx.nome] > 1) {
            notificar(conf, 'success', 300)
        }
    }
    confirm.value = cgs[gx.nome] > 1;
}

function start() {
    reset()
    setTimeout(() => {
        plotou.value = false;
        genes.value = PROJETO.getALLGenes();
        setGene(genes.value[idx.value = 0]);
        isos.value = PROJETO.getALLIsos()
    }, 300);
}

function repaint() {
    setTimeout(() => setGene(genes.value[idx.value]), 500)
}

const next = () => (idx.value < (genes.value.length - 1)) && setGene(genes.value[++idx.value]);
const prev = () => (idx.value > 0) && setGene(genes.value[--idx.value]);

function baixar() {
    GENE_PLOT && Arquivo.download(genes.value[idx.value].nome + '.svg', GENE_PLOT.download(), 'image/svg+xml');
}

const OK = { text: 'OK', action: () => true, color: 'bg-sky-500' }
const LIMPAR = { text: 'Limpar', action: () => filtrar(reset()), color: 'bg-rose-500' }

function dialog() {
    MODALS.push({
        titulo: 'Gene ' + (gene.value.meta['NID'] || gene.value.nome),
        html: modal.value.children[0].outerHTML,
        botoes: [OK]
    })
}

const fdef = {
    "Possui AS rMATS": false,
    "Possui AS 3DRnaSeq": false,
    "Possui DE": false,
    "Possui InterPro": false,
    "Possui GO": false,
    "Possui Pathway": false,
    "Nome": "",
    "PSI": "0.1",
    "FDR": "0.05"
}

const filtros = ref({})

function reset() {
    filtros.value = Object.assign({}, fdef)
}

function filtrar() {
    var n = filtros.value.Nome.toLowerCase().trim()
    var psi = parseFloat(filtros.value.PSI.trim().replace(',', '.') || '-1')
    var fdr = parseFloat(filtros.value.FDR.trim().replace(',', '.') || '-1')
    genes.value = PROJETO.getALLGenes()
        .filter(x => !filtros.value["Possui AS rMATS"] || (x.getAS().filter(a => a.evidence === 'rMATS').length > 0))
        .filter(x => !filtros.value["Possui AS 3DRnaSeq"] || (x.getAS().filter(a => a.evidence === '3DRNASeq').length > 0))
        .filter(x => !filtros.value["Possui DE"] || !!x.getDE())
        .filter(x => !filtros.value["Possui InterPro"] || x.getInterpro().length > 0)
        .filter(x => !filtros.value["Possui GO"] || x.getGO().length > 0)
        .filter(x => !filtros.value["Possui Pathway"] || x.getPathway().length > 0)
        .filter(x => !n || n.length < 2 ||
            x.getTags().some(t => t.toLowerCase().includes(n))
        )
        .filter(x => psi < 0 || psi > 1 || isNaN(psi) || (x.getAS().filter(a => Math.abs(a.dps) >= psi).length > 0))
        .filter(x => fdr >= 1 || fdr < 0 || isNaN(fdr) || (x.getAS().filter(a => a.qvalue <= fdr).length > 0))
    setGene(genes.value.length > 0 ? genes.value[idx.value = 0] : null);
    return true;
}

const link = ref(null)

function share(g) {
    if (!g) return
    const lk = link.value = `${window.location.href.slice(0, -1)}?x=${btoa(JSON.stringify(g.share()))}`
    setTimeout(() => {
        MODALS.push({
            titulo: LINGUAGEM.value.traduzir('Compartilhar') + ' ' + gene.value.getNome(),
            html: compartilhar.value.children[0].outerHTML,
            botoes: [{ text: 'Copiar', action: () => navigator.clipboard.writeText(lk), color: 'bg-lime-500' }]
        })
    }, 500);
}

function aba(x) {
    x === 'gene' && repaint()
}

onMounted(start)
</script>
        
<template>

    <template ref="compartilhar">
        <a :href="link" target="_blank" class="break-all">
            {{ link }}
        </a>
    </template>

    <template ref="modal">
        <div v-if="gene">
            <span class="font-bold">
                <Texto>Alternative Splicing</Texto>:
            </span>
            <ul>
                <li v-for="as in gene.getAS()">{{ as.evidence }}
                    <span class="font-bold mx-1" v-if="as.evidence === 'rMATS'">{{ as.tipo }}</span>
                    <span class="font-bold mx-1">Sig.:</span> {{ as.qvalue.toPrecision(3) }}
                    <span class="font-bold mx-1">PSI:</span> {{ as.dps.toPrecision(3) }}
                </li>
            </ul>
            <div v-if="gene.getDE()" class="mt-2">
                <span class="font-bold">
                    <Texto>Expressao diferencial</Texto>:
                </span><br />
                <span class="mr-2"><b>Log2FC:</b> {{ gene.getDE().log2fc.toPrecision(3) }} </span>
                <span><b>Sig.: </b>{{ gene.getDE().qvalue.toPrecision(3) }}</span>
            </div>
            <div class="font-bold mt-2">
                <span>
                    <Texto>Anotacoes</Texto>:
                </span>
                <div class="flex flex-wrap font-bold">
                    <a class="m-1 px-1 bg-sky-500/75 rounded-full text-white drop-shadow-sm" target="_blank"
                        v-for="interpro in gene.getInterpro().slice(1, 10)"
                        :href="'https://www.ebi.ac.uk/interpro/entry/InterPro/' + interpro">{{ interpro }}</a>
                </div>
                <div class="flex flex-wrap font-bold">
                    <a class="m-1 px-1 bg-amber-500/75 rounded-full text-white drop-shadow-sm"
                        v-for="go in gene.getGO().slice(1, 10)" target="_blank"
                        :href="'http://amigo.geneontology.org/amigo/medial_search?q=' + go">{{ go }}</a>
                </div>
                <div class="flex flex-wrap font-bold">
                    <template v-for="pathway in gene.getPathway().slice(1, 10)">
                        <a v-if="pathway.startsWith('R-')" target="_blank"
                            class="m-1 px-1 bg-lime-500/75 rounded-full text-white drop-shadow-sm"
                            :href="'https://reactome.org/content/detail/' + pathway">{{ pathway }}</a>
                        <span v-else class="m-1 px-1 bg-lime-500/75 rounded-full text-white drop-shadow-sm">{{ pathway
                            }}</span>
                    </template>
                </div>
            </div>
        </div>
    </template>
    <Modal :show="false" :botoes="[OK, LIMPAR]" ref="filtro" titulo="Filtrar genes">
        <FormRow>
            <FormCol>
                <FormInputText :label="LINGUAGEM.traduzir('Nome')" :content="filtros.Nome"
                    @update="(x) => filtrar(filtros.Nome = x)" />
            </FormCol>
        </FormRow>
        <ul>
            <li v-for="f in Object.keys(filtros).filter(x => x.startsWith('Possui'))" class="my-1">
                <SwitchGroup @click="filtrar">
                    <div class="flex items-center">
                        <SwitchLabel class="mr-4">
                            <Texto>{{ f }}</Texto>
                        </SwitchLabel>
                        <Switch v-model="filtros[f]" as="template" v-slot="{ checked }">
                            <button class="relative inline-flex h-6 w-11 items-center rounded-full"
                                :class="checked ? 'bg-blue-600' : 'bg-gray-200'">
                                <span :class="checked ? 'translate-x-6' : 'translate-x-1'"
                                    class="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                            </button>
                        </Switch>
                    </div>
                </SwitchGroup>
            </li>
        </ul>
        <FormRow>
            <FormCol>
                <FormInputText label="Min abs(PSI)" :content="filtros.PSI" @update="(x) => filtrar(filtros.PSI = x)" />
            </FormCol>
        </FormRow>
        <FormRow>
            <FormCol>
                <FormInputText label="Max FDR" :content="filtros.FDR" @update="(x) => filtrar(filtros.FDR = x)" />
            </FormCol>
        </FormRow>
        <p>
            Total {{genes.length}} genes {{LINGUAGEM.traduzir('filtrados')}}.
        </p>
    </Modal>
    <div class="px-8">
        <Tabs :names="['gene', 'seq', 'ptn']" active="gene" @change="aba">

            <template #gene>
                <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Gene
            </template>
            <template #geneContent>
                <div class="p-4 bg-gray-100 grid grid-cols-1">
                    <div class="w-full flex justify-center">
                        <div class="p-2 bg-sky-50 rounded-lg drop-shadow-md flex justify-evenly">
                            <BadgeCheckIcon v-if="confirm"
                                class="p-1 h-8 w-8 text-green-500 bg-green-100 rounded-full mt-1 mx-1" />
                            <BeakerIcon v-else class="h-8 w-8 text-slate-500 mt-1 mx-1" />
                            <Button color="blue" class="mx-1" @click="prev" :disable="!plotou || idx < 1">
                                <ArrowSmLeftIcon class="h-5 w-5" />
                            </Button>
                            <Button class=" mx-1" :disable="!plotou" color="blue" @click="baixar">
                                <DownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                <Texto>Baixar</Texto>
                            </Button>
                            <Button class=" mx-1" :disable="!plotou" color="blue" @click="filtro.show()">
                                <FilterIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                <Texto>Filtrar</Texto>
                            </Button>
                            <Button class=" mx-1" :disable="!plotou" color="blue" @click="dialog">
                                <ChatIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                <Texto>Anotacoes</Texto>
                            </Button>
                            <Button class=" mx-1" :disable="!plotou" color="blue" @click="share(gene)">
                                <ShareIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                <Texto>Compartilhar</Texto>
                            </Button>
                            <Button class=" mx-1" color="blue" @click="next"
                                :disable="!plotou || idx > (genes.length - 2)">
                                <ArrowSmRightIcon class="h-5 w-5" />
                            </Button>
                            <span
                                class="bg-slate-500/75 rounded-full  mx-1 text-white inline-flex items-center justify-center p-2">{{
                                idx + 1
                                }}/{{ genes.length }}</span>
                        </div>
                    </div>
                    <br class="my-1" />
                    <Button class="m-4 w-24" v-if="!plotou" @click="start()">
                        <CursorClickIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        <Texto>Plotar</Texto>
                    </Button>
                    <div id="plotg" class="w-full flex justify-center">
                        <Imagem class="m-32"></Imagem>
                    </div>
                </div>
            </template>

            <template #seq>
                <DocumentTextIcon class="mr-2 w-5 h-5" />
                <Texto>Genomico</Texto>
            </template>
            <template #seqContent>
                <Sequence :gene="gene.getNome().slice(0, 9)" :genes="genes" :isos="isos" />
            </template>

            <template #ptn>
                <DocumentTextIcon class="mr-2 w-5 h-5" />
                <Texto>Proteina</Texto>
            </template>
            <template #ptnContent>
                <Sequence modo="2" :gene="gene.getNome().slice(0, 9)" :genes="genes" :isos="isos" />
            </template>
        </Tabs>
    </div>

</template>
        