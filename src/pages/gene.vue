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
import { useRoute } from 'vue-router'
import axios from 'axios';
import { onMounted } from 'vue';
import { GenePlot, Padding, ViewBox } from '../core/d3';
import { Anotacao, Gene } from '../core/model';
import { PROJETO, notificar } from "../core/State";
import { Arquivo } from '../core/utils/Arquivo';
useHead({ title: 'Gene View' });

const route = useRoute()
const query = route.query
const status = ref('Parametro invalido, use .../gene?id=2')
const anotou = ref(false)
const plotou = ref(false)
var GENE = null;
var GENE_PLOT = null;

function anotar() {
    if (!GENE_PLOT) return
    anotou.value = true
    if (!GENE || GENE.getIsoformas().length < 2) return
    const eutils = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&id=@&rettype=fasta&retmode=text'
    GENE.getIsoformas().forEach(iso => {
        const ptnas = iso.getAnots('Protein')
        if (ptnas.length === 1) {
            const ptn = ptnas[0].value
            const ipro = 'https://www.ebi.ac.uk/Tools/services/rest/iprscan5'
            axios.get(eutils.replace('@', ptn))
                .then(res => {
                    notificar(`${ptn} obtida da API do eutis/NCBI`)
                    axios.postForm(
                        `${ipro}/run`, {
                        email: 'teste@teste.com',
                        goterms: false,
                        pathways: false,
                        appl: 'PfamA',
                        title: 'anotar',
                        sequence: res.data.split('\n').slice(1).join('')
                    }).then(res => {
                        const job = res.data;
                        notificar(`Job ${job.substring(0, 10)}... anotando pela API InterproScan5`, 'success', 60)
                        const itv = setInterval(() => {
                            axios.get(`${ipro}/status/${job}`).then(res => {
                                if (res.data === 'FINISHED') {
                                    clearInterval(itv)
                                    axios.get(`${ipro}/result/${job}/tsv`).then(res => {
                                        res.data.split('\n').forEach(
                                            x => Anotacao.fromRaw2(x.split('\t')).forEach(a => iso.add_anotacao(a)))
                                        GENE_PLOT.invalidate(GENE)
                                    })
                                }
                            })
                        }, 60000)
                    })
                })
        }
    });
}

function baixar() {
    Arquivo.download('grafico.svg', GENE_PLOT.download(), 'image/svg+xml');
}

function carregar() {
    if (query.id) {
        notificar(`Carregando gene ${query.id} pelo NCBI`)
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=gene&id=${query.id}&rettype=gene_table&retmode=text`;
        status.value = 'carregando gene ' + query.id
        axios.get(url)
            .then(res => {
                status.value = 'gene carregado!'
                const gene = GENE = Gene.fromNCBI(res.data.split('\n'))
                PROJETO.nome = gene.nome;
                route.meta.description = "Gene View " + query.id;
                const vb = ViewBox.fromSize(800, (gene.getIsoformas().length + 1) * 50, Padding.simetric(5).center())
                GENE_PLOT = new GenePlot('plot', vb)
                GENE_PLOT.plot(gene)
                plotou.value = true
            })
            .catch(e => status.value = 'erro ao carregar ' + url)
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
            </div>
        </div>

        <hr class="my-2" />

        <div id="plot" class="w-full flex justify-center p-2">
            <Imagem></Imagem>
        </div>
    </div>
</template>