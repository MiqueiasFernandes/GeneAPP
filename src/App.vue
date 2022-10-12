<script setup>

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/vue/outline'
import { BeakerIcon } from '@heroicons/vue/solid'
import { onMounted } from 'vue';
import { PROJETO } from "./core/State";

const pages = (router) => router.options.routes
  .filter(x => parseInt(x.meta.ordem) > 0)
  .sort((a, b) => a.meta.ordem - b.meta.ordem);

</script>


<template>

  <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <DisclosureButton
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">Open main menu</span>
            <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex-shrink-0 flex items-center">
            <a href="/">
              <BeakerIcon class="h-8 text-white" aria-hidden="true" />
            </a>
          </div>


          <div class="hidden sm:block sm:ml-6">
            <div class="flex space-x-4">
              <router-link v-for="item in pages($router)" :class="[
              $route.meta.title === item.meta.title ? 
              (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.fbgc) || 'bg-gray-900 text-white') : 
              (((((item.meta.rqproj) && (PROJETO.status > 0)) || ((item.meta.nqproj) && (PROJETO.status < 1))) && item.meta.hfbgc) || 'text-gray-300 hover:bg-gray-700 hover:text-white'), 
              'px-3 py-2 rounded-md text-sm font-medium']"
                :aria-current="$route.meta.title === item.meta.title ? 'page' : undefined"
                :to="((item.meta.rqproj) && (PROJETO.status < 1)) || ((item.meta.nqproj) && (PROJETO.status > 0)) ? '' : item.path">{{
                item.meta.title
                }}</router-link>
            </div>
          </div>


        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <!-- <button type="button"
            class="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
            <span class="sr-only">View notifications</span>
            <BellIcon class="h-6 w-6" aria-hidden="true" />
          </button> -->

          <!-- Profile dropdown -->
          <Menu as="div" class="ml-3 relative">
            <div>
              <MenuButton
                class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span class="sr-only">Open user menu</span>
                <button type="button"
                  class="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span class="sr-only">View notifications</span>
                  <BellIcon class="h-6 w-6" aria-hidden="true" />
                </button>

              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95">
              <MenuItems
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your
                  Profile</a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Sign out</a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href"
          :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block px-3 py-2 rounded-md text-base font-medium']"
          :aria-current="item.current ? 'page' : undefined">{{ item.name }}
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>

  <!-- resolver pagina inicial / para start/ -->

  <div>
    <header class="bg-white shadow" v-if="$route.meta.title">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 @click="counter = 0" class="text-3xl font-bold leading-tight text-gray-900">
          {{ $route.meta.description }}
        </h1>
        <h5>{{ PROJETO.nome }}</h5>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
  <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
    <span class="text-xl font-extrabold ">Desenvolvido por <i class=" text-indigo-500 ">mikeias.net</i></span>
  </div>
</template>
