# Meu SaaS - Documentacao

Uma aplicacao SaaS moderna construida com Nuxt 3, TypeScript e Tailwind CSS para gerenciar perfis de usuario, autenticacao e assinaturas.

## Visao Geral

Este projeto oferece uma plataforma SaaS completa com funcionalidades de:

- Autenticacao de usuarios
- Gerenciamento de perfil
- Sistema de assinaturas
- Recuperacao de senha
- Tema escuro/claro
- Interface responsiva

## Estrutura do Projeto

```
app/
  components/        - Componentes Vue reutilizaveis
    login/          - Componentes de login
    perfil/         - Componentes de perfil
  composables/       - Composicoes reutilizaveis (useAuth, useProfile, useDarkMode)
  layouts/           - Layouts da aplicacao
  middleware/        - Middleware de autenticacao
  pages/             - Paginas da aplicacao
  plugins/           - Plugins Vue
  stores/            - Estado global (Pinia)
  types/             - Definicoes de tipos TypeScript
server/
  api/               - Endpoints da API
public/              - Arquivos publicos estaticos
```

## Requisitos

- Node.js 18 ou superior
- npm, yarn, pnpm ou bun

## Instalacao

Instale as dependencias do projeto:

```bash
npm install
```

## Desenvolvimento

Inicie o servidor de desenvolvimento em `http://localhost:3000`:

```bash
npm run dev
```

## Producao

Compile a aplicacao para producao:

```bash
npm run build
npm run preview
```

## Recursos Principais

### Autenticacao
Sistema de autenticacao integrado com middleware de protecao de rotas e autenticacao de convidados via `useAuth` composable.

### Gerenciamento de Perfil
Usuarios podem visualizar e atualizar suas informacoes de perfil atraves da pagina de perfil e da API.

### Persistencia de Dados
Integracao com Supabase para armazenamento de dados de usuarios e sessoes.

### Temas
Suporte para tema claro e escuro com toggle em tempo real usando `useDarkMode` composable.

### Validacao de Formularios
Componentes reutilizaveis como `BaseInput`, `BaseButton` e `BaseDropdown` para construcao de formularios.

## API Endpoints

### Perfil
- `GET /api/perfil/me` - Obter dados do usuario autenticado
- `PUT /api/perfil/me` - Atualizar dados do usuario autenticado

## Componentes Principais

### AppHeader
Componente de cabecalho da aplicacao com navegacao e toggle de tema.

### LoginForm
Formulario de login para autenticacao de usuarios.

### PerfilForm
Formulario para edicao de informacoes do perfil de usuario.

### AlterarSenhaForm
Formulario para alteracao de senha do usuario.

### BaseButton
Botao reutilizavel com suporte a diferentes variantes e estados.

### BaseInput
Campo de entrada de texto reutilizavel com validacao.

### BaseDropdown
Componente dropdown reutilizavel para selecoes.

## Composables

### useAuth
Gerencia estado e funcoes de autenticacao, login e logout.

### useProfile
Gerencia dados do perfil do usuario e operacoes relacionadas.

### useDarkMode
Controla o tema claro/escuro da aplicacao.

## Rotas

- `/` - Home page
- `/login` - Pagina de login
- `/perfil` - Pagina de perfil do usuario
- `/assinatura` - Pagina de assinatura
- `/esquecisenha` - Pagina de recuperacao de senha
- `/redefinirsenha` - Pagina de redefinicao de senha

## Tecnologias Utilizadas

- Nuxt 3 - Framework Vue com renderizacao server-side
- Vue 3 - Framework JavaScript progressivo
- TypeScript - Tipagem estática para JavaScript
- Tailwind CSS - Framework CSS utilitario
- Supabase - Backend como servico
- Pinia - Gerenciador de estado para Vue 3

## Configuracao

### tailwind.config.js
Configuracao customizada do Tailwind CSS para o projeto.

### nuxt.config.ts
Configuracao principal do Nuxt com modulos e ajustes do projeto.

### tsconfig.json
Configuracao do TypeScript para o projeto.

## Licenca

MIT

## Autor

loboczss

## Repositorio

https://github.com/loboczss/meu-saas
