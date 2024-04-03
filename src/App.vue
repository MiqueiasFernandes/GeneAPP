<script setup>

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { MenuIcon, XIcon, DownloadIcon } from '@heroicons/vue/outline'
import { BeakerIcon } from '@heroicons/vue/solid'
import { PROJETO, MODALS, NOTIFICACOES, LINGUAGEM, IDIOMAS } from "./core/State";
import { Arquivo } from './core/utils/Arquivo';

const pages = (router) => router.options.routes
  .filter(x => parseInt(x.meta.ordem) > 0)
  .sort((a, b) => a.meta.ordem - b.meta.ordem);

const cookies = ref(true)
function baixando() {
  const lista = LINGUAGEM.value.para_trauzir
  const lista_uniq = [...new Set(lista)].map(x => `    "${x}",\n    ""`).concat(
    Object.entries(LINGUAGEM.value.dicionario).map(x => `    "${x[0]}",\n    "${x[1]}"`))
  Arquivo.download("IDIOMA-" + LINGUAGEM.value.nome + ".txt", "[\n" + lista_uniq.join(",\n") + '\n]')
}
onMounted(() => {
  MODALS.push({
    titulo: 'Organismos',
    color: 'info',
    conteudo: LINGUAGEM.value.traduzir('O GeneAPP está preparado para trabalhar com multi-exons coding genes para os tipos de AS RI e SE principalmente.'),
    botoes: [{ text: 'OK', action: () => true, color: 'bg-indigo-500' }]
  })
})

</script>

<template>

  <div style="z-index: 9999" v-if="cookies"
    class="w-full h-8 fixed bottom-0 bg-amber-200 text-amber-700 font-extrabold m-0 px-4 py-1">
    <Texto>Este site usa cookies, ao continuar possui seu consentimento.</Texto>
    <button class="rounded-sm bg-amber-300 shadow mx-2 px-3" @click="cookies = false">OK</button>
  </div>

  <Disclosure as="nav" class="bg-gray-800 fixed w-full shadow z-10" v-slot="{ open }">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <DisclosureButton
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">
              <Texto>Abrir menu principal</Texto>
            </span>
            <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/">
              <BeakerIcon class="h-8 text-white
              transition ease-in-out delay-150 hover:scale-110 duration-300
              " aria-hidden="true" />
            </router-link>
          </div>

          <div class="hidden sm:block sm:ml-6">
            <div class="flex space-x-4">
              <router-link v-for="item in pages($router)" :class="[
              $route.meta.title === item.meta.title ?
                (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.fbgc) || 'bg-gray-900 text-white border-slate-100 border') :
                (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.hfbgc) || 'text-gray-300 hover:bg-gray-700 hover:text-white'),
              'px-3 py-2 rounded-md text-sm font-medium']"
                :aria-current="$route.meta.title === item.meta.title ? 'page' : undefined"
                :to="((item.meta.rqproj) && (PROJETO.status < 1)) || ((item.meta.nqproj) && (PROJETO.status > 0)) ? '' : item.path">
                <Texto>{{ item.meta.title }}</Texto>
              </router-link>
            </div>
          </div>


        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <!-- Profile dropdown -->
          <Menu as="div" class="ml-3 relative">
            <div>
              <MenuButton
                class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span class="sr-only">
                  <Texto>Abrir opçoes do menu</Texto>
                </span>
                <button type="button"
                  class="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span class="sr-only">
                    <Texto>Ver opções</Texto>
                  </span>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </button>
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95">
              <MenuItems
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <!-- <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">English
                  version</a>
                </MenuItem> -->
                <MenuItem v-slot="{ active }">
                <a href="https://github.com/MiqueiasFernandes/GeneAPP"
                  :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                  <Texto>Repositório do Github</Texto>
                </a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                <a href="https://miqueias.net"
                  :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                  <Texto>Suporte</Texto>
                </a>
                </MenuItem>
                <MenuItem v-slot="{ active }" v-for="idioma in IDIOMAS">
                <a @click="LINGUAGEM = idioma"
                  :class="[active || LINGUAGEM.nome === idioma.nome ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{
                      idioma.bandeira
                  }}
                  {{ idioma.nome }}</a>
                </MenuItem>
                <!-- <MenuItem v-slot="{ active }" v-if="LINGUAGEM.para_trauzir.length > 0">
                <a @click="baixando"
                  :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Dicionário</a>
                </MenuItem> -->
                <MenuItem v-slot="{ active }">
                <a href="https://mikeias.net"
                  :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                  <Texto>User manual</Texto>
                </a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 flex flex-col items-center">
        <router-link  v-for="item in pages($router)" :key="item.meta.title" 
          :class="[
            $route.meta.title === item.meta.title ?
                (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.fbgc) || 'bg-gray-900 text-white border-slate-100 border') :
                (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.hfbgc) || 'text-gray-300 hover:bg-gray-700 hover:text-white'),
            // $route.meta.title === item.meta.title ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 
            'block px-3 py-2 rounded-md text-base font-medium w-48 text-center']"
          :aria-current="$route.meta.title === item.meta.title ? 'page' : undefined"
          :to="((item.meta.rqproj) && (PROJETO.status < 1)) || ((item.meta.nqproj) && (PROJETO.status > 0)) ? '' : item.path"
          
          ><Texto>{{ item.meta.title }}</Texto>
      </router-link>
      </div>
    </DisclosurePanel>
  </Disclosure>

  <div class="bg-gray-100 pt-16">
    <header class="bg-gray-50 shadow"
      v-if="$route.meta.title && $route.meta.title !== 'GeneAPP' && !$route.meta.hideTitle">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          <Texto>{{ $route.meta.description }}</Texto>
        </h1>
        <h5 class="flex content-center  items-center">{{ PROJETO.nome }}
          <button @click="PROJETO.download()" v-if="PROJETO.hasResults()" :disabled="PROJETO.baixando"
            class="mx-2 place-self-end bg-white dark:bg-slate-800 p-2 w-8 h-8 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-md rounded-full flex items-center justify-center">
            <DownloadIcon class="w-6 h-6 text-violet-500" />
          </button>
        </h5>
      </div>
    </header>
    <main class="p-2">
      <router-view />
    </main>
  </div>

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="bg-gray-800 fill-gray-100">
    <path fill-opacity="1"
      d="M0,128L34.3,154.7C68.6,181,137,235,206,234.7C274.3,235,343,181,411,186.7C480,192,549,256,617,282.7C685.7,309,754,299,823,250.7C891.4,203,960,117,1029,101.3C1097.1,85,1166,139,1234,154.7C1302.9,171,1371,149,1406,138.7L1440,128L1440,0L1405.7,0C1371.4,0,1303,0,1234,0C1165.7,0,1097,0,1029,0C960,0,891,0,823,0C754.3,0,686,0,617,0C548.6,0,480,0,411,0C342.9,0,274,0,206,0C137.1,0,69,0,34,0L0,0Z">
    </path>
  </svg>

  <div class="bg-gray-800 text-white">
    <div class="-mt-0 mb-20 w-100 text-right md:-mt-16">
      <span class="bg-slate-50 rounded-full p-4 mx-16 text-slate-500 font-bold">
        <Texto>Versão</Texto> 1.0
      </span>
    </div>
    <div class="px-4 py-4 flex justify-center">
      <span class="text-lg font-extrabold">
        <Texto>Direitos registrados a UFMG & UFV - permitido uso apenas não comercial - para fins de pesquisa</Texto>
      </span>
    </div>
    <div class="px-4 py-4 flex justify-center">
      <span class="text-sm font-extrabold">
        <Texto>Desenvolvido para o capitulo III da tese de doutorado de MF submetida ao PPG Bioinformatica ICB/UFMG</Texto>
      </span>
    </div>
  </div>

  <div class="top-8 right-0 -mr-8 fixed max-w-lg px-4 py-2 flex flex-col items-end rounded-l-3xl z-10"
    style="background:  radial-gradient(white, transparent)">
    <template v-for="notificacao in NOTIFICACOES">
      <Notificacao class="pr-10" v-if="notificacao && !notificacao.close" :color="notificacao.color"
        :timeout="notificacao.timeout" :id="notificacao.id">
        {{ notificacao.msg }}
      </Notificacao>
    </template>
  </div>

  <Modal v-for="modal in MODALS" :titulo="modal.titulo" :botoes="modal.botoes" :color="modal.color" :html="modal.html"
    :inputs="modal.inputs">
    {{ modal.conteudo }}
  </Modal>

</template>
