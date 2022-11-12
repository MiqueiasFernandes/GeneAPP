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
import { InformationCircleIcon, SearchIcon, ExclamationIcon } from '@heroicons/vue/outline';
import { LightningBoltIcon, LightBulbIcon, DatabaseIcon, ClipboardCheckIcon } from '@heroicons/vue/solid';
import { onMounted } from 'vue';

useHead({ title: 'GeneAPP' })

const input = ref(null)

const infos = ref([
  {
    tipo: 'info',
    titulo: 'Titulo do alert1',
    texto: 'Texsfato do alafdasert 1 asfspaafsdra adsafapresentar',
    active: true
  },
  {
    tipo: 'warn',
    titulo: 'Titulo do alert2',
    texto: '23421 Tasdsaf dfexto doasfd alert 2 padsfara apresentar',
    active: false
  },
  {
    tipo: 'info',
    titulo: 'asdTitulo do alert3',
    texto: 'Tes ad fax  tosdf sadfdo alersadfat 3 para safda apre asdf sentar',
    active: false
  },
  {
    tipo: 'warn',
    titulo: 'Titulo do alert4',
    texto: 'T342e sds wv f wvvwvwfwv  feefxto do alert 4 para apresentar',
    active: false
  },
])

function active(i) {
  infos.value.forEach(x => (x.active = false))
  i && (i.active = true)
}

onMounted(() => {
  console.log(infos.value)
  //input.value.focus()
  infos.value.forEach((i, id) => (i['next'] = id + 1))
  infos.value[infos.value.length - 1]['next'] = 0
  setInterval(() => {
    let i = infos.value.filter(i => i.active)
    active(infos.value[i.length < 1 ? 0 : i[0].next])
  }, 5000);
})


</script>
    

<template>
  <div
    style="background-image: url('/img/back3.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">


    <section class="flex items-center flex-wrap mx-16"
      style="background-image: url('/img/back1.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      <div class="lg:w-1/2 sm:w-full h-96 flex items-center"
        style="background-image: url('/img/grafs.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">

      </div>
      <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
        <span class="text-6xl	text-indigo-600 font-extrabold w-full">Explore resultados <br /> de analise de splicing
          alternativo</span>
        <br />
        <span class="w-full text-slate-600 font-semibold text-2xl my-4">
          Transforme numeros em graficos e direcione sua pesquisa para o caminho certo com o <b>GeneAPP</b>
        </span>
      </div>
    </section>

    <section class="flex items-center flex-wrap mx-16"
      style="background-image: url('/img/back2.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
        <span class="text-6xl	text-indigo-600 font-extrabold w-full">Encontre os genes <br /> que voce estuda
          aqui</span>
        <br />
        <span class="w-full text-slate-600 font-semibold text-2xl my-4">Visualise genes pelo <b
            class="font-mono">GID</b> do NCBI com sua estrutura,
          dominios funcionais e muito mais</span>
      </div>
      <div class="lg:w-1/2 sm:w-full h-96 flex items-center"
        style="background-image: url('/img/monitor.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
        <div class=" w-1/2 h-32 ml-4 mt-8 p-2 flex inline items-center">
          <FormInputText class="w-64 font-mono" :float="false" ref="input" :auto="false" /> <Button class="h-10 mx-2"
            color="acent">
            <SearchIcon class="h-8 w-8 animate-pulse" />
          </Button>
        </div>
      </div>
    </section>

    <section class="flex items-center flex-wrap mx-16 justify-around		">
      <div class="m-4 bg-sky-50 h-72 w-64 rounded-md shadow text-center p-2  ">
        <div class="-mt-8 w-full flex justify-center">
          <LightningBoltIcon class=" bg-sky-100 rounded-full text-sky-600 p-2 m-2 h-16 w-16" />
        </div>

        <p class="text-2xl	text-sky-700 font-bold w-full my-4 underline">Generation</p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">O GeneAPP disponibiliza um pi sdf sd gs g s
          gs f g sfh s h s hfshf speline para geraçao de
          dados de analise de AS.</span>

      </div>
      <div class="m-4 bg-fuchsia-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <DatabaseIcon class=" bg-fuchsia-100 rounded-full text-fuchsia-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-fuchsia-700 font-bold w-full my-4 underline">Integration</p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">O GeneAPP disponibiliza um pi sdf sd gs g s
          gs f g sfh s h s hfshf speline para geraçao de
          dados de analise de AS.</span>
      </div>
      <div class="m-4 bg-amber-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <LightBulbIcon class=" bg-amber-100 rounded-full text-amber-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-amber-700 font-bold w-full my-4 underline">Curadoria</p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">O GeneAPP disponibiliza um pi sdf sd gs g s
          gs f g sfh s h s hfshf speline para geraçao de
          dados de analise de AS.</span>
      </div>
      <div class="m-4 bg-lime-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <ClipboardCheckIcon class=" bg-lime-100 rounded-full text-lime-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-lime-700 font-bold w-full my-4 underline">Extras</p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">O GeneAPP disponibiliza um pi sdf sd gs g s
          gs f g sfh s h s hfshf speline para geraçao de
          dados de analise de AS.</span>
      </div>
    </section>
  </div>

  <section class="h-32 w-full"
    style="background-image: url('/img/back4.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
    poucos clikes


    muitos resultados
  </section>


  <section class="w-full h-32 px-12">

    <template v-for="info in infos">
      <div
        :class="(info.tipo === 'info' ? 'bg-sky-50' : 'bg-amber-50') + 
        ' w-full h-full rounded-md shadow flex items-center animate-pulse'"
        style="animation-iteration-count: 1;" v-if="info.active">

        <div class="w-20 h-full flex justify-center items-center mx-4">
          <InformationCircleIcon v-if="info.tipo === 'info'"
            class="bg-sky-100 rounded-full text-sky-600 p-2 h-16 w-16" />
          <ExclamationIcon v-else class="bg-amber-100 rounded-full text-amber-600 p-2 h-16 w-16" />
        </div>

        <div class="w-xl">
          {{ info.titulo }}<br />
          {{ info.texto }}
        </div>

      </div>
    </template>
  </section>
  <div class="w-full flex items-center justify-center my-2">
    <div v-for="info in infos" @click="active(info)"
      :class="'bg-slate-700 rounded-full mx-1 ' + (info.active ? 'w-2 h-2' : 'w-1 h-1')"></div>
  </div>



  <div class="grid grid-cols-2 text-center mt-16 font-semibold text-slate-600">
    <div class="">
      TExto texto texto<br />
      TExto texto texto<br />
      TExto texto texto<br />
      TExto texto texto
    </div>
    <div class="">
      TExto texto texto<br />
      TExto texto texto<br />
      TExto texto texto<br />
      TExto texto texto
    </div>
  </div>



</template>