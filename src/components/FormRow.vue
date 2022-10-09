<script setup>
const props = defineProps({
    grid: { default: 1 },
});
</script>
<template>
    <div :class="`my-1 grid gap-6 grid-cols-${grid} md:grid-cols-${grid} lg:grid-cols-${grid}`">
        <slot />
    </div>
</template>