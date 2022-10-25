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
import { PROJETO, MODALS, notificar } from "../core/State";
import { onBeforeMount } from 'vue';

useHead({ title: 'New Project' });

const projeto = PROJETO;
const percent = ref(-1);
const file = ref(null);
const raw_data = [];

function importar() {
  Arquivo.importManyData(
    (raw, f, s) => {
      raw.split('\n').forEach(x => raw_data.push(x));
      if (s < 1) {

        const result = projeto.validarRawData(raw_data);

        if (result.erros > 0) {
          alert(`Carregou incorretamente. ERRO ${erros.join(', ')}`);
          window.location.href = window.location.href;
        }
        notificar('Processando arquivos carregados')
        file.value = "Processando ...";
        const error = projeto.parseFiles(result, s => { (percent.value = s) > 99 && projeto.status++ });
        if (error) {
          alert(`Carregou incorretamente. ERRO ${error}`);
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
    color: 'warn',
    conteudo: 'Caso vc esteja usando dados de amostra vc precisa descompactar primeiro, e entao carregar os 10 arquivos obtidos do arquivo comprimido.',
    botoes: [{ text: 'OK', action: () => true, end: importar, color: 'bg-indigo-500' }]
  })

}

onBeforeMount(() => projeto.reset())

</script>


<template>
  <div class="w-full px-4 pt-4">
    <div class="mx-auto w-full max-w-xl rounded-2xl p-8">
      <Sanfona titulo="Configurar o projeto" :opened="true">
        <FormRow>
          <FormCol>
            <FormInputText label="Nome do projeto" :content="projeto.nome" @update="(x) => (projeto.nome = x)" />
          </FormCol>
        </FormRow>
        <FormRow v-if="percent < 100">
          <FormCol v-if="percent < 0">
            <Button color="acent" @click="setExperimento">Load experiment data</Button>
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

            <Button v-if="fator.is_control"
              @click="fator.is_control = !(fator.is_case = !fator.is_case)">controle</Button>
            <Button v-if="fator.is_case"
              @click="fator.is_control = !(fator.is_case = !fator.is_case)">tratamento</Button>

            <ColorSwatchIcon :style="{ color: fator.cor }" class="w-8 h-8 inline-flex rounded-full cursor-pointer border-4 border-white 
              focus:outline-none focus:shadow-outline" @click="fator.show_cor = !fator.show_cor" />
            <input type="color" v-model="fator.cor" :hidden="!fator.show_cor">
          </FormCol>
        </FormRow>
      </Sanfona>

      <Sanfona titulo="Carregar dados extras">
        <FormRow>
          <FormCol>
            <Button color="acent" @click="setData">upload orthoven</Button>
            <Button color="acent" @click="setData">download gos agbase</Button>
            <Button color="acent" @click="setData">upload agbase</Button>
          </FormCol>
        </FormRow>
      </Sanfona>

      <Sanfona titulo="Custom project">
        criar a partir de out tabelar rmtas 3d
        criar a partir de genoma + as genes ncbi
        <!-- https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=gene&id=2&rettype=gene_table&retmode=text -->
        <!-- https://www.ncbi.nlm.nih.gov/books/NBK25499/ -->
      </Sanfona>

    </div>
  </div>
</template>


