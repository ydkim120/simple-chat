// import ConfirmDialog from '@/components/confirmDialog.vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import './style.css'
import App from './App.vue'
import router from './router'
// import store from './store'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/saga-blue/theme.css' //theme
import 'primevue/resources/primevue.min.css' //core CSS
import 'primeicons/primeicons.css' //icons
import ConfirmationService from 'primevue/confirmationservice';
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import InlineMessage from 'primevue/inlinemessage'
import PanelMenu from 'primevue/panelmenu'
import AutoComplete from 'primevue/autocomplete'
import FileUpload from 'primevue/fileupload'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import Chip from 'primevue/chip'
import Tooltip from 'primevue/tooltip'
import Calendar from 'primevue/calendar'
import Badge from 'primevue/badge'

import Editor from 'primevue/editor'
import UserProfilePhoto from '@/components/UserProfilePhoto.vue'

// import confirm from '@/utils/ConfirmDialog'

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .use(PrimeVue, { ripple: true })
  .use(ConfirmationService)
  .component('Button', Button)
  .component('SplitButton', SplitButton)
  .component('InputText', InputText)
  .component('Password', Password)
  .component('InlineMessage', InlineMessage)
  .component('PanelMenu', PanelMenu)
  .component('Editor', Editor)
  .component('AutoComplete', AutoComplete)
  .component('FileUpload', FileUpload)
  .component('ConfirmDialog', ConfirmDialog)
  .component('Dialog', Dialog)
  .component('Skeleton', Skeleton)
  .component('Chip', Chip)
  .component('Calendar', Calendar)
  .component('Badge', Badge)
  .component('UserProfilePhoto', UserProfilePhoto)
  .directive('tooltip', Tooltip)
  .mount('#app')

// App.config.globalProperties.$confirm = confirm


