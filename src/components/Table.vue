<script setup>
const props = defineProps({
    rows: {},
    cols: {}
});
</script>
<template>
    <table class="table-auto w-full bg-gray-50" v-if="cols && rows">
        <thead>
            <tr class="border-b-2 border-t-4 border-gray-600">
                <th v-for="col in cols">
                    {{ col }}
                </th>
            </tr>
        </thead>
        <tbody class="border-b-2 border-gray-600">
            <tr class="hover:bg-gray-300" v-for="row in rows">
                <td v-for="col in cols" class="text-center">{{ row[col] }}</td>
            </tr>
        </tbody>
    </table>
</template>