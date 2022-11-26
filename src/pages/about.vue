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
        <Texto>About GeneAPP</Texto>
        <p class=" text-indigo-500 text-xl">
          
          <Texto>O GeneAPP (2022, Miquéias Fernandes e Edson Mario de Andrade Silva) 
          surguiu de varios scripts que foram necessarios escrever para explorar os outputs de
          softwares de idenficacao de diffetential AS.</Texto>
          
          <Texto>Alguns desses scripts estao no repositorio</Texto>&nbsp;
          <a class="underline" target="_blank"
            href="https://github.com/MiqueiasFernandes/bioinformatics">Bioinformatics</a> <Texto>e nos</Texto>
          <a class="underline" target="_blank" href="https://www.mikeias.net/p/coffee-notebook.html">
            <Texto>notebboks gerados</Texto>
          </a>
          <Texto>para uma analise do café.</Texto>
        </p>
      </h2>
    </div>


    <div class="mx-auto max-w-screen-xl px-16 text-slate-600">
      <p>
        <Texto>Agradeço aos binformatas que revisaram o GeneAPP: Édson M. A., Gustavo e Bruno.</Texto>
      </p>
      <p>
        <Texto>O GeneAPP usa recursos de varios desenvolvedores, credios a:</Texto>
      </p>

      <ul class="list-disc">
        <li><a class="underline font-bold" href="https://www.ncbi.nlm.nih.gov/" target="_blank">NCBI</a> <Texto>disponibilizou dados biologicos e programas</Texto></li>
        <li><a class="underline font-bold" href="https://www.embl.org/" target="_blank">EMBL</a> <Texto>disponibilizou dados biologicos e programas</Texto></li>
        <li><a class="underline font-bold" href="https://rnaseq-mats.sourceforge.net/" target="_blank">rMATS</a> <Texto>gera os dados de entrada</Texto></li>
        <li><a class="underline font-bold" href="https://3drnaseq.hutton.ac.uk/app_direct/3DRNAseq/" target="_blank">3DRNASeq</a> <Texto>gera os dados de entrada</Texto></li>
        <li><a class="underline font-bold" href="https://deeptools.readthedocs.io/en/develop/" target="_blank">Deeptols</a> <Texto>calcula a profundidade de reads</Texto></li>
        <li><a class="underline font-bold" href="" target="_blank">MASER</a> <Texto>filtra eventos AS significativos</Texto></li>
        <li><a class="underline font-bold" href="https://www.gimp.org/" target="_blank">Gimp</a> <Texto>gerou as imagens da pagina inicial</Texto></li>
        <li><a class="underline font-bold" href="https://inkscape.org/" target="_blank">Inkscape</a> <Texto>desenho de graficos</Texto></li>
        <li><a class="underline font-bold" href="https://colab.research.google.com/" target="_blank">Colab</a> <Texto>infraestrutura para executar a analise de teste</Texto></li>
        <li><a class="underline font-bold" href="https://firebase.google.com/" target="_blank">Firebase</a> <Texto>hospedagem do WebAPP</Texto></li>
        <li><a class="underline font-bold" href="https://d3js.org/" target="_blank">D3</a> <Texto>plotagem dos graficos</Texto></li>
        <li><a class="underline font-bold" href="https://vuejsbr-docs-next.netlify.app/" target="_blank">Vue</a> <Texto>framework JS do APP</Texto></li>
        <li><a class="underline font-bold" href="https://tailwindcss.com/" target="_blank">Tailwind</a> <Texto>framework css do APP</Texto></li>
        <li><a class="underline font-bold" href="https://heroicons.com/" target="_blank">heroicons</a> <Texto>icones do app</Texto></li>
        <li><a class="underline font-bold" href="https://d3-graph-gallery.com/" target="_blank">d3-graph-gallery</a> <Texto>graficos do app</Texto></li>
        <li><a class="underline font-bold" href="https://observablehq.com" target="_blank">Observablehq</a> <Texto>graficos do app</Texto></li>
        <li><a class="underline font-bold" href="https://hub.docker.com/r/mikeiasfernandes93/geneapp" target="_blank">Docker</a> <Texto>container do script do app</Texto></li>
      </ul>
    </div>
  </div>
</template>
