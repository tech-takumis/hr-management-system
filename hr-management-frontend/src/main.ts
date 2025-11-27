import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import type { Router } from 'vue-router'
import App from './App.vue'
import router from './router'
import './index.css'

declare module 'pinia' {
    export interface PiniaCustomProperties {
        router: Router
    }
}

const app = createApp(App)
const pinia = createPinia()

app.use(
    pinia.use(({ store }) => {
        store.router = markRaw(router)
    }),
)
app.use(router)
app.mount('#app')
