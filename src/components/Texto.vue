<script setup>
import { onMounted, ref } from 'vue';
import { LINGUAGEM } from "../core/State";
const texto = ref()
const para_traduzir = ref()
const traduziu = ref(false)

onMounted(()=>{
    const traducao = texto.value.innerText || ""
//    const traduzido = LINGUAGEM.value.traduzir(traducao.trim())
//    texto.value.innerText = traduzido
    para_traduzir.value = traducao
    traduziu.value = true
})

</script>
<template>
    <span ref="texto" v-if="!traduziu"><slot /></span>
    {{LINGUAGEM.traduzir(para_traduzir)}}
</template>