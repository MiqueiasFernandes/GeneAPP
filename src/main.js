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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNOpScJm3iP9ErR6sQeXim7OFZ_Vg4HwU",
  authDomain: "geneapp-55cf9.firebaseapp.com",
  projectId: "geneapp-55cf9",
  storageBucket: "geneapp-55cf9.appspot.com",
  messagingSenderId: "738472872889",
  appId: "1:738472872889:web:1dffc2f9049476b02d8468",
  measurementId: "G-5T3VLTX3BE"
};

// Initialize Firebase
const app_firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(app_firebase);

console.log(`

      ██████╗ ███████╗███╗   ██╗███████╗ █████╗ ██████╗ ██████╗ 
     ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗
     ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████║██████╔╝██████╔╝
     ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██║██╔═══╝ ██╔═══╝ 
     ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║     ██║     
      ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝     
                   version 1.0 2022 mikeias.net   

`)
