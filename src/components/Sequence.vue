<script setup>
import { CheckIcon, ChevronDownIcon } from '@heroicons/vue/outline';
import { onMounted } from 'vue';
import { getUniprot } from '../core/ClientAPI'
import { CACHE } from '../core/State'

const props = defineProps({
    genes: { default: [] },
    gene: { default: '' },
    isos: { default: [] },
    iso: { default: '' },
    modo: { default: 1 }
});

let selected = ref(props.genes.length > 0 ? props.genes[0] : null)
let query = ref(props.gene)
let filteredGene = computed(() =>
    query.value === ''
        ? props.genes
        : props.genes.filter((gn) =>
            gn.getNome()
                .toLowerCase()
                .includes(query.value.toLowerCase().replace(/\s+/g, ''))
        )
)

let selectedIso = ref(selected && selected.value.getIsoformas().length > 0 ? selected.value.getIsoformas()[0] : null)
let queryIso = ref(props.iso)
let filteredIso = computed(() =>
    queryIso.value === '' || queryIso.length < 3 || !selected.value
        ? []
        : selected.value.getIsoformas().filter((iso) =>
            iso.getNome()
                .toLowerCase()
                .includes(queryIso.value.toLowerCase().replace(/\s+/g, ''))
        )
)
const sequence = ref(selected ? selected.seq : '')

function parseSeq(gx) {
    if (!gx)
        return;
    sequence.value = selectedIso.value ? selectedIso.value.mark(gx.seq) : gx.seq;
}

function clearISO() {
    sequence.value = selected ? selected.value.seq : null;
}

let selectedPTN = ref(props.isos.length > 0 ? props.isos[0] : null)
let queryPTN = ref('')
let filteredPTN = computed(() =>
    queryPTN.value === '' || queryPTN.value.length < 4
        ? props.isos.slice(-10)
        : props.isos.filter(p => p.meta['PTNA'] &&
            p.meta['PTNA']
                .toLowerCase()
                .includes(queryPTN.value.toLowerCase().replace(/\s+/g, ''))
        )
)

const uniprot = ref({})

function loadUniprot() {
    if (!selectedPTN.value || !selectedPTN.value.meta['PTNA'])
        return
    const id = selectedPTN.value.meta['PTNA']
    uniprot.value[id] = CACHE.value[id] ? CACHE.value[id] : ' '
    if (uniprot.value[id].trim().length < 2)
        getUniprot(id, maped => {
            if (maped.length > 0 && maped[0].to && maped[0].to.uniProtkbId)
                uniprot.value[id] = CACHE.value[id] = (maped[0].to ? maped[0].to.uniProtkbId : null)
        })
}

onMounted(() => {
    setTimeout(() => {
        parseSeq(selected.value)
    }, 300);
})

</script>

<template>
    <div class="flex flex-wrap justify-center items-center">
        <template v-if="modo === 1">
            <div class="mx-8 my-2">
                <Combobox v-model="selected" v-if="genes && genes.length > 0" class="w-48 mx-4">
                    <div class="relative mt-1">
                        <div
                            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                            <ComboboxInput
                                class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                :displayValue="(gene) => gene ? gene.getNome() : ''"
                                @change="query = $event.target.value" />
                            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                        <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100"
                            leaveTo="opacity-0" @after-leave="query = ''">
                            <ComboboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <div v-if="filteredGene.length === 0 && query !== ''"
                                    class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    <Texto>Nenhum resultado encontrado.</Texto>
                                </div>

                                <ComboboxOption v-for="gene in filteredGene" as="template" :key="gene.nome"
                                    :value="gene" v-slot="{ selected, active }">
                                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                                        'bg-teal-600 text-white': active,
                                        'text-gray-900': !active,
                                    }">
                                        <span class="block truncate"
                                            :class="{ 'font-medium': selected, 'font-normal': !selected }">
                                            {{ gene ? gene.getNome() : null }}
                                        </span>
                                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                                            :class="{ 'text-white': active, 'text-teal-600': !active }">
                                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                </ComboboxOption>
                            </ComboboxOptions>
                        </TransitionRoot>
                    </div>
                </Combobox>

            </div>
            <div class="mx-8 my-2">
                <Combobox v-model="selectedIso" v-if="selected" class="w-48 mx-4" @click="clearISO()">
                    <div class="relative mt-1">
                        <div
                            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                            <ComboboxInput
                                class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                :displayValue="(iso) => iso ? iso.getNome() : ''"
                                @change="queryIso = $event.target.value" />
                            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                        <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100"
                            leaveTo="opacity-0" @after-leave="queryIso = ''">
                            <ComboboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <div v-if="filteredIso.length === 0 && queryIso !== ''"
                                    class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    <Texto>Nenhum resultado encontrado.</Texto>
                                </div>

                                <ComboboxOption v-for="iso in selected.getIsoformas()" as="template" :key="iso.nome"
                                    :value="iso" v-slot="{ selectedIso, active }">
                                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                                        'bg-teal-600 text-white': active,
                                        'text-gray-900': !active,
                                    }">
                                        <span class="block truncate"
                                            :class="{ 'font-medium': selectedIso, 'font-normal': !selectedIso }">
                                            {{ iso.getNome() }}
                                        </span>
                                        <span v-if="selectedIso"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3"
                                            :class="{ 'text-white': active, 'text-teal-600': !active }">
                                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                </ComboboxOption>
                            </ComboboxOptions>
                        </TransitionRoot>
                    </div>
                </Combobox>

            </div>

            <Button class="h-8 mx-1 rounded-full" color="blue" @click="parseSeq(selected)" :disabled="!selectedIso">
                <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
            </Button>
            <div class="my-4  mx-16 w-full flex justify-center">
                <span class="flex inline text-slate-600">
                    <b class="mx-2 text-slate-700">{{ selected ? selected.getNome().slice(0, 50) : '' }}</b> {{
                            selectedIso
                                ?
                                selectedIso.getNome() : ''
                    }} - {{ selectedIso ? selectedIso.meta['PTNA'] : '' }}
                </span>
            </div>
            <div class="max-w-2xl break-all text-justify font-mono m-2 leading-1 font-light" v-html="sequence">
            </div>
        </template>
        <template v-else>
            <div class="mx-8 my-2">
                <Combobox v-model="selectedPTN" class="w-48 mx-4">
                    <div class="relative mt-1">
                        <div
                            class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                            <ComboboxInput
                                class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                :displayValue="(ptn) => ptn ? ptn.meta['PTNA'] : ''"
                                @change="queryPTN = $event.target.value" />
                            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                        <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100"
                            leaveTo="opacity-0" @after-leave="queryPTN = ''">
                            <ComboboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <div v-if="filteredPTN.length === 0 && queryPTN !== ''"
                                    class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    <Texto>Nenhum resultado encontrado.</Texto>
                                </div>

                                <ComboboxOption v-for="ptn in filteredPTN" as="template" :key="ptn" :value="ptn"
                                    v-slot="{ selectedPTN, active }">
                                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                                        'bg-teal-600 text-white': active,
                                        'text-gray-900': !active,
                                    }">
                                        <span class="block truncate"
                                            :class="{ 'font-medium': selectedPTN, 'font-normal': !selectedPTN }">
                                            {{ ptn ? ptn.meta['PTNA'] : '' }}
                                        </span>
                                        <span v-if="selectedPTN"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3"
                                            :class="{ 'text-white': active, 'text-teal-600': !active }">
                                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                </ComboboxOption>
                            </ComboboxOptions>
                        </TransitionRoot>
                    </div>
                </Combobox>
            </div>
            <Button class="h-8 mx-1 rounded-full" color="blue" @click="loadUniprot"
                v-if="selectedPTN && !uniprot[selectedPTN.meta['PTNA']]">
                <CheckIcon class="h-5 w-5" />
            </Button>
            <div class="my-4  mx-16 w-full flex justify-center">
                <span class="flex inline items-center text-slate-600">
                    <b class="mx-2 text-slate-700">{{ selectedPTN ? selectedPTN.meta['PTNA'] : '' }}</b>
                    <a class="bg-indigo-300 text-white mx-2 p-1 rounded-full"
                        v-if="selectedPTN && uniprot[selectedPTN.meta['PTNA']] && (uniprot[selectedPTN.meta['PTNA']].trim().length > 1)"
                        :href="`https://www.uniprot.org/uniprotkb/${uniprot[selectedPTN.meta['PTNA']]}/entry`"
                        target="_blank">{{
                                uniprot[selectedPTN.meta['PTNA']]
                        }}</a></span>

            </div>
            <div v-if="selectedPTN" class="max-w-2xl break-all text-justify font-mono m-8 leading-none font-light">
                {{ selectedPTN.seq }}
            </div>
        </template>
    </div>

</template>