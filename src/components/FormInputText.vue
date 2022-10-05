<script setup>
const props = defineProps({
    label: String,
    placeholder: String,
    content: String,
    float: { default: true }
});

const content = ref(props.content);
defineExpose({ content })
</script>
<template>
    <div v-if="float" class="relative z-0 mb-6 w-full group">
        <input type="text" name="floating" id="floating" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 
            border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 
            focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " v-model="content" />
        <label for="floating" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 
            transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 
            peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75 peer-focus:-translate-y-6">{{label}}</label>
    </div>
    <div v-else>
        <label class="block">
            <span class="text-sm font-medium text-gray-700">{{label}}</span>
            <input type="text" class="
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-indigo-500 focus:bg-white
                  " :placeholder="placeholder" v-model="content" />
        </label>
    </div>
</template>