# Guia de Configuração: PostgreSQL + Autenticação

Este documento descreve como configurar o BetSync com PostgreSQL e o novo sistema de autenticação.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação do PostgreSQL](#instalação-do-postgresql)
- [Configuração do Backend](#configuração-do-backend)
- [Configuração do Frontend](#configuração-do-frontend)
- [Testando a Aplicação](#testando-a-aplicação)
- [Deployment com PostgreSQL](#deployment-com-postgresql)

## 🔧 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- PostgreSQL 12+ instalado localmente ou acesso a um servidor PostgreSQL remoto

## 📦 Instalação do PostgreSQL

### Linux (Ubuntu/Debian)

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Acessar o PostgreSQL
sudo -u postgres psql
```

### macOS

```bash
# Instalar via Homebrew
brew install postgresql

# Iniciar o serviço
brew services start postgresql
```

### Windows

1. Baixe o instalador em [postgresql.org](https://www.postgresql.org/download/windows/)
2. Execute o instalador
3. Anote a senha do usuário `postgres`
4. Selecione a porta padrão (5432)

## 🗄️ Criar Banco de Dados

### Via Terminal PostgreSQL

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE betsync;

# Criar usuário (opcional, para segurança)
CREATE USER betsync_user WITH PASSWORD 'sua_senha_segura';

# Conceder privilégios
ALTER ROLE betsync_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE betsync TO betsync_user;

# Sair
\q
```

### Verificar Conexão

```bash
# Conectar ao banco como usuário postgres
psql -U postgres -d betsync

# Ou com usuário customizado
psql -U betsync_user -d betsync -h localhost
```

## ⚙️ Configuração do Backend

### 1. Copiar Arquivo de Ambiente

```bash
cd backend
cp .env.example .env
```

### 2. Editar `.env`

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# PostgreSQL Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=betsync

# JWT Configuration
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Iniciar o Backend

```bash
# Opção 1: Usar o novo servidor com PostgreSQL
node server-postgres.js

# Opção 2: Com nodemon para desenvolvimento
npx nodemon server-postgres.js
```

O backend inicializará o banco de dados automaticamente na primeira execução.

### Credenciais Demo

Após a primeira execução, um usuário demo será criado:
- **Email**: `demo@betsync.com`
- **Senha**: `demo123`

## 🎨 Configuração do Frontend

### 1. Atualizar App.js

Substitua o conteúdo de `src/App.js` pelo conteúdo de `src/App-with-auth.js`:

```bash
cd frontend
cp src/App-with-auth.js src/App.js
```

### 2. Atualizar API Service

Substitua o serviço de API pelo novo que inclui autenticação:

```bash
cp src/services/api-auth.js src/services/api.js
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Instalar Dependências (se necessário)

```bash
npm install
```

## 🚀 Testando a Aplicação

### 1. Iniciar o Backend

```bash
cd backend
node server-postgres.js
```

Você deve ver:
```
✅ Connected to PostgreSQL database
✓ Users table created
✓ Bookmakers table created
✓ Bets table created
✓ Bankroll history table created
✓ Settings table created
✓ Indexes created
✓ Demo user created (email: demo@betsync.com, password: demo123)
✅ Database initialization completed successfully!
✅ Server running on port 5000
```

### 2. Iniciar o Frontend

```bash
cd frontend
npm start
```

O navegador abrirá em `http://localhost:3000` mostrando a página de login.

### 3. Fazer Login

Use as credenciais demo:
- **Email**: `demo@betsync.com`
- **Senha**: `demo123`

### 4. Testar Funcionalidades

- ✅ Fazer login
- ✅ Visualizar dashboard
- ✅ Registrar novas apostas
- ✅ Ver histórico
- ✅ Usar calculadoras
- ✅ Gerenciar casas de apostas

## 🔐 Segurança

### Alterar Senha do Demo User

Via API:
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "currentPassword": "demo123",
    "newPassword": "nova_senha_segura"
  }'
```

### Criar Novo Usuário

Via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@usuario.com",
    "password": "senha_segura",
    "name": "Novo Usuário",
    "initial_bankroll": 1000
  }'
```

## 🚀 Deployment com PostgreSQL

### Opção 1: Supabase (Recomendado - Fácil)

Supabase fornece PostgreSQL hospedado gratuitamente.

1. **Criar Conta em [supabase.com](https://supabase.com)**
2. **Criar Novo Projeto**
3. **Copiar Credenciais de Conexão**
4. **Atualizar `.env`:**

```env
DB_USER=postgres
DB_PASSWORD=sua_senha_supabase
DB_HOST=seu-projeto.supabase.co
DB_PORT=5432
DB_NAME=postgres
```

### Opção 2: AWS RDS

1. **Criar Instância RDS PostgreSQL**
2. **Configurar Security Groups**
3. **Atualizar `.env` com credenciais RDS**

### Opção 3: DigitalOcean Managed Database

1. **Criar Banco Managed PostgreSQL**
2. **Obter Connection String**
3. **Extrair credenciais e atualizar `.env`**

### Variáveis de Ambiente em Produção

```env
NODE_ENV=production
PORT=5000
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_muito_segura
DB_HOST=seu-host-postgres.com
DB_PORT=5432
DB_NAME=betsync
JWT_SECRET=chave-secreta-super-longa-e-segura-mude-isto
FRONTEND_URL=https://seu-dominio.com
```

## 🔄 Migração de SQLite para PostgreSQL

Se você tinha dados no SQLite, pode importá-los:

```bash
# 1. Exportar dados do SQLite
sqlite3 backend/database/betsync.db .dump > sqlite_backup.sql

# 2. Adaptar SQL para PostgreSQL (remover tipos específicos do SQLite)
# 3. Importar no PostgreSQL
psql -U postgres -d betsync < sqlite_backup.sql
```

## 📊 Verificar Dados no PostgreSQL

```bash
# Conectar ao banco
psql -U postgres -d betsync

# Ver tabelas
\dt

# Ver usuários
SELECT * FROM users;

# Ver apostas
SELECT * FROM bets;

# Ver estatísticas
SELECT COUNT(*) as total_bets, SUM(stake) as total_staked FROM bets;
```

## 🐛 Troubleshooting

### Erro: "Connection refused"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql
```

### Erro: "Database does not exist"

```bash
# Criar banco de dados
psql -U postgres -c "CREATE DATABASE betsync;"
```

### Erro: "Authentication failed"

Verificar credenciais em `.env`:
- Usuário correto
- Senha correta
- Host correto
- Porta correta (padrão: 5432)

### Erro: "JWT_SECRET not set"

Adicionar em `.env`:
```env
JWT_SECRET=sua-chave-secreta-aqui
```

## 📚 Recursos Adicionais

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [JWT.io](https://jwt.io/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

## ✅ Checklist de Configuração

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `betsync` criado
- [ ] Arquivo `.env` configurado no backend
- [ ] Dependências do backend instaladas
- [ ] Backend iniciado com `server-postgres.js`
- [ ] Frontend atualizado com autenticação
- [ ] Arquivo `.env` configurado no frontend
- [ ] Frontend iniciado
- [ ] Login funciona com credenciais demo
- [ ] Dashboard carrega após login
- [ ] Dados são salvos no PostgreSQL

---

**Última Atualização**: Março de 2026
**Versão**: 2.0.0 (Com PostgreSQL + Autenticação)
