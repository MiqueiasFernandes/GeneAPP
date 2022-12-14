<script setup>
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationIcon, ExclamationCircleIcon } from '@heroicons/vue/outline'
import FormInputText from './FormInputText.vue';
import  {LINGUAGEM} from '../core/State'
const props = defineProps({
    titulo: { default: "Atenção" },
    conteudo: { default: "Aprovar." },
    botoes: {
        default: [
            { text: 'Sair', color: 'red', action: () => true },
            { text: 'Ficar' }
        ]
    },
    color: { default: 'info' },
    html: { default: null },
    show: { default: true },
    inputs: { default: [] }
});
const open = ref(props.show)
const data = ref({})

function parseColor(color) {
    if (!color) return 'text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
    if (color === 'red') return 'border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
    return color
}

function show() {
    open.value = true
}

function submit(botao) {
    if (!botao) {
        const def = props.botoes.filter(b => b.default)
        if (def.length > 0)
            botao = def[0]
    }
    botao && (!botao.action || !(open.value = !botao.action(data.value))) && botao.end && botao.end(botao, data.value)
}

defineExpose({ show })
</script>

<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-10" @close="open = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div v-if="color === 'danger'"
                                        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationIcon class="h-6 w-6 text-rose-500" aria-hidden="true" />
                                    </div>
                                    <div v-if="color === 'warn'"
                                        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationIcon class="h-6 w-6 text-amber-500" aria-hidden="true" />
                                    </div>
                                    <div v-if="color === 'info'"
                                        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationCircleIcon class="h-6 w-6 text-sky-500" aria-hidden="true" />
                                    </div>
                                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                            <Texto>{{ titulo }}</Texto>
                                        </DialogTitle>
                                        <div class="mt-2">
                                            <p v-if="html" class="text-sm text-gray-500" v-html="html">
                                            </p>
                                            <p class="text-sm text-gray-500">
                                                <slot />
                                            </p>
                                            <FormInputText v-for="input in inputs" :label="input.label"
                                                @keyup.enter="submit(null)" :content="input.value"
                                                @update="(x) => (data[input.label] = x)">
                                            </FormInputText>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button" v-for="botao in botoes"
                                    :class="parseColor(botao.color) + ' inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 sm:ml-3 sm:w-auto sm:text-sm'"
                                    @click="submit(botao)">
                                    <Texto>{{ botao.text }}</Texto>
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
  