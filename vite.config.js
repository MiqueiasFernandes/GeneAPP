import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterExports } from 'unplugin-vue-router'
import Components from 'unplugin-vue-components/vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    VueRouter(),
    Components({ resolvers: [HeadlessUiResolver()] }),
    AutoImport({
      include: [/\.vue$/, /\.js$/],
      imports: ['vue', { 'vue-router/auto': VueRouterExports }],
    }),
  ],
  server: {
    open: true,
  },
})
