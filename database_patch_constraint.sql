-- Atualização da Tabela de Notificações
-- Execute este script no SQL Editor do Supabase para suportar o novo tipo de notificação 'novo_cliente'

ALTER TABLE public.notificacoes DROP CONSTRAINT IF EXISTS notificacoes_tipo_check;
ALTER TABLE public.notificacoes ADD CONSTRAINT notificacoes_tipo_check CHECK (tipo IN ('venda', 'aniversario', 'novo_cliente'));
