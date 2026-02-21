import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useProfile = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const error = ref<string | null>(null)
    const loading = ref(false)
    const success = ref<string | null>(null)

    /**
     * Update user profile information
     */
    const updateProfile = async (data: { full_name?: string; email?: string; phone?: string }) => {
        loading.value = true
        error.value = null
        success.value = null

        try {
            const updateData: any = {
                data: {
                    full_name: data.full_name
                }
            }

            // Include email if provided
            if (data.email) {
                updateData.email = data.email
            }

            // Salvar telefone nos metadados (sem verificação)
            if (data.phone !== undefined) {
                updateData.data.phone = data.phone
            }

            const { data: userData, error: updateError } = await supabase.auth.updateUser(updateData)

            if (updateError) throw updateError
            
            success.value = 'Perfil atualizado com sucesso!'
            return { data: userData, error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao atualizar perfil'
            return { data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    /**
     * Change user password
     */
    const changePassword = async (currentPassword: string, newPassword: string) => {
        loading.value = true
        error.value = null
        success.value = null

        try {
            // Verify current password by attempting to sign in
            if (!user.value?.email) {
                throw new Error('Usuário não encontrado')
            }

            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user.value.email,
                password: currentPassword
            })

            if (verifyError) throw new Error('Senha atual incorreta')

            // Update to new password
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            success.value = 'Senha alterada com sucesso!'
            return { data, error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao alterar senha'
            return { data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    /**
     * Get current user data
     */
    const getCurrentUser = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: getUserError } = await supabase.auth.getUser()
            
            if (getUserError) throw getUserError
            
            return { data: data.user, error: null }
        } catch (err: any) {
            error.value = err.message || 'Erro ao buscar dados do usuário'
            return { data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    return {
        updateProfile,
        changePassword,
        getCurrentUser,
        loading,
        error,
        success,
        user
    }
}
