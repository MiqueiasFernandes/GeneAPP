<script setup>
const props = defineProps({
    label: String,
    placeholder: String
});
</script>
<template>
    <label class="block">
        <span class="text-gray-700">{{label}}</span>
        <input type="text" class="
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " :placeholder="placeholder"/>
    </label>
</template>