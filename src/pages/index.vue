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
import { InformationCircleIcon, SearchIcon, ExclamationIcon, ArrowRightIcon, DownloadIcon, UploadIcon } from '@heroicons/vue/outline';
import { LightningBoltIcon, LightBulbIcon, DatabaseIcon, ClipboardCheckIcon } from '@heroicons/vue/solid';
import { onMounted } from 'vue';

useHead({ title: 'GeneAPP' })

const input = ref(null)

const infos = ref([
  {
    tipo: 'info',
    titulo: 'GeneAPP test data',
    texto: 'You can open test data as text then verify content layout. To generate you own data read script finalizar() function.',
    active: true
  },
  {
    tipo: 'warn',
    titulo: 'Configure email',
    texto: "You'll be prompted to inform your email in order to use InterPro, NCBI, Uniprot and others APIs. Your email not will be cached or processed.",
  },
  {
    tipo: 'info',
    titulo: 'Docker container',
    texto: 'voce pode executar o script auxiliar tambem pelo docker! consulte a pagina sobre para mais detalhes.'
  },
  {
    tipo: 'info',
    titulo: 'Download all data by one click',
    texto: 'Graphics and tables opened on GeneAPP navigation will be avaliable in top download button. Click in it then download all files.'
  },
  {
    tipo: 'warn',
    titulo: 'Cite GeneAPP in your work',
    texto: 'Use, explore and cite GeneAPP in your work.'
  },
  {
    tipo: 'info',
    titulo: 'Info on hover',
    texto: 'Move mouse on plot points and will be displayed anotations as gene name, this feature is supported in some plots.'
  },
  {
    tipo: 'info',
    titulo: 'Custom project',
    texto: 'You can buil project to use just needed GeneAPP features'
  },
])

const top = () => window.scrollTo(0, 0)

function active(i) {
  infos.value.forEach(x => (x.active = false))
  i && (i.active = true)
}

onMounted(() => {
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


    <section class="flex items-center flex-wrap mx-16 mb-12 md:mb-0"
      style="background-image: url('/img/back1.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      <div class="w-full md:w-1/2 h-96 flex items-center"
        style="background-image: url('/img/grafs.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">

      </div>
      <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
        <span class="text-4xl md:text-6xl	text-indigo-600 font-extrabold w-full">
          <Texto>Explore outputs de analises de splicing alternativo</Texto>
        </span>
        <br />
        <span class="w-full text-slate-600 font-semibold text-2xl my-4">
          <Texto>Transforme numeros em graficos e conduza sua pesquisa para o caminho certo com o</Texto> <b>GeneAPP</b>
        </span>
      </div>
    </section>

    <section class="flex items-center flex-wrap mx-16"
      style="background-image: url('/img/back2.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
      <div class="lg:w-1/2 sm:w-full h-96 p-8 flex items-center flex-wrap content-center">
        <span class="text-4xl md:text-6xl	text-indigo-600 font-extrabold w-full">
          <Texto>Encontre o gene que voce estuda aqui</Texto>
        </span>
        <br />
        <span class="w-full text-slate-600 font-semibold text-2xl my-4">
          <Texto>Visualize genes por GID do NCBI com sua estrutura, dominios funcionais e muito mais</Texto>
        </span>
      </div>
      <div class="lg:w-1/2 sm:w-full h-96 flex items-center"
        style="background-image: url('/img/monitor.png'); background-repeat: no-repeat; background-position: center; background-size: contain;">
        <div class=" w-1/2 h-32 ml-4 mt-8 p-2 flex inline items-center">
          <FormInputText class="w-64 font-mono" :float="false" ref="input" :auto="false" content="836163" />
          <Button class="h-10 mx-2" color="acent" @click="top() ; $router.push(`/gene?id=${input.content}`)">
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

        <p class="text-2xl	text-sky-700 font-bold w-full my-2 underline">
          <Texto>Geraçao</Texto>
        </p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">
          <Texto>O GeneAPP posssui um pipeline para gerar dados de analise de AS.</Texto>
          <Texto>Se a amostra é menor que 4GB pode-se rodar no Colab.</Texto>
        </span>

      </div>
      <div class="m-4 bg-fuchsia-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <DatabaseIcon class=" bg-fuchsia-100 rounded-full text-fuchsia-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-fuchsia-700 font-bold w-full my-2 underline">
          <Texto>Integracao</Texto>
        </p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">
          <Texto>O GeneAPP integra dados de programas e links de multiplas bases de dados como NCBI, Intepro, Pfam,
            Uniprot, GO entre outras.</Texto>
        </span>
      </div>
      <div class="m-4 bg-amber-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <LightBulbIcon class=" bg-amber-100 rounded-full text-amber-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-amber-700 font-bold w-full my-2 underline">
          <Texto>Curadoria</Texto>
        </p>

        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">
          <Texto>O GeneAPP foi desenvolvido para comparae eventos de AS e genes AS para selecionar os melhores alvos
            para sua proxima etapa de teste de hipoteses.</Texto>
        </span>
      </div>
      <div class="m-4 bg-lime-50 h-72 w-64 rounded-md shadow text-center p-2 ">
        <div class="-mt-8 w-full flex justify-center">
          <ClipboardCheckIcon class=" bg-lime-100 rounded-full text-lime-600 p-2 m-2 h-16 w-16" />
        </div>
        <p class="text-2xl	text-lime-700 font-bold w-full my-2 underline">
          <Texto>Extras</Texto>
        </p>
        <span class="w-full text-slate-600 font-bold text-lg text-ellipsis">
          <Texto>Anote alguns genes com dominios, inspecione sua sequencia com sitios coloridos, baixe e compartilhe ele
            tambem facilmente.</Texto>
        </span>
      </div>
    </section>
  </div>

  <div class="text-center mt-8 text-slate-600 font-extrabold border-b p-2 mx-16">
    <Texto>Pipeline para testar GeneAPP os recursos do GeneAPP</Texto>
  </div>

  <section class=" flex flex-wrap justify-between items-center m-8"
    style="background-image: url('/img/back4.png');  background-position: center; background-size: contain;">
    <span class="text-lg text-slate-700 font-bold drop-shadow">
      <Texto>Poucos cliques</Texto>
    </span>

    <div class="rounded-lg w-64 h-32 my-2 bg-indigo-300/50 shadow-lg shadow-indigo-500/50">
      <div
        class="rounded-full bg-rose-600 text-white w-8 h-8 flex items-center justify-center -m-4 font-bold drop-shadow-sm shadow">
        1</div>
      <div class="p-2 text-white text-center">
        <span class="text-lg text-slate-700 font-bold drop-shadow-sm">
          <Texto>Com os dados de amostra voce pode testar todos recursos</Texto>
        </span>

        <ButtonLink :icon="false" :color="'rose'" class="my-2"
          href="https://1drv.ms/u/s!AjOYiVKI0SsQtIsS1hL_4SB-T4dLjQ?e=30FWnv">
          <DownloadIcon class="-ml-1 mr-2 h-5 w-5" />
          <Texto>Baixar</Texto>
        </ButtonLink>
      </div>
    </div>

    <span>
      <ArrowRightIcon class="w-8 h-8 text-indigo-600 drop-shadow" />
    </span>

    <div class="rounded-lg w-64 h-32 my-2 bg-indigo-500 shadow-lg shadow-indigo-500/50">
      <div
        class="rounded-full bg-rose-600 text-white w-8 h-8 flex items-center justify-center -m-4 font-bold drop-shadow-sm shadow">
        2</div>
      <div class="text-white text-center flex flex-wrap items-center justify-center h-full">
        <InformationCircleIcon class="w-8 h-8" />
        <span class="text-lg drop-shadow">
          <Texto>Descomprima os dados de amostra em seu computador</Texto>
        </span>
      </div>
    </div>
    <ArrowRightIcon class="w-8 h-8 text-indigo-600  drop-shadow" />

    <div class="rounded-lg w-64 h-32 my-2 bg-indigo-300/50 shadow-lg shadow-indigo-500/50">
      <div
        class="rounded-full bg-rose-600 text-white w-8 h-8 flex items-center justify-center -m-4 font-bold drop-shadow-sm shadow">
        3</div>
      <div class="p-2 text-white text-center">
        <span class="text-lg text-slate-700 font-bold drop-shadow-sm">
          <Texto>Carregue os dados de amostra e explore eles!</Texto>
        </span>

        <ButtonLink :icon="false" :color="'rose'" class="my-2" href="/new?create=new" :target="'_self'">
          <UploadIcon class="-ml-1 mr-2 h-5 w-5" />
          <Texto>Carregar</Texto>
        </ButtonLink>
      </div>
    </div>

    <span class="text-lg text-slate-700 font-bold drop-shadow">
      <Texto>Muitos resultados</Texto>
    </span>
  </section>


  <section class="w-full h-32 px-12 pt-8">

    <template v-for="info in infos">
      <div :class="(info.tipo === 'info' ? 'bg-sky-50' : 'bg-amber-50') +
      ' w-full h-full rounded-md shadow flex items-center animate-pulse'" style="animation-iteration-count: 1;"
        v-if="info.active">

        <div class="w-20 h-full flex justify-center items-center mx-4">
          <InformationCircleIcon v-if="info.tipo === 'info'"
            class="bg-sky-100 rounded-full text-sky-600 p-2 h-16 w-16" />
          <ExclamationIcon v-else class="bg-amber-100 rounded-full text-amber-600 p-2 h-16 w-16" />
        </div>

        <div class="w-xl">
          <span class="text-slate-700 font-bold">
            <Texto>{{ info.titulo }}</Texto>
          </span> <br />
          <span class="w-80% text-slate-700 text-elipsis	text-sm">
            <Texto>{{ info.texto }}</Texto>
          </span>
        </div>

      </div>
    </template>
  </section>
  <div class="w-full flex items-center justify-center my-2">
    <div v-for="info in infos" @click="active(info)"
      :class="'bg-slate-700 rounded-full mx-1 ' + (info.active ? 'w-2 h-2' : 'w-1 h-1')"></div>
  </div>


  <div class="grid grid-cols-2 text-center mt-16 font-semibold text-slate-600 hidden">
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