<route lang="json">
{
  "meta": {
    "title": "New",
    "description": "New project",
    "ordem": 2,
    "fbgc": "bg-indigo-800 text-white",
    "hfbgc": "bg-indigo-600 hover:bg-indigo-500 text-white",
    "nqproj": true
  }
}
</route>
      
<script setup>
import { ColorSwatchIcon } from '@heroicons/vue/solid';
import { Arquivo } from '../core/utils/Arquivo';
import { PROJETO, MODALS, notificar, LINGUAGEM } from "../core/State";
import { onBeforeMount } from 'vue';
import { useRoute } from 'vue-router'
import { mkProj, upFile } from '../core/ClientAPI'

useHead({ title: LINGUAGEM.value.traduzir('New Project') });
const route = useRoute()
const query = route.query
const projeto = PROJETO;
const percent = ref(-1);
const file = ref(null);
const raw_data = [];
const sanfona_st = ref(1)

function importar() {
  Arquivo.importManyData(
    (raw, f, s) => {
      raw.split('\n').forEach(x => raw_data.push(x));
      if (s < 1) {

        const result = projeto.validarRawData(raw_data);

        if (result.erros > 0) {
          alert(`${LINGUAGEM.value.traduzir('Carregou incorretamente. ERRO:')} ${erros.join(', ')}`);
          window.location.href = window.location.href;
        }
        notificar(LINGUAGEM.value.traduzir('Processando arquivos carregados'))
        file.value = LINGUAGEM.value.traduzir("Processando ...");
        const error = projeto.parseFiles(result, s => {
          ((percent.value = s) > 99 && ++projeto.status)
          if (s > 99) {
            notificar(`Total ${projeto.getALLGenes().length} ${LINGUAGEM.value.traduzir('genes carregados.')}`, 'success', 10)
          }
        });
        if (error) {
          alert(`${LINGUAGEM.value.traduzir('Carregou incorretamente. ERRO:')} ${error}`);
          window.location.href = window.location.href;
        }
      }
    },
    (status, f) => {
      file.value = f;
      percent.value = status[0] * 99 / status[1];
    },
    files => files.sort((a, b) => a.name.localeCompare(b.name))[0]
  );
}

function setExperimento() {

  MODALS.push({
    titulo: 'Dados de amostra',
    color: 'info',
    conteudo: LINGUAGEM.value.traduzir('Caso vc esteja usando dados de amostra vc precisa descompactar primeiro, e entao carregar os 10 arquivos obtidos do arquivo comprimido.'),
    botoes: [{ text: 'OK', action: () => true, end: importar, color: 'bg-indigo-500' }]
  })

}

function carregar() {
  if (query.create && query.create === 'new') {
    setTimeout(importar, 500);
  }
}

function criar_projeto() {
  Arquivo.inputFile(files => {
    mkProj(files[0]).then(res => {
      console.log(res.data)
      PROJETO.online = res.data
      PROJETO.nome = res.data.projeto
      notificar(LINGUAGEM.value.traduzir('Projeto criado com sucesso!'), 'success', 10)
    })
  })
}

function upload() {
  Arquivo.inputFile(files => {
    files.forEach(file => {
      upFile(PROJETO.online.projeto, PROJETO.online.path, file).then(res => {
        projeto.online.upload = res.data.ok
        projeto.online.falta = res.data.falta
        notificar(`${file.name} ${LINGUAGEM.value.traduzir('Arquivo carregado!')}`, 'success', 10)
      })
    })
  }, true)
}

onBeforeMount(() => projeto.reset())
onMounted(carregar)
</script>


<template>
  <div class="w-full px-4 pt-4">
    <div class="mx-auto w-full max-w-xl rounded-2xl p-8">


      <Sanfona class="sahdow" titulo="Carregar dados" :opened="sanfona_st === 2" @open="(s) => (s && (sanfona_st = 2))">
        <template v-if="!PROJETO.online.path">
          <FormRow>
            <FormCol>
              <Button color="acent" @click="criar_projeto"><Texto>Criar projeto</Texto></Button>
            </FormCol>
          </FormRow>
        </template>
        <template v-else>
          => Projeto criado! <br />
          => <span class="font-mono font-bold text-lime-700">tar cvfj genoma.fasta.tbz2 genoma.fasta </span> <br />
          => <span class="font-mono text-lime-700">tar cvfz genoma.fasta.tgz genoma.fasta</span>  <br />
          => <span class="font-mono text-lime-700/75">zip genoma.fasta.zip genoma.fasta</span>  <br />

          <FormRow>
            <FormCol>
              <Button color="acent" @click="upload"><Texto>Carregar arquivos</Texto> (100MB)</Button>
            </FormCol>
          </FormRow>

          <ul class="list-disc px-4">
            <li  class="text-amber-700 font-bold" v-for="f in PROJETO.online.falta">{{f}}</li>
            <li class="text-lime-700" v-for="f in PROJETO.online.upload">{{f}}</li>
          </ul>
        </template>

      </Sanfona>

      <Sanfona class="sahdow" titulo="Configurar o projeto" :opened="true" @open="(s) => (s && (sanfona_st = 1))">
        <FormRow>
          <FormCol>
            <FormInputText :label="LINGUAGEM.traduzir('Nome do projeto')" :content="projeto.nome"
              @update="(x) => (projeto.nome = x)" />
          </FormCol>
        </FormRow>
        <FormRow v-if="percent < 100">
          <FormCol v-if="percent < 0">
            <Button color="acent" @click="setExperimento">
              <Texto>Carregar 10 arquivos</Texto>
            </Button>
          </FormCol>
          <FormCol v-else>
            <ProgressBar :label="file" :percent="percent"></ProgressBar>
          </FormCol>
        </FormRow>
        <FormRow v-else grid="6" v-for="fator in projeto.fatores">
          <FormCol span="6">
            <FormInputText :label="'Label of ' + fator.nome" :content="fator.nome" @update="(x) => (fator.nome = x)" />
          </FormCol>
          <FormCol span="6" style="margin-top: -2.5rem;" class="flex justify-end">

            <Button v-if="fator.is_control" @click="fator.is_control = !(fator.is_case = !fator.is_case)">
              <Texto>Controle</Texto>
            </Button>
            <Button v-if="fator.is_case" @click="fator.is_control = !(fator.is_case = !fator.is_case)">
              <Texto>Tratamento</Texto>
            </Button>

            <ColorSwatchIcon :style="{ color: fator.cor }" class="w-8 h-8 inline-flex rounded-full cursor-pointer border-4 border-white 
              focus:outline-none focus:shadow-outline" @click="fator.show_cor = !fator.show_cor" />
            <input type="color" v-model="fator.cor" :hidden="!fator.show_cor">
          </FormCol>
        </FormRow>
      </Sanfona>
      <!-- 
      <Sanfona class="sahdow" titulo="Carregar dados extras" :opened="sanfona_st === 2" @open="(s) => (s && (sanfona_st = 2))">
        <FormRow>
          <FormCol>
            <Button color="acent" @click="">upload orthoven</Button>
            <Button color="acent" @click="">download gos agbase</Button>
            <Button color="acent" @click="">upload agbase</Button>
          </FormCol>
        </FormRow>
      </Sanfona>

      <Sanfona class="sahdow" titulo="Custom project" :opened="sanfona_st === 3" @open="(s) => (s && (sanfona_st = 3))">
        criar a partir de out tabelar rmtas 3d
        criar a partir de genoma + as genes ncbi
      </Sanfona> -->
      <!-- https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=gene&id=2&rettype=gene_table&retmode=text -->
      <!-- https://www.ncbi.nlm.nih.gov/books/NBK25499/ -->
    </div>
  </div>
</template>


