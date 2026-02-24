-- Adicionar coluna produtos_json para permitir devolução de estoque na exclusão
ALTER TABLE public.historico_vendas_fermaquinas
ADD COLUMN IF NOT EXISTS produtos_json jsonb;
