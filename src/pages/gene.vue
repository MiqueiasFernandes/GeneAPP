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
import { GenePlot } from '../core/d3';
import { Gene } from '../core/model';
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
                const data = Gene.fromNCBI(res.data.split('\n'))
                console.log(data)
            })
            .catch(e => status.value = 'erro ao carregar ' + url)
    }
}


onMounted(carregar)

</script>
            
<template>

    {{status}}
</template>