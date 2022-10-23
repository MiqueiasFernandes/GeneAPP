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
import { useRoute } from 'vue-router'
import axios from 'axios';
import { onMounted } from 'vue';
import { GenePlot, Padding, ViewBox } from '../core/d3';
import { Anotacao, Gene } from '../core/model';
import { PROJETO } from "../core/State";
useHead({ title: 'Gene View' });

const route = useRoute()
const query = route.query
const status = ref('Parametro invalido, use .../gene?id=2')
const anotou = ref(false)
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
                    console.log('Proteina seq obtida da API do eutis/NCBI', ptn)
                    axios.postForm(
                        `${ipro}/run`, {
                        email: 'teste@teste.com',
                        goterms: false,
                        pathways: false,
                        appl: ['PfamA'],
                        title: 'anotar',
                        sequence: res.data.split('\n').slice(1).join('')
                    }).then(res => {
                        const job = res.data;
                        console.log('Anotando pela API InterproScan5', job)
                        const itv = setInterval(() => {
                            axios.get(`${ipro}/status/${job}`).then(res => {
                                if (res.data === 'FINISHED') {
                                    clearInterval(itv)
                                    console.log(res.data)
                                    axios.get(`${ipro}/result/${job}/tsv`).then(res => {
                                        console.log(res)
                                        console.log(GENE)
                                        console.log(GENE_PLOT)
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

function carregar() {
    if (query.id) {
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
            })
            .catch(e => status.value = 'erro ao carregar ' + url)
    }
}


onMounted(carregar)

</script>
            
<template>
    <div class="flex flex-wrap justify-center p-4  bg-gray-100">
        <div v-if="status !== 'gene carregado!'">
            {{status}}
        </div>
        <div v-else class="max-w-sm ">
            <Button v-if="!anotou" color="blue" @click="anotar">Anotar</Button>
        </div>

        <div id="plot"></div>
    </div>
</template>