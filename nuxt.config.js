// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4
  },

  vite: {
    optimizeDeps: {
      needsInterop: ['tus-js-client']
    }
  },

  css: ['@fortawesome/fontawesome-svg-core/styles.css'],

  modules: ['@nuxtjs/supabase', '@vue-macros/nuxt'],

  supabase: {
    redirect: false
  }
})
