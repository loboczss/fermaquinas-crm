# Fermaquinas CRM — Loja de Máquinas e Ferragens

Um sistema de gestão moderno para controle de faturamento, atendimento e estoque, construído com Nuxt 4, Supabase, Tailwind CSS e Dropbox API.

## 🚀 Funcionalidades Principais

- **Dashboard de Atendimentos**: Visão geral de faturamento bruto, novos clientes, volume de atendimentos e indicadores de conversão com gráficos dinâmicos e filtros de período.
- **Gestão de Vendas**: Registro e acompanhamento de vendas com autocomplete inteligente de produtos e cálculo automático de totais.
- **Catálogo de Produtos**: Gestão completa de produtos (CRUD) com edição individual e exclusão segura.
- **Sincronização via XLSX**: Atualização em massa do catálogo de produtos com processamento no servidor e backup automático datado no Dropbox.
- **Controle de Acesso (RBAC)**: Visibilidade e permissões dinâmicas baseadas no perfil do usuário (`Master` vs `Vendedor`).
- **Interface Premium**: Design responsivo com suporte a Dark Mode, animações suaves e componentes customizados (Toasts, Modais, Autocomplete).

## 🛠️ Tecnologias

- **Framework**: Nuxt 4 & Vue 3 (Composition API)
- **Estilo**: Tailwind CSS (Design System customizado)
- **Estado**: Pinia (Stores reativas)
- **Backend**: Supabase (BaaS), Nitro (serverless routes)
- **Integrações**: Dropbox API, SheetJS (xlsx), Date-fns, Chart.js

## 📥 Instalação & Uso

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` com suas credenciais:
   ```env
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_publishable_key
   SUPABASE_SECRET_KEY=your_service_role_key
   DROPBOX_CLIENT_ID=your_id
   DROPBOX_CLIENT_SECRET=your_secret
   DROPBOX_REFRESH_TOKEN=your_token
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🏗️ Estrutura do Projeto

- `/app`: Código fonte do frontend (components, pages, stores, layouts).
- `/server`: Endpoints de API e utilitários de servidor.
- `/shared`: Tipagens TypeScript e constantes globais.
- `/public`: Ativos estáticos.
