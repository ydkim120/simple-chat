import ConfirmDialog from '@/components/confirmDialog.vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
// import store from './store'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/saga-blue/theme.css' //theme
import 'primevue/resources/primevue.min.css' //core CSS
import 'primeicons/primeicons.css' //icons

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .use(PrimeVue, { ripple: true })
  .component('ConfirmDialog', ConfirmDialog)
  .mount('#app')


