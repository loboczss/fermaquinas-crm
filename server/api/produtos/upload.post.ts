import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { getValidDropboxToken } from '../../utils/dropbox'

/**
 * POST /api/produtos/upload
 *
 * Recebe um arquivo XLSX, faz backup no Dropbox e atualiza o catálogo de produtos no Supabase.
 * Apenas usuários com role 'master' podem executar.
 *
 * Fluxo:
 * 1. Valida sessão e role master
 * 2. Lê e parseia o XLSX
 * 3. Faz backup do arquivo no Dropbox (database/xlsx/database-YYYY-MM-DD.xlsx)
 * 4. Limpa a tabela produtos (via serviceRole para bypass RLS)
 * 5. Insere os novos dados em lotes
 */
export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const serviceRole = serverSupabaseServiceRole(event)

    // 1. Validar sessão
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Verificar role master (via serviceRole para evitar problemas de RLS)
    const { data: profile } = await serviceRole
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'master') {
        throw createError({ statusCode: 403, message: 'Apenas master pode atualizar produtos' })
    }

    // 3. Ler arquivo multipart
    const formData = await readMultipartFormData(event)
    const file = formData?.find(f => f.name === 'file')

    if (!file || !file.data) {
        throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado' })
    }

    try {
        // 4. Parsear XLSX com SheetJS
        const xlsx = await import('xlsx').then(m => m.default || m)
        const workbook = xlsx.read(file.data, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) throw createError({ statusCode: 400, message: 'O arquivo XLSX está vazio' })

        const worksheet = (workbook.Sheets as Record<string, any>)[sheetName]

        // Converter sheet para JSON
        const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: null }) as any[]

        if (!rawRows || rawRows.length === 0) {
            throw createError({ statusCode: 400, message: 'O arquivo XLSX está vazio' })
        }

        // 5. Validar colunas
        const firstRow = rawRows[0]
        if (!('IDPRODUTO' in firstRow) || !('DESCRICAO' in firstRow)) {
            throw createError({ statusCode: 400, message: 'Arquivo XLSX inválido ou sem as colunas corretas' })
        }

        // 6. Backup no Dropbox
        try {
            const accessToken = await getValidDropboxToken()

            // Gerar nome do arquivo com data atual: database-YYYY-MM-DD.xlsx
            const now = new Date()
            const dateStr = now.toISOString().split('T')[0] // Formato: 2026-02-22
            const dropboxFileName = `database-${dateStr}.xlsx`
            const dropboxPath = `/database/xlsx/${dropboxFileName}`

            await $fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/octet-stream',
                    'Dropbox-API-Arg': JSON.stringify({
                        path: dropboxPath,
                        mode: 'overwrite',
                        autorename: false,
                        mute: true
                    })
                },
                body: file.data
            })

            console.log(`[Upload] Backup XLSX salvo no Dropbox: ${dropboxPath}`)
        } catch (dropboxErr: any) {
            // Log o erro mas não bloqueia o upload para o Supabase
            console.error('[Upload] Erro ao salvar backup no Dropbox (não-bloqueante):', dropboxErr?.data || dropboxErr?.message || dropboxErr)
        }

        // 7. Converter Tipos
        const processedRows = rawRows.map(row => {
            return {
                IDEMPRESA: typeof row.IDEMPRESA === 'number' ? row.IDEMPRESA : Number(row.IDEMPRESA) || null,
                IDPRODUTO: typeof row.IDPRODUTO === 'number' ? row.IDPRODUTO : Number(row.IDPRODUTO) || null,
                IDSUBPRODUTO: typeof row.IDSUBPRODUTO === 'number' ? row.IDSUBPRODUTO : Number(row.IDSUBPRODUTO) || null,
                DESCRICAO: row.DESCRICAO ? String(row.DESCRICAO).trim() : null,
                MODELO: row.MODELO ? String(row.MODELO).trim() : null,
                EMBALAGEMSAIDA: row.EMBALAGEMSAIDA ? String(row.EMBALAGEMSAIDA).trim() : null,

                // Colunas text no Supabase — enviar como string
                VALPRECOVAREJO: row.VALPRECOVAREJO != null ? String(row.VALPRECOVAREJO) : null,
                QTDATUALESTOQUE: row.QTDATUALESTOQUE != null ? String(row.QTDATUALESTOQUE) : null,
                VALTOTAL: row.VALTOTAL != null ? String(row.VALTOTAL) : null,
            }
        })

        // 8. DELETE ALL via serviceRole (bypass RLS)
        const { error: deleteError } = await serviceRole
            .from('produtos')
            .delete()
            .gte('IDPRODUTO', -1)

        if (deleteError) {
            console.error('[Upload] Erro ao deletar produtos:', deleteError)
            throw createError({ statusCode: 500, message: 'Erro ao limpar dados atuais do catálogo' })
        }

        // 9. INSERT EM LOTES DE 500 via serviceRole (bypass RLS)
        const BATCH_SIZE = 500
        for (let i = 0; i < processedRows.length; i += BATCH_SIZE) {
            const batch = processedRows.slice(i, i + BATCH_SIZE)

            const { error: insertError } = await serviceRole
                .from('produtos')
                .insert(batch)

            if (insertError) {
                console.error(`[Upload] Erro inserindo lote ${i} - ${i + BATCH_SIZE}:`, insertError)
                throw createError({ statusCode: 500, message: `Erro ao inserir lote de produtos (${i}-${i + BATCH_SIZE})` })
            }
        }

        // 10. Sucesso
        return { success: true, total: processedRows.length }

    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('[Upload] Erro processando XLSX:', error)
        throw createError({ statusCode: 500, message: 'Falha durante o processamento do arquivo' })
    }
})
