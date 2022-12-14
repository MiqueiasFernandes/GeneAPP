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
import { ColorSwatchIcon, CogIcon, StatusOnlineIcon } from '@heroicons/vue/solid';
import { Arquivo } from '../core/utils/Arquivo';
import { PROJETO, MODALS, notificar, LINGUAGEM } from "../core/State";
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { mkProj, upFile, process, status, findProj } from '../core/ClientAPI'

useHead({ title: LINGUAGEM.value.traduzir('New Project') });
const route = useRoute()
const router = useRouter()
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
  if (query.projeto && query.projeto.includes('-')) {
    const parts = query.projeto.split('-')
    if (parts.length === 8) {
      const path = parts.slice(0, 3).join('-')
      const proj = parts.slice(3).join('-')
      findProj(path, proj)
        .then(res => {
          PROJETO.online = { path, projeto: proj, status: res.data.status }
          PROJETO.nome = query.projeto
          if (res.data.checks.length > 0) {
            //case 1:
            //console.log('aguardando')
            //case 2:
            //console.log('executando')
            //case 3:
            //console.log('comprimindo')
            //case 4:
            //console.log('finalizado')
            PROJETO.online.processandook = true
          }
          getstatus();
          notificar(LINGUAGEM.value.traduzir('Projeto importado com sucesso!'), 'success', 10)
        }).catch(_ => {
          router.push({ path: 'new', query: { projeto: undefined } })
        })
    }
  }
}

function criar_projeto() {
  PROJETO.online = { loading: true }
  Arquivo.inputFile(files => {
    mkProj(files[0]).then(res => {
      PROJETO.online = res.data
      PROJETO.nome = res.data.path + '-' + res.data.projeto
      router.push({ path: 'new', query: { projeto: PROJETO.nome } })
      notificar(LINGUAGEM.value.traduzir('Projeto criado com sucesso!'), 'success', 10)
    }).catch(_ => (PROJETO.online.loading = false))
  })
}

function upload() {
  PROJETO.online.floading = []
  Arquivo.inputFile(files => {
    files.forEach(file => {
      PROJETO.online.floading.push(file.name)
      PROJETO.online.loading = true
      PROJETO.online.processando = false
      upFile(PROJETO.online, PROJETO.online.path, file).then(res => {
        projeto.online.upload = res.data.ok.filter(x => !['waits'].includes(x))
        projeto.online.falta = res.data.falta.filter(x => ![
          'multiqc_general_stats.txt.csv', 'all_as_isoforms.txt',
          'das_genes.inline', 'gene2mrna2cds2ptn.csv', ,
          'gene.gff.min', 'ptnas.inline', 'resumo.txt', 'ri_psc.csv'
        ].includes(x))
        notificar(`${file.name} ${LINGUAGEM.value.traduzir('Arquivo carregado!')}`, 'success', 10)
        PROJETO.online.loading = false
        PROJETO.online.podeproc = true
      }).catch(_ => {
        PROJETO.online.loading = false
        getstatus()
      })
    })
  }, true)
}

function rodar() {
  PROJETO.online.processando = true
  process(PROJETO.online)
    .then(res => {
      if (res.data.status === 'OK') {
        PROJETO.online.processandook = true
        PROJETO.online.tm = setInterval(getstatus, 5000);
      }
    }).catch(_ => (PROJETO.online.processando = false))
}

function getstatus() {
  // if (PROJETO.online.processando)
  status(PROJETO.online)
    .then(res => {
      PROJETO.online.upload = res.data.files ? res.data.files.filter(x => !['waits'].includes(x)) : []
      PROJETO.online.status = res.data.status
      if (PROJETO.online.upload && PROJETO.online.upload.length > 2)
        PROJETO.online.podeproc = true
      if (PROJETO.online.terminou = PROJETO.online.status.includes('geneapp.tbz2'))
        clearInterval(PROJETO.online.tm)
    }).catch(_ => (PROJETO.online.processando = false))
}

onBeforeMount(() => projeto.reset())
onMounted(carregar)
</script>


<template>
  <div class="w-full px-4 pt-4">
    <div class="mx-auto w-full max-w-xl rounded-2xl p-8">


      <Sanfona class="sahdow" titulo="Enriquecer dados" :opened="sanfona_st === 2"
        @open="(s) => (s && (sanfona_st = 2))">

        <template v-if="PROJETO.online && PROJETO.online.processandook">

          <template v-if="PROJETO.online.terminou">
            arquivos processados com sucesso!

            <p class="mt-2 mb-4">
              <a class="bg-indigo-700 text-white rounded p-2 hover:bg-indigo-500"
                :href="`${PROJETO.online.host}/zip/${PROJETO.online.path}/${PROJETO.online.projeto}`">
                <Texto>Baixar todos arquivos zipados</Texto>
              </a>
            </p>
            <!-- <ul>
              <li v-for="f in PROJETO.online.status.filter(x => x.includes('part') && x.includes('.geneapp'))">{{ f }}
              </li>
            </ul> -->
          </template>
          <template v-else>
            <Button color="acent" @click="getstatus">
              <CogIcon class="-ml-1 mr-2 h-5 w-5 animate-spin" style="animation-duration: 6s;" />
              <Texto>Status</Texto>
            </Button>
            processando os arquivos no servidor...
            <br />
            <pre v-if="PROJETO.online.status">
            {{ PROJETO.online.status.map(x => x.substr(0, 50) + '...') }}
          </pre>
          </template>
        </template>
        <template v-else>
          <template v-if="!PROJETO.online.path">
            <FormRow v-if="!PROJETO.online.loading">
              <FormCol>
                <Button color="acent" @click="criar_projeto">
                  <Texto>Criar projeto</Texto>
                </Button>
              </FormCol>
            </FormRow>
          </template>
          <template v-else>
            => Projeto criado! <br />
            => <span class="font-mono font-bold text-lime-700">tar cvfj genoma.fasta.tbz2 genoma.fasta </span> <br />
            => <span class="font-mono text-lime-700">tar cvfz genoma.fasta.tgz genoma.fasta</span> <br />
            => <span class="font-mono text-lime-700/75">zip genoma.fasta.zip genoma.fasta</span> <br />

            <FormRow v-if="!PROJETO.online.loading && !PROJETO.online.processando">
              <FormCol>
                <Button color="acent" @click="upload">
                  <Texto>Carregar arquivos</Texto> (100MB)
                </Button>
              </FormCol>
            </FormRow>

            <ul class="list-disc px-4">
              <li class="text-amber-700 font-bold" v-for="f in PROJETO.online.falta">{{ f }}

                <StatusOnlineIcon v-if="PROJETO.online.floading && PROJETO.online.floading.some(x => x.includes(f))"
                  class="-ml-1 mr-2 h-5 w-5 animate-spin inline" style="animation-duration: 3s;" />

              </li>
              <li class="text-lime-700" v-for="f in PROJETO.online.upload">{{ f }}
              </li>
            </ul>

            <FormRow v-if="PROJETO.online.podeproc && !PROJETO.online.loading">
              <FormCol>
                <Button color="acent" @click="rodar">
                  <Texto>Processar</Texto>
                </Button>
              </FormCol>
            </FormRow>

          </template>
        </template>
      </Sanfona>

      <Sanfona class="sahdow" titulo="Carregar o projeto" :opened="true" @open="(s) => (s && (sanfona_st = 1))">
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


