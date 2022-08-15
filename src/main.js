import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router/auto'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
})

app.use(router)
app.mount('#app')
