<script setup>
const props = defineProps({
    span: { default: 2 },
    end: Boolean
});
</script>
<template>
    <div :class="`col-span-${span} md:col-span-${span} ${end ?  ' flex items-end' : ''}`">
        <slot />
    </div>
</template>