<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronUpIcon } from '@heroicons/vue/solid'
const props = defineProps({
    titulo: String,
    opened: { default: false }
});
</script>

<template>
    <Disclosure as="div" class="mt-2" v-slot="{ open }" :defaultOpen="opened">
        <DisclosureButton
            :class="(open ? 'rounded-b-none' : '') + ' flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'">
            <span>{{ titulo }}</span>
            <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''"
                class="h-5 w-5 text-purple-500 transition ease-in-out" />
        </DisclosureButton>
        <DisclosurePanel class="px-4 pt-4 pb-2 text-sm bg-white rounded-lg rounded-t-none">
            <slot />
        </DisclosurePanel>
    </Disclosure>
</template>