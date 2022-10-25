<script setup>
import { CheckIcon, XIcon } from '@heroicons/vue/solid'
import { onMounted } from 'vue';
import { NOTIFICACOES } from '../core/State'
const props = defineProps({
    color: 'success' | 'danger' | 'warning',
    index: Number,
    id: Number,
    timeout: Number
});

const HEIGHT = 80

function remove() {
    NOTIFICACOES.splice(NOTIFICACOES.filter(n => n.id === props.id)[0], 1)
}

function modo() {
    switch (props.color) {
        case 'success': return 'text-green-500 bg-green-100'
    }
}

onMounted(() => setTimeout(() => remove(), parseInt(props.timeout) * 1000))

</script>
<template>
    <div class="top-8 right-8 absolute animate-pulse"
        :style="{ 'padding-top': `${index * HEIGHT}px`, 'animation-iteration-count': 3 }">
        <div class="flex items-center p-4 mb-4 w-full max-w-xs rounded-lg shadow text-gray-500 bg-white" role="alert">
            <div :class="' inline-flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg ' + modo()">
                <CheckIcon aria-hidden="true" class="w-5 h-5" fill="currentColor" />
            </div>
            <div class="ml-3 mr-2 text-sm font-normal">
                <slot />
            </div>
            <button type="button" @click="remove()"
                class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                aria-label="Close">
                <span class="sr-only">Close</span>
                <XIcon aria-hidden="true" class="w-5 h-5" fill="currentColor" />
            </button>
        </div>
    </div>
</template>