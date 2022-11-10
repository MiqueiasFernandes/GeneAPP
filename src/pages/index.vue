<route lang="json">
{
  "meta": {
    "title": "GeneAPP",
    "description": "Welcome to GeneAPP!",
    "ordem": 0
  }
}
</route>
    
<script setup>
import { SearchIcon } from '@heroicons/vue/outline';
import { onMounted } from 'vue';

useHead({ title: 'GeneAPP' })

const input = ref(null)

onMounted(() => {
  //input.value.focus()
})


</script>
    

<template>

  <section class="flex items-center flex-wrap mx-16">
    <div class="lg:w-1/2 sm:w-full h-96 flex items-center"
      style="background-image: url('/img/grafs.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      
    </div>
    <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
      <span class="text-6xl	text-indigo-600 font-extrabold w-full">Explore resultados <br /> de analise de splicing alternativo</span>
      <br />
      <span class="w-full text-slate-600 font-bold text-2xl my-4">
        Transforme numeros em graficos e direcione sua pesquisa para o caminho certo com o GeneAPP 
      </span>
    </div>
  </section>

<section class="flex items-center flex-wrap mx-16">
    <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
      <span class="text-6xl	text-indigo-600 font-extrabold w-full">encontre os genes <br /> que voce estuda aqui</span>
      <br />
      <span class="w-full text-slate-600 font-bold text-2xl my-4">Visualise genes pelo GID do NCBI com sua estrutura,
        dominios funcionais e muito mais</span>
    </div>
    <div class="lg:w-1/2 sm:w-full h-96 flex items-center"
      style="background-image: url('/img/monitor.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      <div class=" w-1/2 h-32 ml-4 mt-8 p-2 flex inline items-center">
        <FormInputText class="w-64 font-mono" :float="false" ref="input" :auto="false" /> <Button class="h-10 mx-2" color="acent">
          <SearchIcon class="h-8 w-8 animate-pulse" />
        </Button>
      </div>
    </div>
  </section>


  hello word
</template>