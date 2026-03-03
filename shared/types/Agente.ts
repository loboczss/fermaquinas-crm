export interface SystemPrompt {
    id: number
    created_at?: string
    prompt: string | null
}

export interface InformacaoRag {
    id: number
    created_at?: string
    content: string | null
}
