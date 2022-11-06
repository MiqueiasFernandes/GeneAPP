<script setup>
import { computed } from '@vue/reactivity';

const props = defineProps({
    rows: {},
    cols: { default: ['Coluna', { meta: { id: '', lab: 'Coluna', ord: 0 } }] },
    indexed: { default: false },
    size: { default: 100 }
});

let PAGINAR = computed(() => props.rows.length > props.size)
const PAGINA = ref(0)

let columns = computed(() => {
    if (props.cols[0].meta) {
        ///modo meta
        return props.cols.sort((a, b) => a.meta.ord - b.meta.ord).map(c => c.meta)
    } else {
        /// modo simples
        return props.cols.map(c => ({ id: c, lab: c }))
    }
})

let page = computed(() => {
    if (PAGINAR) {
        const de = props.size * PAGINA.value
        return props.rows.slice(de, de + props.size)
    } else {
        return props.rows
    }
})

</script>
<template>
    <div>
        <table class="table-auto w-full bg-gray-50" v-if="cols && rows">
            <thead>
                <tr class="border-b-2 border-t-4 border-gray-600 text-slate-700">
                    <th v-if="indexed">#</th>
                    <th v-for="col in columns">
                        {{ col.lab }}
                    </th>
                </tr>
            </thead>
            <!-- <Imagem v-if="rows.length < 1" class="m-8"></Imagem> -->
            <tbody class="border-b-2 border-gray-600  text-slate-600">
                <tr class="hover:bg-gray-300" v-for="(row, index) in page">
                    <td v-if="indexed">{{ index + 1  + PAGINA*size}}</td>
                    <td v-for="col in columns" :class="col.class + ' text-center ' + row['class_' + col.id]"
                        :colspan="row['span_' + col.id]">{{ row[col.id] }}</td>
                </tr>
            </tbody>
        </table>
        <div v-if="PAGINAR" class="w-full flex justify-center my-2">
            <Pagination @change="(p) => PAGINA=p" :items="rows.length" :size="size"></Pagination>
        </div>
    </div>
</template>