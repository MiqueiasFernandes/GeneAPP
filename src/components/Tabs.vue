<script setup>

const props = defineProps({
    names: { default: ['tab1', 'tab2', 'tab3'] },
    disable: { default: ['tab2'] },
    active: { default: 'tab1' }
});

</script>
<template>
    <div class="border-b border-gray-200 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <Tab v-for="tab in names" :id="tab" :disabled="disable.includes(tab)" :active="active === tab"
                @click="active = tab">
                <slot :name="tab" />
            </Tab>
        </ul>
    </div>
    <slot :name="active+'Content'" />
</template>