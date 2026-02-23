# 🗺️ Mapa do Projeto - Fermaquinas CRM

## 📋 Informações Gerais

**Nome do Projeto:** Fermaquinas Materiais para Construção CRM  
**Stack:** Nuxt 4 + Vue 3 + TypeScript + Supabase + Pinia + Tailwind CSS  
**Repositório:** fermaquinas-crm  
**Arquitetura:** Full-Stack SaaS com Server-Side Rendering (SSR)

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Vue Pages  │  │  Components  │  │ Pinia Stores │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          ↕ $fetch / API Calls
┌─────────────────────────────────────────────────────────────┐
│                   SERVIDOR NUXT (Nitro)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              API Routes (server/api/)                 │  │
│  │  • /api/auth/role       • /api/crm/*                 │  │
│  │  • /api/vendas/*        • /api/dashboard/*           │  │
│  │  • /api/perfil/*        • /api/workspaces/*          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕ Supabase Client
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                            │
│                    (Supabase PostgreSQL)                     │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  auth.users      │  │  profiles        │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ crm_fermaquinas  │  │ historico_vendas │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                       │
│  │ historico_msg    │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
fermaquinas-crm/
│
├── 📂 app/                          # Frontend Vue/Nuxt
│   ├── 📂 components/               # Componentes Vue reutilizáveis
│   │   ├── AppHeader.vue           # Header global com logo
│   │   ├── AppToast.vue            # Componente de feedback global
│   │   ├── BaseButton.vue          # Botão base reutilizável
│   │   ├── BaseInput.vue           # Input base
│   │   ├── BaseModal.vue           # Modal base
│   │   ├── BaseDropdown.vue        # Dropdown base
│   │   ├── ThemeToggle.vue         # Toggle dark mode
│   │   │
│   │   ├── 📂 login/               # Componentes de autenticação
│   │   │   ├── LoginForm.vue       # Formulário de login/registro
│   │   │   └── LoginHero.vue       # Hero section do login
│   │   │
│   │   ├── 📂 header/              # Componentes do header
│   │   │   ├── MenuDropdown.vue    # Menu usuário + badge role
│   │   │   └── NotificationsDropdown.vue
│   │   │
│   │   ├── 📂 crm/                 # Componentes CRM
│   │   │   ├── CrmHeader.vue       # Cabeçalho página CRM
│   │   │   ├── CrmTable.vue        # Tabela de clientes
│   │   │   ├── CrmClientDrawer.vue # Detalhes do cliente
│   │   │   ├── BadgeSentiment.vue  # Badge sentimento
│   │   │   └── BadgeUrgency.vue    # Badge urgência
│   │   │
│   │   ├── 📂 vendas/              # Componentes de vendas
│   │   │   ├── VendasTable.vue
│   │   │   ├── VendasCreateModal.vue
│   │   │   └── VendasEditModal.vue
│   │   │
│   │   ├── 📂 produtos/            # Componentes de produtos
│   │   │   ├── ProdutosHeader.vue  # Cabeçalho com busca (debounce)
│   │   │   ├── ProdutosTable.vue   # Listagem + Paginação + Ações (Master)
│   │   │   └── ProdutosUpload.vue  # Modal/Botão de Upload XLSX (Master)
│   │   │
│   │   ├── 📂 dashboard/           # Componentes dashboard
│   │   │   ├── KpiCard.vue         # Cards de métricas
│   │   │   ├── ModernChart.vue     # Gráficos e tendências
│   │   │   ├── ContactsTable.vue   # Tabela de contatos
│   │   │   └── MessageBubble.vue   # Balões de mensagem
│   │   │
│   │   ├── 📂 atendimentos/        # Componentes Atendimentos/Chat
│   │   │   ├── ChatModal.vue       # Modal do Chat WhatsApp
│   │   │   └── ContactList.vue     # Lista de contatos recentes
│   │   │
│   │   ├── 📂 perfil/              # Componentes de perfil
│   │   │   ├── PerfilForm.vue
│   │   │   └── AlterarSenhaForm.vue
│   │   │
│   │   └── 📂 workspaces/          # Componentes workspaces
│   │       ├── WorkspaceCard.vue
│   │       ├── WorkspaceCardAdd.vue
│   │       ├── WorkspaceGrid.vue
│   │       └── ModalAddWorkspace.vue
│   │
│   ├── 📂 composables/             # Lógica reutilizável
│   │   ├── useAuth.ts              # Autenticação Supabase
│   │   ├── useDarkMode.ts          # Modo escuro
│   │   ├── useProfile.ts           # Perfil do usuário
│   │   └── useToast.ts             # Estado e funções do Toast Alerts
│   │
│   ├── 📂 stores/                  # Gerenciamento de estado (Pinia)
│   │   ├── useAuthStore.ts         # ⭐ Auth + RBAC (role: master/vendedor)
│   │   ├── useCrmStore.ts          # Estado CRM (clientes)
│   │   ├── useVendasStore.ts       # Estado vendas
│   │   ├── useChatDashboard.ts     # Estado dashboard
│   │   ├── workspaces.ts           # Estado workspaces
│   │   └── profile.ts              # Estado perfil
│   │
│   ├── 📂 pages/                   # Páginas/Rotas da aplicação
│   │   ├── index.vue               # / - Workspaces (home)
│   │   ├── login.vue               # /login
│   │   ├── dashboard.vue           # /dashboard - Chat & Métricas
│   │   ├── crm.vue                 # /crm - Gestão clientes
│   │   ├── vendas.vue              # /vendas - Histórico vendas
│   │   ├── produtos.vue            # /produtos - Módulo de produtos
│   │   ├── perfil.vue              # /perfil - Dados usuário
│   │   ├── esquecisenha.vue        # /esquecisenha
│   │   ├── redefinirsenha.vue      # /redefinirsenha
│   │   └── assinatura.vue          # /assinatura
│   │
│   ├── 📂 layouts/                 # Layouts da aplicação
│   │   └── default.vue             # Layout padrão (Header + Content)
│   │
│   ├── 📂 middleware/              # Middlewares de rota
│   │   └── guest.ts                # Middleware guest (redirect auth)
│   │
│   ├── 📂 plugins/                 # Plugins Vue
│   │   ├── profile.client.ts       # Inicializa perfil
│   │   └── vue-warn.client.ts      # Filtra warnings Vue
│   │
│   ├── 📂 types/                   # Tipos TypeScript
│   │   ├── api.types.ts            # ⭐ Contratos API (ICliente, IVenda, etc)
│   │   ├── database.types.ts       # Tipos gerados Supabase
│   │   └── profile.types.ts        # Tipos perfil usuário
│   │
│   ├── 📂 utils/                   # Utilitários
│   │   └── formatters.ts           # Formatação (datas, moeda, etc)
│   │
│   └── app.vue                     # Root component
│
├── 📂 server/                      # Backend API (Nitro)
│   └── 📂 api/                     # Endpoints API
│       │
│       ├── 📂 auth/                # Autenticação & RBAC
│       │   └── role.get.ts         # GET /api/auth/role
│       │
│       ├── 📂 crm/                 # API CRM
│       │   ├── index.get.ts        # GET /api/crm (listar + paginação)
│       │   ├── index.post.ts       # POST /api/crm (criar)
│       │   ├── search.get.ts       # GET /api/crm/search (busca rápida)
│       │   ├── [id].put.ts         # PUT /api/crm/:id (editar)
│       │   ├── [id].delete.ts      # DELETE /api/crm/:id (soft delete)
│       │   └── 📂 [id]/
│       │       └── related.get.ts  # GET /api/crm/:id/related (msgs+vendas)
│       │
│       ├── 📂 vendas/              # API Vendas
│       │   ├── index.get.ts        # GET /api/vendas (com RBAC)
│       │   └── index.post.ts       # POST /api/vendas
│       │
│       ├── 📂 dashboard/           # API Dashboard
│       │   ├── metrics.get.ts      # GET /api/dashboard/metrics
│       │   ├── contatos.get.ts     # GET /api/dashboard/contatos
│       │   └── mensagens.get.ts    # GET /api/dashboard/mensagens
│       │
│       ├── 📂 produtos/            # API Produtos
│       │   ├── index.get.ts        # GET /api/produtos (lista)
│       │   ├── index.delete.ts     # DELETE /api/produtos (individual)
│       │   ├── search.get.ts       # GET /api/produtos/search (ID/Descrição)
│       │   └── upload.post.ts      # POST /api/produtos/upload (XLSX)
│       │
│       ├── 📂 dropbox/             # API Integração Dropbox
│       │   └── upload.post.ts      # POST /api/dropbox/upload (avatars)
│       │
│       └── 📂 workspaces/          # API Workspaces
│           ├── index.get.ts        # GET /api/workspaces
│           ├── index.post.ts       # POST /api/workspaces
│           └── [id].delete.ts      # DELETE /api/workspaces/:id
│
├── 📂 public/                      # Assets estáticos
│   ├── logo.png                    # ⭐ Logo Fermaquinas
│   └── robots.txt
│
├── 📄 nuxt.config.ts               # Configuração Nuxt
├── 📄 tailwind.config.js           # ⭐ Cores (Amarelo Ouro + Laranja Tijolo)
├── 📄 tsconfig.json                # Configuração TypeScript
├── 📄 package.json                 # Dependências
├── 📄 .env                         # ⚠️ Variáveis ambiente (não commitar!)
├── 📄 DOCUMENTACAO.md              # Documentação original
└── 📄 MAPA_DO_PROJETO.md           # Este arquivo!
```

---

## 🎨 System Design & Padrões

### **Identidade Visual**
- **Cores principais:**
  - `primary`: Amarelo Ouro (#FFCC00) - Cor da marca
  - `accent`: Laranja Tijolo (#D26034) - Detalhes e CTAs
  - `secondary`: Tons de cinza/slate - Textos e fundos
- **Logo:** `/public/logo.png` (Fermaquinas)
- **Dark Mode:** Suportado via `useDarkMode` composable

### **Arquitetura de Dados (Fluxo)**

```
1. Usuário interage → Vue Component
2. Component chama → Pinia Store Action
3. Store faz → $fetch para /api/*
4. API valida sessão → serverSupabaseClient
5. API consulta/modifica → Supabase DB
6. Response retorna → Store atualiza state
7. Component reativo → UI atualiza
```

### **Sistema RBAC (Role-Based Access Control)**

```typescript
// Roles disponíveis
type UserRole = 'master' | 'vendedor'

// Tabela profiles
- user_id (UUID) → referência auth.users
- role (text) → 'master' ou 'vendedor'

// Controle de acesso:
- Master: Vê TUDO (todos vendedores, todas vendas)
- Vendedor: Vê APENAS suas próprias vendas
```

**Implementação:**
- `useAuthStore` → Busca role via `/api/auth/role`
- `isMaster` getter → Controla visibilidade UI
- Endpoints filtram dados baseado no `user.id` logado

---

## 🔐 Autenticação & Sessão

**Provider:** Supabase Auth  
**Fluxo:**
1. Login via `useAuth().login(email, password)`
2. Supabase cria sessão JWT
3. `useSupabaseUser()` reativo observa sessão
4. Layout `default.vue` inicializa perfil e role
5. Middleware `guest.ts` protege rotas autenticadas

**Arquivos importantes:**
- `app/composables/useAuth.ts` - Login/Register/Logout
- `app/stores/useAuthStore.ts` - Role management
- `server/api/auth/role.get.ts` - Endpoint role
- `server/api/perfil/initialize.post.ts` - Cria perfil se não existir

---

## 📊 Tabelas do Banco de Dados (Supabase)

```sql
┌─────────────────────┐
│   auth.users        │  (Gerenciado pelo Supabase)
├─────────────────────┤
│ id (UUID)           │
│ email               │
│ created_at          │
└─────────────────────┘
         ↓ 1:1
┌─────────────────────┐
│   profiles          │  (Custom - RBAC)
├─────────────────────┤
│ id (bigint)         │
│ user_id (UUID) FK   │ → auth.users.id
│ role (text)         │ → 'master' | 'vendedor'
│ created_at          │
└─────────────────────┘

┌──────────────────────────┐
│  crm_fermaquinas         │  (Clientes)
├──────────────────────────┤
│ id (bigint)              │
│ contato_id (text) UNIQUE │ → Número WhatsApp
│ nome (text)              │
│ ultimo_contato (timestamp)│
│ sentimento (text)        │
│ urgencia (text)          │
│ deleted_at (timestamp)   │
└──────────────────────────┘

┌──────────────────────────────┐
│  historico_vendas_fermaquinas│  (Vendas)
├──────────────────────────────┤
│ id (bigint)                  │
│ contato_id (text) FK         │ → crm_fermaquinas.contato_id
│ vendedor_id (UUID) FK        │ → auth.users.id
│ valor (numeric)              │
│ data (date)                  │
│ created_at (timestamp)       │
│ deleted_at (timestamp)       │
└──────────────────────────────┘

┌──────────────────────────────┐
│  historico_msg_fermaquinas   │  (Mensagens WhatsApp)
├──────────────────────────────┤
│ id (bigint)                  │
│ contato_id (text) FK         │ → crm_fermaquinas.contato_id
│ mensagem (text)              │
│ is_from_me (boolean)         │
│ created_at (timestamp)       │
└──────────────────────────────┘

┌──────────────────────────────┐
│   workspaces         │
├──────────────────────┤
│ id (bigint)          │
│ user_id (UUID) FK    │ → auth.users.id
│ nome (text)          │
│ cor (text)           │
│ icone (text)         │
│ created_at           │
└──────────────────────┘

┌──────────────────────────────┐
│   produtos           │ (Catálogo Automotivo)
├──────────────────────────────┤
│ IDPRODUTO (bigint)   │ → ID numérico
│ IDSUBPRODUTO (bigint)│ → ID sub-peça
│ DESCRICAO (text)     │
│ MODELO (text)        │
│ EMBALAGEMSAIDA (text)│
│ VALPRECOVAREJO (text)│ → Preço Formatado
│ QTDATUALESTOQUE (text)│
│ IDEMPRESA (bigint)   │
└──────────────────────────────┘

```

---

## 🧩 Principais Funcionalidades

### 1️⃣ **Dashboard** (`/dashboard`)
- KPIs: Vendas totais, ticket médio, conversão
- Gráficos: Linha (vendas no tempo), Barra (vendas/vendedor)
- Chat: Lista contatos únicos + área mensagens
- Filtros: Master vê todos, Vendedor vê só seus dados

**Stores:** `useChatDashboard`  
**API:** `/api/dashboard/metrics`, `/api/dashboard/contatos`, `/api/dashboard/mensagens`

---

### 2️⃣ **CRM** (`/crm`)
- Tabela clientes com paginação (15/página)
- Busca por nome/contato
- CRUD completo: Criar, Editar, Deletar (soft delete)
- Drawer detalhes: Vendas e Mensagens relacionadas
- Badges: Sentimento, Urgência

**Stores:** `useCrmStore`  
**API:** `/api/crm/*`, `/api/crm/:id/related`

---

### 3️⃣ **Vendas** (`/vendas`)
- Histórico de vendas
- Filtros: Master vê todos, Vendedor só seus
- Modal criar/editar venda
- Busca de cliente com autocomplete

**Stores:** `useVendasStore`  
**API:** `/api/vendas/*`

---

### 4️⃣ **Produtos** (`/produtos`)
- Gerenciamento de catálogo (peças e serviços)
- **Busca Híbrida**: Pesquisa instantânea por Código (ID) ou Descritivo (Modelo/Nome)
- **Gestão em Massa**: Upload de arquivo XLSX para atualização total (Master)
- **Role Control**: Vendedores apenas visualizam; Master pode excluir e atualizar via arquivo
- **Paginação**: Carregamento eficiente de milhares de itens via server-side range

**Stores:** `useProdutosStore`  
**API:** `/api/produtos/*`

---

### 5️⃣ **Perfil** (`/perfil`)
- Editar dados pessoais
- Alterar senha
- Exibição do role (Master/Vendedor)

**API:** `/api/perfil/me` (GET/PUT)

---

### 6️⃣ **Workspaces** (`/`)
- Grid de workspaces do usuário
- Criar novos workspaces
- Deletar workspaces

**Stores:** `workspaces`  
**API:** `/api/workspaces/*`

---

## 🛠️ Tecnologias & Dependências

### **Core**
- **Nuxt 4.3.1** - Framework full-stack (Vue + SSR + API)
- **Vue 3.5.28** - Framework frontend reativo
- **TypeScript** - Type safety
- **Vite 7.3.1** - Build tool ultra-rápido
- **Nitro 2.13.1** - Server engine do Nuxt

### **State & Data**
- **Pinia 3.0.4** - State management (store)
- **Supabase Client 2.0.4** - Database + Auth
- **Vue Router 4.6.4** - Roteamento

### **UI & Styling**
- **Tailwind CSS 6.14.0** - Utility-first CSS
- **Chart.js 4.5.1** - Gráficos
- **date-fns 4.1.0** - Manipulação datas

---

## 📡 API Endpoints Overview

| Método | Endpoint | Autenticado | RBAC | Descrição |
|--------|----------|-------------|------|-----------|
| **Auth & Profile** |
| GET | `/api/auth/role` | ✅ | - | Retorna role do usuário |
| POST | `/api/perfil/initialize` | ✅ | - | Cria perfil se não existe |
| GET | `/api/perfil/me` | ✅ | - | Dados do perfil |
| PUT | `/api/perfil/me` | ✅ | - | Atualizar perfil |
| **CRM** |
| GET | `/api/crm` | ✅ | - | Lista clientes (paginado) |
| POST | `/api/crm` | ✅ | - | Criar cliente |
| GET | `/api/crm/search` | ✅ | - | Busca rápida |
| PUT | `/api/crm/:id` | ✅ | - | Editar cliente |
| DELETE | `/api/crm/:id` | ✅ | - | Soft delete cliente |
| GET | `/api/crm/:id/related` | ✅ | - | Mensagens + Vendas do cliente |
| **Vendas** |
| GET | `/api/vendas` | ✅ | ✅ Master/Vendedor | Lista vendas (filtrado) |
| POST | `/api/vendas` | ✅ | - | Criar venda |
| **Dashboard** |
| GET | `/api/dashboard/metrics` | ✅ | ✅ Master/Vendedor | KPIs e métricas |
| GET | `/api/dashboard/contatos` | ✅ | ✅ Master/Vendedor | Contatos únicos |
| GET | `/api/dashboard/mensagens` | ✅ | - | Mensagens de um contato |
| **Arquivos (Dropbox)** |
| POST | `/api/dropbox/upload` | ✅ | - | Upload de avatares/mídias |
| DELETE | `/api/workspaces/:id` | ✅ | - | Deletar workspace |
| **Produtos** |
| GET | `/api/produtos` | ✅ | - | Lista produtos paginado |
| GET | `/api/produtos/search` | ✅ | - | Busca por texto ou ID |
| POST | `/api/produtos/upload` | ✅ | ✅ Master | Importar XLSX (Delete All + Insert) |
| DELETE | `/api/produtos` | ✅ | ✅ Master | Exclusão pontual de produto |


### **Padrão de Resposta API**

```typescript
// Sucesso (item único)
{ data: ICliente }

// Sucesso (lista paginada)
{
  data: ICliente[],
  total: number,
  page: number,
  limit: number
}

// Erro
throw createError({
  statusCode: 400,
  message: 'Mensagem de erro'
})
```

---

## 🔄 Fluxo de Desenvolvimento

### **Local Development**
```bash
npm run dev          # Inicia dev server (http://localhost:3000)
npm run build        # Build production
npm run preview      # Preview build production
```

### **Git Workflow**
```bash
git add .
git commit -m "Mensagem descritiva"
git push origin main
```

**Repositório:** `https://github.com/loboczss/fermaquinas-crm.git`

---

## 🎯 Convenções do Projeto

### **Nomenclatura**
- **Componentes:** PascalCase (`BaseButton.vue`, `CrmTable.vue`)
- **Pages:** kebab-case (`dashboard.vue`, `crm.vue`)
- **Stores:** camelCase com prefixo `use` (`useCrmStore.ts`)
- **API Routes:** kebab-case folders + HTTP method (`index.get.ts`, `[id].put.ts`)

### **Tipos TypeScript**
- Interfaces começam com `I` → `ICliente`, `IVenda`
- Tipos de resposta com sufixo `Response` → `IUserRoleResponse`
- Enums/Unions para valores fixos → `UserRole = 'master' | 'vendedor'`

### **Server-Side Pattern**
```typescript
// Todos os endpoints seguem este padrão:
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  // 1. Validar sessão
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user?.id) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }
  
  // 2. Consultar banco
  const { data, error: dbError } = await client
    .from('tabela')
    .select('*')
  
  // 3. Retornar
  return data
})
```

---

## 🚀 Roadmap Futuro (Sugestões)

- [ ] Integração real com API WhatsApp
- [ ] Relatórios em PDF
- [ ] Notificações push
- [ ] Chat interno entre vendedores
- [ ] Tarefas/Lembretes por cliente
- [ ] Dashboard mobile otimizado
- [ ] Exportação de dados (CSV/Excel)
- [ ] Logs de auditoria
- [ ] Multi-tenancy completo

---

## 📞 Contato & Suporte

**Desenvolvedor:** Loboczss
**Projeto:** Fermaquinas Materiais para Construção CRM  
**Última Atualização:** 22 de Fevereiro de 2026 (Inclusão Módulo Produtos/XLSX)

---

**🎉 Este mapa reflete o estado atual do projeto após a implementação do Módulo de Produtos com atualização via XLSX e controle RBAC!**
