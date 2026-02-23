export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: false },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Crm: Fermaquinas',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt'
  ],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/esquecisenha', '/redefinirsenha']
    }
  },
  nitro: {
    externals: {
      inline: ['xlsx']
    }
  },
  runtimeConfig: {
    // Configurações privadas do servidor (apenas backend)
    dropboxClientId: process.env.DROPBOX_CLIENT_ID || '',
    dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
    dropboxRefreshToken: process.env.DROPBOX_REFRESH_TOKEN || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    mailerSenderEmail: process.env.MAILER_SENDER_EMAIL || '',
  }
})