<script setup>
import { LINGUAGEM } from "../core/State";
</script>
<template>
    <slot v-if="false" />
    {{ LINGUAGEM.traduzir($slots['default']()[0].children) }}
</template>