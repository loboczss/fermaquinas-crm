export default defineNuxtPlugin((nuxtApp) => {
  const previousHandler = nuxtApp.vueApp.config.warnHandler

  nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
    if (typeof msg === 'string') {
      if (msg.includes('<Suspense> is an experimental feature')) {
        return
      }
      if (msg.includes('Extraneous non-props attributes (style)')) {
        return
      }
    }

    if (previousHandler) {
      previousHandler(msg, instance, trace)
      return
    }

    console.warn('[Vue warn]:', msg, trace)
  }
})
