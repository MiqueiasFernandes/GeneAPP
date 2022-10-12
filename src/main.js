import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { createHead } from '@vueuse/head'
import { PROJETO } from "./core/State"


const app = createApp(App)
const head = createHead()

const router = createRouter({
  history: createWebHistory()
})

router.beforeEach((to) => {
  if (['/overview', '/events', '/genes'].includes(to.name) && PROJETO.status < 1) {
    return { name: '/start' }
  }
})

app.use(router)
app.use(head)
app.mount(document.body)
