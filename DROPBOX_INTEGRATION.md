# 📤 Integração Dropbox - Documentação

## 🎯 Objetivo

Sistema de upload de imagens para o Dropbox com geração automática de links diretos (raw) para uso em cadastros de produtos, clientes e outros recursos do CRM Fermaquinas.

---

## 🏗️ Arquitetura

### **Componentes Backend (Nitro)**

```
┌─────────────────────────────────────────────┐
│  nuxt.config.ts                             │
│  ├─ dropboxClientId                         │
│  ├─ dropboxClientSecret                     │
│  └─ dropboxRefreshToken                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  server/utils/dropbox.ts                    │
│  └─ getValidDropboxToken()                  │
│     ├─ Renova access_token automaticamente  │
│     └─ Usa refresh_token OAuth2             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  server/api/dropbox/upload.post.ts          │
│  └─ POST /api/dropbox/upload                │
│     ├─ readMultipartFormData()              │
│     ├─ Upload para Dropbox                  │
│     ├─ Cria link compartilhado              │
│     └─ Retorna link direto (raw)            │
└─────────────────────────────────────────────┘
```

---

## 📄 Arquivos Criados

### **1. Configuração (`nuxt.config.ts`)**

Adicionado `runtimeConfig` com credenciais Dropbox:

```typescript
runtimeConfig: {
  dropboxClientId: process.env.DROPBOX_CLIENT_ID || '',
  dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
  dropboxRefreshToken: process.env.DROPBOX_REFRESH_TOKEN || '',
}
```

**Variáveis de Ambiente (`.env`):**
```env
DROPBOX_CLIENT_ID="p2td8utre6n2u9t"
DROPBOX_CLIENT_SECRET="8bsie265nzi4pa0"
DROPBOX_REFRESH_TOKEN="PEJyHDw4RHoAAAAAAAAAAQS8AvxJJ2gc5ARvhPMlaqjXdPTgbl8cJ76VxjiPVxX4"
```

---

### **2. Utilitário (`server/utils/dropbox.ts`)**

**Função:** `getValidDropboxToken(): Promise<string>`

**Responsabilidade:**
- Renovar automaticamente o `access_token` usando o `refresh_token`
- OAuth2 Dropbox exige renovação periódica de tokens
- Validar credenciais e tratar erros

**Fluxo:**
1. Lê credenciais do `useRuntimeConfig()`
2. POST para `https://api.dropbox.com/oauth2/token`
3. Envia `grant_type=refresh_token`, `refresh_token`, `client_id`, `client_secret`
4. Retorna novo `access_token` válido

**Endpoint Dropbox:**
```
POST https://api.dropbox.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token={DROPBOX_REFRESH_TOKEN}
&client_id={DROPBOX_CLIENT_ID}
&client_secret={DROPBOX_CLIENT_SECRET}
```

**Resposta:**
```json
{
  "access_token": "sl.B1a2b3c4...",
  "token_type": "bearer",
  "expires_in": 14400
}
```

---

### **3. Endpoint de Upload (`server/api/dropbox/upload.post.ts`)**

**Rota:** `POST /api/dropbox/upload`

**Request:**
```http
POST /api/dropbox/upload
Content-Type: multipart/form-data

file: [binary data]
```

**Response (Sucesso):**
```json
{
  "success": true,
  "foto_url": "https://dl.dropboxusercontent.com/s/abc123/1234567890_imagem.jpg?raw=1"
}
```

**Fluxo Detalhado:**

#### **Passo A: Ler Arquivo (readMultipartFormData)**
```typescript
const formData = await readMultipartFormData(event)
const fileField = formData.find(item => item.name === 'file')
```
- Valida presença do arquivo
- Verifica extensão (.jpg, .jpeg, .png, .gif, .webp)
- Extrai `filename` e `data` binária

#### **Passo B: Obter Token Válido**
```typescript
const accessToken = await getValidDropboxToken()
```
- Chama utilitário que renova token automaticamente

#### **Passo C: Upload para Dropbox**
```typescript
POST https://content.dropboxapi.com/2/files/upload
Authorization: Bearer {access_token}
Content-Type: application/octet-stream
Dropbox-API-Arg: {
  "path": "/Fermaquinas/Fotos/1234567890_imagem.jpg",
  "mode": "add",
  "autorename": true,
  "mute": false
}

[binary file data]
```
- Path: `/Fermaquinas/Fotos/{timestamp}_{filename}`
- `autorename: true` - Renomeia se já existir
- Retorna `path_display` do arquivo salvo

**Resposta:**
```json
{
  "name": "1234567890_imagem.jpg",
  "path_lower": "/fermaquinas/fotos/1234567890_imagem.jpg",
  "path_display": "/Fermaquinas/Fotos/1234567890_imagem.jpg",
  "id": "id:abc123"
}
```

#### **Passo D: Criar Link Compartilhado**
```typescript
POST https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "path": "/Fermaquinas/Fotos/1234567890_imagem.jpg",
  "settings": {
    "requested_visibility": "public",
    "audience": "public",
    "access": "viewer"
  }
}
```

**Resposta:**
```json
{
  "url": "https://www.dropbox.com/s/abc123/1234567890_imagem.jpg?dl=0",
  "path_lower": "/fermaquinas/fotos/1234567890_imagem.jpg",
  "name": "1234567890_imagem.jpg"
}
```

**Tratamento de Link Já Existente:**
Se retornar erro `shared_link_already_exists`, busca o link existente:
```typescript
POST https://api.dropboxapi.com/2/sharing/list_shared_links
{
  "path": "/Fermaquinas/Fotos/1234567890_imagem.jpg",
  "direct_only": true
}
```

#### **Passo E: Converter para Link Direto (Raw)**
```typescript
// URL original do Dropbox
https://www.dropbox.com/s/abc123/imagem.jpg?dl=0

// Substituições para link direto:
https://dl.dropboxusercontent.com/s/abc123/imagem.jpg?raw=1
```

**Transformações:**
1. Substitui `www.dropbox.com` → `dl.dropboxusercontent.com`
2. Substitui `?dl=0` → `?raw=1`

**Resultado:** Link direto que pode ser usado em tags `<img src="...">` sem redirecionamentos

---

## 🔐 Segurança

### **Credenciais (Server-Only)**
- Todas as credenciais ficam no `runtimeConfig` (server-side only)
- Nunca expostas ao cliente
- `.env` adicionado ao `.gitignore`

### **Validação de Arquivos**
- Apenas extensões permitidas: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Tamanho máximo: Controlado pelo Nitro (padrão: 100MB)
- Nome único com timestamp previne conflitos

### **Tratamento de Erros**
```typescript
// Erro de autenticação
throw createError({
  statusCode: 500,
  statusMessage: 'Dropbox Authentication Failed'
})

// Erro de upload
throw createError({
  statusCode: 500,
  statusMessage: 'Upload Failed'
})

// Arquivo inválido
throw createError({
  statusCode: 400,
  statusMessage: 'Invalid File Type'
})
```

---

## 📝 Como Usar (Frontend - Exemplo)

```typescript
// Exemplo de uso no componente Vue
async function uploadFoto(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $fetch('/api/dropbox/upload', {
      method: 'POST',
      body: formData
    })

    console.log('URL da foto:', response.foto_url)
    // Salvar response.foto_url no banco de dados
    
  } catch (error) {
    console.error('Erro no upload:', error)
  }
}
```

---

## 🧪 Testando o Endpoint

### **Usando cURL:**
```bash
curl -X POST http://localhost:3000/api/dropbox/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/caminho/para/imagem.jpg"
```

### **Usando Postman:**
1. Método: `POST`
2. URL: `http://localhost:3000/api/dropbox/upload`
3. Body → form-data
4. Key: `file` (type: File)
5. Value: Selecione uma imagem

### **Resposta Esperada:**
```json
{
  "success": true,
  "foto_url": "https://dl.dropboxusercontent.com/s/abc123def456/1708617890123_produto.jpg?raw=1"
}
```

---

## 🗂️ Estrutura de Pastas no Dropbox

```
Dropbox/
└── Fermaquinas/
    └── Fotos/
        ├── 1708617890123_produto1.jpg
        ├── 1708617890456_produto2.png
        ├── 1708617890789_cliente1.jpg
        └── ...
```

**Convenção de Nomes:**
- `{timestamp}_{nome_original}`
- Timestamp em milissegundos (13 dígitos)
- Garante unicidade e ordenação cronológica

---

## 🚀 Melhorias Futuras

- [ ] Suporte para múltiplos arquivos em uma requisição
- [ ] Redimensionamento automático de imagens (thumbnails)
- [ ] Organização por subpastas (ex: `/Produtos/`, `/Clientes/`)
- [ ] Limite de tamanho de arquivo configurável
- [ ] Compressão de imagens antes do upload
- [ ] Metadados customizados (tags, descrição)
- [ ] Exclusão de arquivos via endpoint DELETE
- [ ] Listagem de arquivos enviados
- [ ] Cache de access_token em memória (reduzir chamadas)
- [ ] Rate limiting para prevenir abuso

---

## 📊 Logs & Monitoramento

O sistema registra logs para facilitar debugging:

```typescript
console.log('[Dropbox Upload] Arquivo enviado com sucesso:', path)
console.log('[Dropbox] Link direto gerado:', directLink)
console.error('[Dropbox Auth] Erro ao renovar token:', error)
console.error('[Dropbox Upload] Erro ao enviar arquivo:', error)
```

---

## 🔗 Referências Dropbox API

- [OAuth 2.0 Guide](https://developers.dropbox.com/oauth-guide)
- [Files Upload](https://www.dropbox.com/developers/documentation/http/documentation#files-upload)
- [Create Shared Link](https://www.dropbox.com/developers/documentation/http/documentation#sharing-create_shared_link_with_settings)
- [List Shared Links](https://www.dropbox.com/developers/documentation/http/documentation#sharing-list_shared_links)

---

**✅ Integração Dropbox Backend Completa!**  
**Última Atualização:** 22 de Fevereiro de 2026
