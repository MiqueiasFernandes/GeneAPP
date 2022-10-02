<template>
    <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <div>
            <h2 class="text-3xl font-extrabold mb-0 leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                <slot name="titulo" />
            </h2>
            <span class="text-2xl font-extrabold text-indigo-500 ml-12">
                <slot name="subtitulo" />
            </span>
        </div>
        <slot />
    </div>
</template>