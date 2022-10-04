<script setup>
const props = defineProps({
    grid: { type: Number, default: 1 },
});
</script>
<template>
    <div :class="'mt-1 '+(grid > 1 ? ('grid grid-cols-'+grid+' gap-'+grid) : '')">
        <slot />
    </div>
</template>