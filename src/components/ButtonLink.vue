<script setup>
import { LinkIcon } from '@heroicons/vue/solid'
const props = defineProps({
  href: String,
  target: { type: String, default: '_blank' },
  acent: { default: true }
});
</script>
<template>
  <div class="inline-flex rounded-md shadow">
    <a :href="href" :target="target" :class="{
      'inline-flex items-center justify-center': true,
      'rounded-md border border-transparent': true,
      'px-5 py-3': true,
      'text-base font-medium leading-6': true,
      'transition duration-150 ease-in-out0 focus:outline-none': true,
      'bg-indigo-600 text-white hover:bg-indigo-500': acent,
      'bg-white text-indigo-600 hover:text-indigo-500': !acent
    }">
      <LinkIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
      <slot />
    </a>
  </div>
</template>
