<route lang="json">
{
  "meta": {
    "title": "About",
    "description": "About GeneAPP",
    "ordem": 6,
    "hideTitle": true
  }
}
</route>
  
<script setup>
useHead({ title: 'About' })
</script>

<template>
  <div>
    <div class="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
      <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-slate-700 sm:text-4xl sm:leading-10">
        About GeneAPP
        <p class=" text-indigo-500 text-xl">
          O GeneAPP (2022, Miquéias Fernandes e Edson Mario de Andrade Silva) surguiu de varios scripts que foram necessarios escrever para explorar os outputs de
          softwares de idenficacao de diffetential AS. Alguns desses scripts estao no repositorio
          <a class="underline" target="_blank"
            href="https://github.com/MiqueiasFernandes/bioinformatics">Bioinformatics</a> e nos
          <a class="underline" target="_blank" href="https://www.mikeias.net/p/coffee-notebook.html">notebboks gerados
          </a>
          para uma analise do cafe.
        </p>
      </h2>
    </div>


    <div class="mx-auto max-w-screen-xl px-16 text-slate-600">
      <p>
        Agradeço aos binformatas que revisaram o GeneAPP: Édson M. A., Gustavo e Bruno.
      </p>
      <p>
        O GeneAPP usa recursos de varios desenvolvedores, credios a:
      </p>

      <ul class="list-disc">
        <li><a class="underline font-bold" href="https://www.ncbi.nlm.nih.gov/" target="_blank">NCBI</a> disponibilizou dados biologicos e programas</li>
        <li><a class="underline font-bold" href="https://www.embl.org/" target="_blank">EMBL</a> disponibilizou dados biologicos e programas</li>
        <li><a class="underline font-bold" href="https://rnaseq-mats.sourceforge.net/" target="_blank">rMATS</a> gera os dados de entrada</li>
        <li><a class="underline font-bold" href="https://3drnaseq.hutton.ac.uk/app_direct/3DRNAseq/" target="_blank">3DRNASeq</a> gera os dados de entreda</li>
        <li><a class="underline font-bold" href="https://deeptools.readthedocs.io/en/develop/" target="_blank">Deeptols</a> calcula a profundidade de reads</li>
        <li><a class="underline font-bold" href="" target="_blank">MASER</a> filtra eventos AS significativos</li>
        <li><a class="underline font-bold" href="https://www.gimp.org/" target="_blank">Gimp</a> gerou as imagens da pagina inicial</li>
        <li><a class="underline font-bold" href="https://inkscape.org/" target="_blank">Inkscape</a> desenho de graficos</li>
        <li><a class="underline font-bold" href="https://colab.research.google.com/" target="_blank">Colab</a> infraestrutura para executar a analise de teste</li>
        <li><a class="underline font-bold" href="https://firebase.google.com/" target="_blank">Firebase</a> hospedagem do WebAPP</li>
        <li><a class="underline font-bold" href="https://d3js.org/" target="_blank">D3</a> plotagem dos graficos</li>
        <li><a class="underline font-bold" href="https://vuejsbr-docs-next.netlify.app/" target="_blank">Vue</a> framework JS do APP</li>
        <li><a class="underline font-bold" href="https://tailwindcss.com/" target="_blank">Tailwind</a> framework css do APP</li>
        <li><a class="underline font-bold" href="https://heroicons.com/" target="_blank">heroicons</a> icones do app</li>
        <li><a class="underline font-bold" href="https://d3-graph-gallery.com/" target="_blank">d3-graph-gallery</a> graficos do app</li>
        <li><a class="underline font-bold" href="https://observablehq.com" target="_blank">Observablehq</a> graficos do app</li>
        <li><a class="underline font-bold" href="https://hub.docker.com/r/mikeiasfernandes93/geneapp" target="_blank">Docker</a> container do script do app</li>
      </ul>
    </div>
  </div>
</template>
