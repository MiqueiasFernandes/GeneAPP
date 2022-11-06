<script setup>
const props = defineProps({
    rows: {},
    cols: { default: ['Coluna', { meta: { id: '', lab: 'Coluna', ord: 0 } }] },
    indexed: { default: false }
});

let columns = computed(() => {
    if (props.cols[0].meta) {
        ///modo meta
        return props.cols.sort((a, b) => a.meta.ord - b.meta.ord).map(c => c.meta)
    } else {
        /// modo simples
        return props.cols.map(c => ({ id: c, lab: c }))
    }
})

</script>
<template>
    <table class="table-auto w-full bg-gray-50" v-if="cols && rows">
        <thead>
            <tr class="border-b-2 border-t-4 border-gray-600 text-slate-700">
                <th v-if="indexed">#</th>
                <th v-for="col in columns">
                    {{ col.lab }}
                </th>
            </tr>
        </thead>
        <tbody class="border-b-2 border-gray-600  text-slate-600">
            <tr class="hover:bg-gray-300" v-for="(row, index) in rows">
                <td v-if="indexed">{{ index + 1 }}</td>
                <td v-for="col in columns" :class="col.class + ' text-center ' + row['class_' + col.id]"
                    :colspan="row['span_' + col.id]">{{ row[col.id] }}</td>
            </tr>
        </tbody>
    </table>
</template>