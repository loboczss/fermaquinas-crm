import { onMounted } from 'vue'

export const useDarkMode = () => {
    // Use Nuxt's useState to share the theme state globally across all components
    const isDark = useState('is_dark', () => false)

    const toggleDark = () => {
        isDark.value = !isDark.value
        console.log('[useDarkMode] Toggle:', isDark.value)

        if (import.meta.client) {
            localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

            // Force update class to be absolutely sure
            if (isDark.value) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }

    // Handle initialization on the client side
    onMounted(() => {
        if (import.meta.client) {
            const savedTheme = localStorage.getItem('theme')

            if (savedTheme) {
                isDark.value = savedTheme === 'dark'
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                isDark.value = prefersDark
            }

            console.log('[useDarkMode] Initialized:', isDark.value)

            // Initial class apply
            if (isDark.value) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    })

    return {
        isDark,
        toggleDark
    }
}
