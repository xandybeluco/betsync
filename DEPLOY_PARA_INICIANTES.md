# 🚀 Guia Completo: Colocar BetSync Online (Para Iniciantes)

Bem-vindo! Este guia vai te levar pela mão em cada passo para colocar sua aplicação BetSync na internet. **Não é necessário conhecimento técnico prévio!**

## 📋 O que você vai precisar

1. Uma conta no **GitHub** (grátis) - Para guardar seu código
2. Uma conta no **Supabase** (grátis) - Para o banco de dados
3. Uma conta no **Render** (grátis) - Para colocar o site online

**Tempo total**: Cerca de 30-45 minutos

---

## 🎯 Passo 1: Criar Conta no GitHub

O GitHub é como um "Google Drive para programadores". Ele vai guardar seu código de forma segura.

### 1.1 Acessar GitHub
1. Abra seu navegador e vá para **[github.com](https://github.com)**
2. Clique em **"Sign up"** (no canto superior direito)

### 1.2 Preencher o Formulário
1. **Email**: Use seu email pessoal (ex: seu@email.com)
2. **Senha**: Crie uma senha forte (ex: MinhaSenha123!@#)
3. **Username**: Escolha um nome de usuário (ex: seu-nome-apostas)
4. Marque a caixa "I agree to the GitHub terms of service"
5. Clique em **"Create account"**

### 1.3 Confirmar Email
1. GitHub vai enviar um email de confirmação
2. Abra seu email e clique no link de confirmação
3. Pronto! Sua conta GitHub está criada

---

## 🎯 Passo 2: Subir o Código para GitHub

Agora vamos salvar seu projeto BetSync no GitHub.

### 2.1 Criar um Novo Repositório
1. Faça login no GitHub
2. Clique no **ícone de + (mais)** no canto superior direito
3. Selecione **"New repository"**

### 2.2 Configurar o Repositório
1. **Repository name**: Digite `betsync` (ou outro nome que desejar)
2. **Description**: Digite "Sistema de Gerenciamento de Apostas Esportivas"
3. Selecione **"Public"** (para que o Render possa acessar)
4. **NÃO** marque "Add a README file" (vamos fazer diferente)
5. Clique em **"Create repository"**

### 2.3 Subir os Arquivos (Opção Mais Fácil - Sem Git)

Se você não quer usar Git, pode fazer assim:

1. Abra seu repositório no GitHub (você já vai estar lá)
2. Clique em **"Add file"** -> **"Upload files"**
3. Arraste a pasta `betsync` inteira para a área de upload
4. Clique em **"Commit changes"**

**Pronto! Seu código está no GitHub!**

---

## 🎯 Passo 3: Criar Banco de Dados no Supabase

O Supabase é onde suas apostas vão ser guardadas (é como um Excel na nuvem, mas muito mais poderoso).

### 3.1 Criar Conta Supabase
1. Abra **[supabase.com](https://supabase.com)**
2. Clique em **"Start your project"**
3. Clique em **"Sign up with GitHub"** (mais fácil)
4. Autorize o Supabase a acessar sua conta GitHub
5. Preencha os dados solicitados

### 3.2 Criar um Novo Projeto
1. No painel do Supabase, clique em **"New project"**
2. **Project name**: Digite `betsync-db`
3. **Database password**: Crie uma senha forte e **ANOTE EM UM LUGAR SEGURO** (você vai precisar!)
   - Exemplo: `MinhaSenha123!@#`
4. **Region**: Escolha **"South America (São Paulo)"** (mais rápido para você)
5. Clique em **"Create new project"**

### 3.3 Aguardar a Criação
O banco vai levar alguns minutos para ser criado. Você verá uma tela de carregamento. **Aguarde pacientemente.**

### 3.4 Pegar as Informações de Conexão
Quando terminar, você estará no painel do Supabase:

1. Clique em **"Project Settings"** (ícone de engrenagem no canto inferior esquerdo)
2. Clique em **"Database"**
3. Você verá uma seção chamada **"Connection string"**
4. Procure por **"Connection parameters"** e você verá:
   - **Host**: Algo como `db.xxxxx.supabase.co`
   - **User**: `postgres`
   - **Password**: A senha que você criou
   - **Port**: `5432`
   - **Database**: `postgres`

**COPIE E GUARDE ESSAS INFORMAÇÕES EM UM ARQUIVO DE TEXTO!**

---

## 🎯 Passo 4: Preparar o Código para o Render

Vamos criar um arquivo especial que diz ao Render como rodar sua aplicação.

### 4.1 Criar o Arquivo `render.yaml`

1. Abra seu repositório no GitHub
2. Clique em **"Add file"** -> **"Create new file"**
3. No campo de nome, digite: `render.yaml`
4. Cole o seguinte conteúdo:

```yaml
services:
  - type: web
    name: betsync-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server-postgres.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DB_USER
        value: postgres
      - key: DB_PASSWORD
        sync: false
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: 5432
      - key: DB_NAME
        value: postgres
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false

  - type: static_site
    name: betsync-frontend
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://betsync-backend.onrender.com
```

5. Clique em **"Commit changes"**

---

## 🎯 Passo 5: Fazer Deploy no Render

Agora vamos colocar sua aplicação online!

### 5.1 Criar Conta no Render
1. Abra **[render.com](https://render.com)**
2. Clique em **"Get started"**
3. Clique em **"Sign up with GitHub"**
4. Autorize o Render a acessar sua conta GitHub
5. Preencha os dados solicitados

### 5.2 Conectar o Repositório
1. No painel do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"Blueprint"**
3. Clique em **"Connect a repository"**
4. Procure por `betsync` (seu repositório)
5. Clique em **"Connect"**

### 5.3 Configurar as Variáveis de Ambiente
O Render vai pedir para você configurar as variáveis. Aqui você vai colar as informações do Supabase:

1. **DB_PASSWORD**: Cole a senha que você criou no Supabase
2. **DB_HOST**: Cole o host do Supabase (ex: `db.xxxxx.supabase.co`)
3. **DB_NAME**: Digite `postgres`
4. **JWT_SECRET**: Crie uma senha aleatória (ex: `MinhaSenhaSecreta123!@#`)
5. **FRONTEND_URL**: Deixe em branco por enquanto (Render vai preencher depois)

### 5.4 Fazer Deploy
1. Clique em **"Deploy"**
2. Aguarde o deploy terminar (pode levar 5-10 minutos)
3. Quando terminar, você verá uma URL como `https://betsync-backend.onrender.com`

**Parabéns! Seu backend está online!**

---

## 🎯 Passo 6: Acessar Sua Aplicação

Depois que o deploy terminar:

1. Procure pela URL do frontend (algo como `https://betsync-frontend.onrender.com`)
2. Abra essa URL no navegador
3. Você verá a página de login

### Login com Credenciais Demo
- **Email**: `demo@betsync.com`
- **Senha**: `demo123`

**Pronto! Sua aplicação está online e você pode acessar de qualquer computador!**

---

## 📱 Compartilhar com Outros

Agora você pode compartilhar a URL com outras pessoas:

- Envie o link `https://betsync-frontend.onrender.com` para seus amigos
- Eles podem fazer login com as mesmas credenciais demo
- Ou podem criar uma nova conta clicando em "Registrar"

---

## 🔐 Segurança: Criar Sua Própria Conta

Depois de tudo funcionando, crie sua própria conta:

1. Abra a aplicação
2. Clique em **"Registrar"**
3. Preencha:
   - **Email**: Seu email pessoal
   - **Senha**: Uma senha forte
   - **Nome**: Seu nome
   - **Banca Inicial**: Quanto você quer começar (ex: R$ 1000)
4. Clique em **"Criar Conta"**

---

## 🆘 Troubleshooting (Se Algo Não Funcionar)

### "Erro de conexão com banco de dados"
- Verifique se as credenciais do Supabase estão corretas no Render
- Verifique se o banco de dados está ativo no Supabase

### "Página em branco"
- Aguarde alguns minutos (o Render às vezes demora para iniciar)
- Atualize a página (F5)
- Verifique o console do navegador (F12) para ver erros

### "Não consigo fazer login"
- Verifique se está usando `demo@betsync.com` e `demo123`
- Tente criar uma nova conta

### "Aplicação muito lenta"
- É normal no plano gratuito do Render (ele dorme depois de 15 minutos sem uso)
- Ao acessar novamente, ele acorda (demora 1-2 minutos)

---

## 📊 Próximos Passos

Agora que sua aplicação está online, você pode:

1. **Registrar suas apostas** no dashboard
2. **Acompanhar seu desempenho** com os gráficos
3. **Usar as calculadoras** para análises
4. **Compartilhar** com amigos e colegas

---

## 💡 Dicas Importantes

1. **Backup**: O Supabase faz backup automático dos seus dados
2. **Segurança**: Nunca compartilhe suas credenciais de banco de dados
3. **Senha**: Altere a senha do demo user depois de começar a usar
4. **Suporte**: Se tiver dúvidas, consulte a documentação do Render ou Supabase

---

## 📞 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique se seguiu todos os passos
2. Leia o "Troubleshooting" acima
3. Verifique os logs no Render (clique no serviço e veja "Logs")
4. Verifique o console do navegador (F12)

---

**Parabéns por colocar sua aplicação online! 🎉**

Agora você tem um sistema profissional de gerenciamento de apostas acessível de qualquer lugar do mundo!

---

**Última Atualização**: Março de 2026
**Versão**: 2.0.0
