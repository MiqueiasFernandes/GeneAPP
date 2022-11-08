<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/solid'
import { onMounted } from 'vue';
const props = defineProps({
    items: { default: 0 },
    size: { default: 20 },
});

const atual = ref(0)

const total = Math.ceil(props.items / props.size)
const pages = ref([])

const top = () => window.scrollTo(0, 0);

onMounted(() => {
    for (let i = 0; i < total; i++) {
        const prev = pages.value.length > 0 ? pages.value[0][2] + 1 : 0
        pages.value.push([i, prev, Math.min(props.items - 1, prev + props.size)])
    }
})

const emits = defineEmits(["change"])
</script>
<template>
    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <button @click="top(); $emit('change', atual = 0)" v-if="atual > 0"
            class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20">
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
        </button>
        <template v-if="atual > 10">
            <button aria-current="page" v-for="page in pages.slice(0, 3)"
                @click="top(); $emit('change', atual = page[0])"
                :class="`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 ${page[0] === atual ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`">
                {{ page[0] + 1 }}
            </button>
            <button aria-current="page"
                :class="`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 bg-white border-gray-300 text-gray-500 hover:bg-gray-50`">
                ...
            </button>
        </template>

        <button aria-current="page" v-for="page in pages.slice(Math.max(0, atual - 5), Math.min(total, atual + 5))"
            @click="top(); $emit('change', atual = page[0])"
            :class="`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 ${page[0] === atual ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`">
            {{ page[0] + 1 }}
        </button>

        <template v-if="atual < total - 10">
            <button aria-current="page"
                :class="`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 bg-white border-gray-300 text-gray-500 hover:bg-gray-50`">
                ...
            </button>
            <button aria-current="page" v-for="page in pages.slice(-3)" @click="top(); $emit('change', atual = page[0])"
                :class="`relative z-10 inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 ${page[0] === atual ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`">
                {{ page[0] + 1 }}
            </button>
        </template>
        <button @click="top(); $emit('change', atual = total - 1)" v-if="atual < total - 1"
            class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20">
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
        </button>
    </nav>
</template>