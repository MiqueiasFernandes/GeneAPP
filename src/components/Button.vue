<script setup>
const props = defineProps({
    white: { default: false },
    acent: { default: false },
    blue: { default: false },
    rose: { default: false },
    color: { default: 'white' }
});
const is_white = props.white || (props.color == 'white');
const is_acent = props.acent || (props.color == 'acent');
const is_blue = props.blue || (props.color == 'blue');
const is_rose = props.rose || (props.color == 'rose');

</script>
<template>
    <button :class="{
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-base font-medium leading-6 mx-1 my-1': true,
      'transition duration-150 ease-in-out0 focus:outline-none': true,
      'bg-sky-500 text-white font-semibold text-sm shadow-sm': is_blue,
      'bg-rose-500 text-white font-semibold text-sm shadow-sm': is_rose,
      'bg-indigo-600 text-white hover:bg-indigo-500': is_acent,
      'bg-white accent-red-500 border border-gray-300 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50': is_white
    }">
        <slot />
    </button>
</template>