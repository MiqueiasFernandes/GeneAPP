<script setup>
const props = defineProps({
    disabled: { default: false },
    active: { default: false }
});
</script>
<template>
    <li class="mr-2">
        <a href="#" :class="[ 
            disabled ? 'inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500' :
            active ? 'inline-flex p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500 group':
            'inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
        ]">
            <slot />
        </a>
    </li>
</template>