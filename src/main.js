import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { createHead } from '@vueuse/head'

const app = createApp(App)
const head = createHead()

const router = createRouter({
  history: createWebHistory()
})

app.use(router)
app.use(head)
app.mount(document.body)
