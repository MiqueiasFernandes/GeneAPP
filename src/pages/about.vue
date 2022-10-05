<route lang="json">
{
  "meta": {
    "title": "About",
    "description": "About GeneAPP",
    "ordem": 4
  }
}
</route>
  
<script setup>
useHead({ title: 'About' })
</script>

<template>
  <div class="bg-gray-50">
    <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
      <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
        About Page
        <br />
        <span class="text-indigo-600">
          a principio esse projeto era para ser uma solucao web
        entretanto nesse ambiente ha 2 limitacoes
        1 - o tamanho dos arquivos do projeto de teste do protiop chegou a 3mb
        oque é grande para abrir e processar em navegador, mas pequeno para desktop
        2 - as tecnologias web se reinventam a cada dia, venho de um pique java>angular>django>vue 
        mas ultimametne sem tempo para reaprender o vue que mudou radicalmente 2>3 tudo (options>composition!)
        sem tempo para reaprender botstrap>tailwind prefiro migrar para oque ja sei.
        em "File chooser dialog can only be shown with a user activation"
        </span>
      </h2>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
       
        
      </div>
    </div>
  </div>
</template>
