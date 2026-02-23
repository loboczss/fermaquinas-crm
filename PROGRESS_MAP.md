# 📍 Mapa de Progresso - CRM Fermaquinas Avatar Upload

**Data:** 22 de Fevereiro de 2026  
**Projeto:** Nuxt 4 SaaS CRM - Fermaquinas Materiais para Construção  
**Status:** Em Desenvolvimento - Avatar Upload com Dropbox

---

## 🎯 Objeivo Principal (Sessão Atual)

Implementar upload de **foto de perfil do usuário** com armazenamento em **Dropbox** e exibição em tempo real no **header** de todas as páginas.

---

## ✅ O QUE FOI JÁ COMPLETADO

### **1. Backend - API Dropbox** 
✅ **Arquivo:** [server/api/dropbox/upload.post.ts](server/api/dropbox/upload.post.ts)

**O que faz:**
- Recebe arquivo via `multipart/form-data` 
- Valida tipo (jpg, png, gif, webp) e tamanho (máx 5MB)
- Faz upload para Dropbox `/Fermaquinas/Fotos/`
- Cria link compartilhado público
- Converte para link direto: `dl.dropboxusercontent.com` + `?dl=0`
- Retorna `{ success: true, foto_url: "https://..." }`

**Última Correção:** Regex para converter `?dl=0` ou `&dl=0` para manter compatibilidade com links `?rlkey=...&dl=0`

---

### **2. Backend - Utilitário Dropbox**
✅ **Arquivo:** [server/utils/dropbox.ts](server/utils/dropbox.ts)

**O que faz:**
- Função `getValidDropboxToken()` 
- Renova `access_token` automaticamente usando `refresh_token`
- OAuth2 grant_type=refresh_token
- Valida credenciais em `runtimeConfig`

**Status:** Completo e funcional ✅

---

### **3. Backend - API Profile GET**
✅ **Arquivo:** [server/api/perfil/me.get.ts](server/api/perfil/me.get.ts)

**O que faz:**
- Retorna dados do perfil autenticado
- Busca `role` e `avatar_url` da tabela `profiles`
- Tenta com `client` primeiro, depois `serviceRole` para bypass RLS
- Usa `.maybeSingle()` para evitar PGRST116 error

**Mudança Recente:** Adicionado select para `avatar_url`

---

### **4. Backend - API Profile PUT**
✅ **Arquivo:** [server/api/perfil/me.put.ts](server/api/perfil/me.put.ts)

**O que faz:**
- Recebe: `{ full_name?, phone?, avatar_url? }`
- Atualiza `full_name` e `phone` em `user_metadata` do Auth
- Atualiza `avatar_url` na tabela `profiles` usando `serviceRole`
- Retorna dados atualizados

**Status:** Completo ✅

---

### **5. Tipos TypeScript**
✅ **Arquivo:** [app/types/profile.types.ts](app/types/profile.types.ts)

**Mudança:**
```typescript
export interface UserProfile {
  // ... campos existentes
  avatar_url?: string | null  // ✨ NOVO
}
```

---

### **6. Store Pinia - Profile**
🔄 **Arquivo:** [app/stores/profile.ts](app/stores/profile.ts)

**Métodos disponíveis:**
- `fetchProfile()` - Busca dados do `/api/perfil/me` e seta em `this.profile`
- `updateProfile(payload)` - PUT para `/api/perfil/me` com avatar_url
- `refreshProfile()` - Alias para `fetchProfile()`
- `updateProfileData()` - Atualiza dados localmente
- `clearProfile()` - Limpa estado

**Logs Adicionados:**
```
[ProfileStore] Resposta bruta da API /api/perfil/me: {...}
[ProfileStore] Perfil setado no store: {...}
[ProfileStore] Enviando atualização: {...}
[ProfileStore] Resposta do PUT: {...}
[ProfileStore] Perfil era null, carregando do servidor...
[ProfileStore] Atualizando campos do perfil existente...
```

**Status:** Com mais debugging de logs 🔍

---

### **7. Layout - Sincronização Automática**
🔄 **Arquivo:** [app/layouts/default.vue](app/layouts/default.vue)

**O que faz:**
- Função `loadUserProfile()` - Carrega auth + role + profile
- **watch(user)** - Carrega perfil ao fazer login
- **watch(route.path)** - ✨ **RECARREGA PERFIL TODA VEZ QUE ROTA MUDA (Crítico para avatar persistir!)**
- **onMounted()** - Carrega se for primeira vez ou sincroniza

**Logs:**
```
[Layout] Perfil carregado com sucesso: {...}
[Layout] Rota mudou para: /crm - sincronizando perfil...
[Layout] Perfil sincronizado: {...}
```

**Status:** Completo com rota watch ✅

---

### **8. Componente Header - MenuDropdown**
🔄 **Arquivo:** [app/components/header/MenuDropdown.vue](app/components/header/MenuDropdown.vue)

**O que faz:**
- Exibe avatar com imagem se `profileStore.profile?.avatar_url` existe
- Fallback para iniciais coloridas se sem foto
- **onMounted()** - ✨ **NOVO: Carrega perfil se for null**
- watch profundo em `profileStore.profile` com `deep: true`

**Logs Adicionados:**
```
[MenuDropdown Mount] Usuário: email@...
[MenuDropdown Mount] Perfil antes de carregar: {...}
[MenuDropdown] Perfil atualizado: {...}
[MenuDropdown] Avatar disponível: https://...
```

**Status:** Com carregamento fallback no mount 🔄

---

### **9. Componente Form - PerfilForm**
🔄 **Arquivo:** [app/components/perfil/PerfilForm.vue](app/components/perfil/PerfilForm.vue)

**O que faz:**
- UI: Círculo com avatar + iniciais
- Input file escondido acionado ao clicar
- Validação: tipo + tamanho (5MB)
- Upload: FormData → `/api/dropbox/upload`
- Atualiza: `profileStore.updateProfile({ avatar_url })`
- **Recarrega:** `profileStore.fetchProfile()` após sucesso

**Logs Adicionados:**
```
[PerfilForm] Enviando atualização de avatar com URL: https://...
[PerfilForm] Resultado do updateProfile: {...}
[PerfilForm] Iniciando fetchProfile...
[PerfilForm] Perfil recarregado após upload: {...}
```

**Status:** Com recarregamento após upload ✅

---

## 🚨 PROBLEMA ATIVO - EM INVESTIGAÇÃO

### **Avatar não persiste após mudar de página**

**Sintomas:**
```
[MenuDropdown] Perfil atualizado: null
[MenuDropdown] Sem avatar, usando iniciais
```

**Root Cause Identificada:**
`profileStore.profile` está vindo como `null` apesar do upload ter funcionado no banco de dados.

**Hipóteses:**
1. ✅ `fetchProfile()` chamado mas API retornando null
2. ✅ `updateProfile()` não estava recarregando perfil quando era null
3. 🔄 **Novo:** MenuDropdown não tinha fallback para carregar perfil no mount

**Modificações de Debug Implementadas:**
- ✅ Logs JSON.stringify completos em `fetchProfile()`
- ✅ `updateProfile()` agora chama `fetchProfile()` se perfil era null
- ✅ MenuDropdown agora carrega perfil no `onMounted()` se for null
- ✅ Logs em todos os pontos críticos

**Próximo Passo:** Executar testes com os logs novos (aguardando feedback do usuário)

---

## 📋 ARQUIVOS MODIFICADOS (NÃO COMMITADOS AINDA)

```
Modified:   app/components/header/MenuDropdown.vue
Modified:   app/components/perfil/PerfilForm.vue
Modified:   app/layouts/default.vue
Modified:   app/stores/profile.ts
Modified:   server/api/dropbox/upload.post.ts
```

**Status Git:** Working directory com mudanças não staged

---

## 🔄 FLUXO ESPERADO (Teórico)

```
1. Usuário faz login
   ↓
2. default.vue watch(user) → loadUserProfile()
   → authStore.initializeProfile()
   → authStore.fetchUserRole()
   → profileStore.fetchProfile() ✨ carrega avatar_url do BD
   ↓
3. MenuDropdown renderiza com avatar na foto
   ↓
4. Usuário clica na foto → upload
   ↓
5. PerfilForm.handleAvatarUpload()
   → $fetch POST /api/dropbox/upload
   → profileStore.updateProfile({ avatar_url })
   → profileStore.fetchProfile() ✨ recarrega DB
   ↓
6. Avatar atualizado em tempo real ✅
   ↓
7. Usuário muda de página
   ↓
8. default.vue watch(route.path) → profileStore.fetchProfile()
   ↓
9. Avatar persiste em novo componente ✅
```

---

## 🧪 TESTES PENDENTES

### **Teste 1: Verificar Logs**
1. F5 para recarregar
2. F12 Console
3. Procurar por logs `[MenuDropdown Mount]` e `[ProfileStore]`
4. Cole resultado

### **Teste 2: Upload com Debugging**
1. Perfil → Upload foto
2. Observe logs:
   - `[PerfilForm] Enviando atualização`
   - `[ProfileStore] Resposta do PUT`
   - `[MenuDropdown] Perfil atualizado` (deve ter dados, não null)
3. Cole logs completos

### **Teste 3: Persistência**
1. Upload foto
2. Navegue: Dashboard → CRM → Perfil
3. Verifique se avatar persiste
4. Cole logs de cada mudança de rota

---

## 🗂️ ARQUIVOS PRINCIPAIS DO PROJETO

### **Database (Supabase)**
- Tabela: `profiles`
  - `user_id` (UUID FK → auth.users.id)
  - `role` (text: 'master' | 'vendedor')
  - `avatar_url` (text, null) ✨ **NOVO**

### **Environment Variables (.env)**
```
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SECRET_KEY=...
DROPBOX_CLIENT_ID=p2td8utre6n2u9t
DROPBOX_CLIENT_SECRET=8bsie265nzi4pa0
DROPBOX_REFRESH_TOKEN=PEJyHDw4RHoAAAAAAAAAAQS8AvxJJ2gc5ARvhPMlaqjXdPTgbl8cJ76VxjiPVxX4
```

### **nuxt.config.ts**
```typescript
runtimeConfig: {
  dropboxClientId: process.env.DROPBOX_CLIENT_ID || '',
  dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
  dropboxRefreshToken: process.env.DROPBOX_REFRESH_TOKEN || '',
}
```

---

## 📞 INFORMAÇÕES DE CONTEXTO

**Usuário Atual (Teste):**
- Email: `contato@evastur.com`
- User ID: `c49e43d3-682e-4d6a-b3f6-7a7b444d9bdb`
- Role: `master`
- Avatar URL (atual): `https://dl.dropboxusercontent.com/scl/fi/.../foto.jpg?rlkey=...&dl=0`

**Stack Técnico:**
- Nuxt 4.3.1, Vue 3.5.28, TypeScript
- Tailwind CSS 6.14.0
- Pinia 3.0.4 (state management)
- Supabase (auth + database)
- Dropbox API (cloud storage)
- Nitro 2.13.1 (server)

---

## 🎬 PRÓXIMOS PASSOS

### **Imediato (Esta Sessão):**
1. ✋ Aguardar resultado dos testes com logs
2. 🔍 Analisar logs para identificar onde perfil vira null
3. 🐛 Debugar resposta da API `/api/perfil/me`
4. ✅ Confirmar que avatar persiste entre páginas

### **Após Resolver Avatar:**
1. Commit de todas as mudanças
2. Remover logs de debug (ou deixar em modo silencioso)
3. Testar com múltiplos usuários
4. Implementar cache/otimização se necessário

### **Futuro:**
- [ ] Exibir avatar em CRM table (clientes)
- [ ] Avatar em notificações/chat
- [ ] Redimensionamento automático de imagens
- [ ] Compressão antes do upload
- [ ] Deletar avatar antigo ao fazer upload novo

---

## 📝 NOTAS

- Todos os endpoints retornam `{ success, foto_url }` ou erro com status HTTP apropriado
- Avatar armazenado em `/Fermaquinas/Fotos/` no Dropbox com nome `{timestamp}_{filename}`
- Links diretos usando domínio `dl.dropboxusercontent.com` (não www.dropbox.com)
- RLS (Row Level Security) do Supabase bypassado com `serverSupabaseServiceRole` para atualizar avatar
- Hot-reload ativado para dev - mudanças em `*.vue` e `*.ts` aplicadas automaticamente

---

**Última Atualização:** 22 Feb 2026 18:54  
**Servidor Dev:** Rodando em `http://localhost:3000`  
**Build:** ✅ 5.72 MB (1.47 MB gzip)
