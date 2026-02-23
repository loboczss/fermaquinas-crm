import { serverSupabaseClient } from '#supabase/server'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    // 1. Validar sessão
    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user?.id) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Ler formato
    const query = getQuery(event)
    const formato = (query.formato as string) || 'xlsx'

    // 3. Buscar todos os produtos em lotes
    let allProdutos: any[] = []
    let page = 0
    const pageSize = 1000

    while (true) {
        const { data, error: dbError } = await client
            .from('produtos')
            .select('IDPRODUTO, IDSUBPRODUTO, DESCRICAO, MODELO, EMBALAGEMSAIDA, VALPRECOVAREJO, QTDATUALESTOQUE, VALTOTAL')
            .order('DESCRICAO', { ascending: true })
            .range(page * pageSize, (page + 1) * pageSize - 1)

        if (dbError) {
            console.error('[API produtos/exportar] Erro na busca em lote:', dbError)
            throw createError({ statusCode: 500, message: 'Erro ao buscar produtos' })
        }

        if (!data || data.length === 0) break
        allProdutos = allProdutos.concat(data)
        if (data.length < pageSize) break
        page++
    }

    // 4. Renomear colunas para nomes legíveis
    const dadosFormatados = allProdutos.map(p => ({
        'ID Produto': p.IDPRODUTO,
        'ID Sub': p.IDSUBPRODUTO,
        'Descrição': p.DESCRICAO,
        'Modelo': p.MODELO || '-',
        'Embalagem': p.EMBALAGEMSAIDA,
        'Preço Varejo (R$)': p.VALPRECOVAREJO,
        'Estoque Atual': p.QTDATUALESTOQUE,
        'Valor Total (R$)': p.VALTOTAL,
    }))

    // 5. Gerar arquivo
    const ws = XLSX.utils.json_to_sheet(dadosFormatados)

    // Ajustar largura das colunas
    ws['!cols'] = [
        { wch: 12 },  // ID Produto
        { wch: 10 },  // ID Sub
        { wch: 50 },  // Descricao
        { wch: 20 },  // Modelo
        { wch: 12 },  // Embalagem
        { wch: 15 },  // Preco
        { wch: 14 },  // Estoque
        { wch: 15 },  // Valor Total
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos')

    if (formato === 'csv') {
        // CSV
        const csv = XLSX.utils.sheet_to_csv(ws)
        setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
        setResponseHeader(event, 'Content-Disposition', 'attachment; filename="produtos_fermaquinas.csv"')
        return csv
    } else {
        // XLSX
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
        setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        setResponseHeader(event, 'Content-Disposition', 'attachment; filename="produtos_fermaquinas.xlsx"')
        return buffer
    }
})
