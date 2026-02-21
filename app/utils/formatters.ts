export const formatClientName = (nome?: string | null, nomeSocial?: string | null): string => {
    let targetName = nome;

    if (!targetName || targetName.trim() === '') {
        targetName = nomeSocial;
    }

    if (!targetName || targetName.trim() === '') {
        return 'Cliente Desconhecido';
    }

    // Lógica de limpeza
    // 1. Remove emojis
    let cleaned = targetName.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    // 2. Remove o til (~) apenas do início (e possíveis espaços após ele)
    cleaned = cleaned.replace(/^~\s*/, '');

    // 3. Remove espaços duplos e dá trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned || 'Cliente Desconhecido';
}
