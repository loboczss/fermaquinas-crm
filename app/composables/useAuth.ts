import { useSupabaseClient } from '#imports'

export const useAuth = () => {
    const supabase = useSupabaseClient()
    const error = ref<string | null>(null)
    const loading = ref(false)

    /**
     * Login with email and password
     */
    const login = async (email: string, password: string) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError
            return { data, error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao realizar login'
            return { data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    /**
     * Logout the current user
     */
    const logout = async () => {
        loading.value = true
        error.value = null

        try {
            const { error: authError } = await supabase.auth.signOut()
            if (authError) throw authError
            return { error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao realizar logout'
            return { error: error.value }
        } finally {
            loading.value = false
        }
    }

    /**
     * Register a new user
     */
    const register = async (email: string, password: string, options?: any) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options
            })

            if (authError) throw authError
            return { data, error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao realizar cadastro'
            return { data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    return {
        login,
        register,
        logout,
        loading,
        error,
    }
}
