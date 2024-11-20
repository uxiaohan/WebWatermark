import { createApp } from 'vue'
import App from './App.vue'

// 基础样式
import '@/assets/less/main.less'
// tailwind-base
import '@/assets/tailwind-base.css'

const app = createApp(App)

app.mount('#app')
