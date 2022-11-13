<route lang="json">
{
  "meta": {
    "title": "About",
    "description": "About GeneAPP",
    "ordem": 6
  }
}
</route>
  
<script setup>
useHead({ title: 'About' })
</script>

<template>
  <div>
    <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
      <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
        About Page
        <br />
        <span class="text-indigo-600">
          Sobre o projeto VUE SINGLE PAGE WEB APP
        </span>
      </h2>
    </div>
    <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6">
      <p>
        sobre o projeto
      </p>
      <p>
        citacoes
      <ul>
        <li>ncbi deeptols</li>
        <li>interproscan</li>
        <li>agbase</li>
        <li>orthoven</li>
        <li>rmtas</li>
        <li>3drnaseq</li>
      </ul>
      </p>
      <p>
        links e repos
      <ul>
        <li>https://d3-graph-gallery.com/</li>
        <li>https://observablehq.com/@d3/tree-of-life</li>
        <li>https://observablehq.com/@d3/disjoint-force-directed-graph</li>
        <li>https://raw.githubusercontent.com/mcfonseca-lab/docker/master/rmats/run_maser.R</li>
      </ul>
      </p>
    </div>
  </div>
</template>
