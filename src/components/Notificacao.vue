<script setup>
import { CheckIcon, XIcon } from '@heroicons/vue/solid'
import { ExclamationIcon } from '@heroicons/vue/outline'
import { onMounted } from 'vue';
import { remove } from '../core/State'
const props = defineProps({
    color: 'success' | 'danger' | 'warn',
    timeout: { default: 5 },
    id: Number
});

function modo() {
    switch (props.color) {
        case 'success': return 'text-green-500 bg-green-100'
        case 'warn': return 'text-amber-500 bg-amber-100'
        case 'danger': return 'text-rose-500 bg-rose-100'
    }
}

onMounted(() => setTimeout(() => remove(props.id), props.timeout * 1000))

</script>
<template>
    <div class="animate-pulse my-1 w-fit drop-shadow-xl" style="animation-iteration-count: 2">
        <div class="flex items-center p-4 w-full rounded-lg shadow text-gray-500 bg-white" role="alert">
            <div :class="' inline-flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg ' + modo()">
                <CheckIcon v-if="color === 'success'" aria-hidden="true" class="w-5 h-5" fill="currentColor" />
                <ExclamationIcon v-if="color === 'warn'" aria-hidden="true" class="w-5 h-5"
                    fill="currentColor" />
                <XIcon v-if="color === 'danger'" aria-hidden="true" class="w-5 h-5" fill="currentColor" />

            </div>
            <div class="ml-3 mr-2 text-sm font-normal">
                <slot />
            </div>
            <button type="button" @click="fechar = true && remove(id)"
                class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                aria-label="Close">
                <span class="sr-only"><Texto>Fechar</Texto></span>
                <XIcon aria-hidden="true" class="w-5 h-5" fill="currentColor" />
            </button>
        </div>
    </div>
</template>