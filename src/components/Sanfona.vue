<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronUpIcon } from '@heroicons/vue/solid'
const props = defineProps({
    titulo: String,
    opened: { default: false }
});
</script>

<template>
    <Disclosure as="div" class="mt-2" v-slot="{ open }" :default-open="true">
        <DisclosureButton @click="$emit('open', open)"
            :class="(open ? 'rounded-b-none' : '') + ' flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'">
            <span><Texto>{{ titulo }}</Texto></span>
            <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''"
                class="h-5 w-5 text-purple-500 transition ease-in-out" />
        </DisclosureButton>
        <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <DisclosurePanel class="px-4 pt-4 pb-2 text-sm bg-white rounded-lg rounded-t-none">
                <slot />
            </DisclosurePanel>
        </transition>
    </Disclosure>
</template>