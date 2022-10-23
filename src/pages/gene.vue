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
import { Gene } from '../core/model';
import { PROJETO } from "../core/State";
useHead({ title: 'Gene View' });

const route = useRoute()
const query = route.query
const status = ref('Parametro invalido, use .../gene?id=2')

function carregar() {
    if (query.id) {
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=gene&id=${query.id}&rettype=gene_table&retmode=text`;
        status.value = 'carregando gene ' + query.id
        axios.get(url)
            .then(res => {
                status.value = 'gene carregado!'
                const gene = Gene.fromNCBI(res.data.split('\n'))
                PROJETO.nome = gene.nome;
                const vb = ViewBox.fromSize(800, (gene.getIsoformas().length + 1) * 50, Padding.simetric(5).center())
                new GenePlot('plot', vb).plot(gene)
            })
            .catch(e => status.value = 'erro ao carregar ' + url)
    }
}


onMounted(carregar)

</script>
            
<template>
    <div class="flex flex-wrap justify-center p-4">
        <div v-if="status !== 'gene carregado!'">
            {{status}}
        </div>
        <div id="plot"></div>
    </div>
</template>