import { config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('Icon', FontAwesomeIcon, {})
})
