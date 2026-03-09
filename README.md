# BetSync - Sistema de Gerenciamento de Apostas Esportivas (Versão Melhorada)

**BetSync** é uma aplicação completa de gerenciamento de apostas esportivas que oferece rastreamento de banca, cálculos de arbitragem, análise de desempenho e muito mais.

## 📋 Índice

- [Novidades Nesta Versão](#novidades-nesta-versão)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Execução Local](#execução-local)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎉 Novidades Nesta Versão

### Backend Aprimorado
✅ **Novos Endpoints do Dashboard:**
- `/api/dashboard/overview` - Visão geral completa com cálculos de ROI, taxa de acerto e exposição
- `/api/dashboard/bankroll-history` - Histórico de evolução da banca com suporte a período customizável
- `/api/dashboard/recent-bets` - Apostas recentes com detalhes completos
- `/api/dashboard/performance` - Desempenho por tipo de aposta e por casa de apostas
- `/api/dashboard/daily-stats` - Estatísticas diárias com análise de tendências

✅ **Melhorias de Cálculos:**
- Cálculo preciso de ROI baseado no total apostado
- Taxa de acerto (Win Rate) calculada corretamente
- Exposição total de apostas abertas
- Margem de lucro por aposta

### Frontend Melhorado

✅ **Dashboard Redesenhado:**
- Layout mais intuitivo com 8 KPIs principais
- Seletor de período (7, 30, 90, 365 dias)
- Gráfico de evolução da banca com melhor visualização
- Gráfico de distribuição de resultados (Ganhas vs Perdidas)
- Desempenho por tipo de aposta com cores indicativas
- Desempenho por casa de apostas com ranking
- Tabela de apostas recentes com melhor formatação

✅ **Histórico de Apostas Completo:**
- **Paginação:** Navegue entre 10, 20, 50 ou 100 apostas por página
- **Resumo de Estatísticas:** 7 cards com métricas principais
- **Filtros Avançados:**
  - Data inicial e final
  - Casa de apostas
  - Tipo de aposta (6 tipos suportados)
  - Status (Aberta, Ganhou, Perdeu, Cancelada)
  - ID da operação
- **Exportar CSV:** Baixe seus dados para análise em Excel
- **Edição Inline:** Atualize status das apostas na tabela
- **Responsividade:** Funciona perfeitamente em mobile e desktop

✅ **Melhorias de UX:**
- Modo escuro/claro funcional
- Ícones mais intuitivos (Lucide React)
- Animações suaves
- Feedback visual melhorado (toast notifications)
- Carregamento otimizado com spinners

## ✨ Características

### Dashboard
- **Visão Geral Completa**: Banca atual, lucro/prejuízo total, ROI, taxa de acerto
- **Gráfico de Evolução da Banca**: Acompanhe o crescimento da sua banca ao longo do tempo
- **Distribuição de Resultados**: Visualize a proporção de apostas ganhas vs perdidas (Pie Chart)
- **Desempenho por Tipo de Aposta**: Análise detalhada por tipo (Simples, Super Odd, Aumentada, etc.)
- **Desempenho por Casa de Apostas**: Compare o desempenho em diferentes bookmakers
- **Seletor de Período**: Analise dados dos últimos 7, 30, 90 ou 365 dias
- **Apostas Recentes**: Visualize as 10 apostas mais recentes com detalhes

### Histórico de Apostas
- **Tabela Completa**: Visualize todas as suas apostas com detalhes completos
- **Paginação Inteligente**: Navegue facilmente entre páginas (10, 20, 50 ou 100 apostas por página)
- **Filtros Avançados**:
  - Data inicial e final
  - Casa de apostas
  - Tipo de aposta
  - Status (Aberta, Ganhou, Perdeu, Cancelada)
  - ID da operação
- **Estatísticas Resumidas**: 
  - Total de apostas
  - Apostas ganhas
  - Apostas perdidas
  - Apostas abertas
  - Taxa de acerto
  - Total apostado
  - Lucro/prejuízo total
- **Exportar CSV**: Baixe seus dados em formato CSV para análise externa
- **Edição Inline**: Atualize o status das apostas diretamente na tabela
- **Botão Excluir**: Remova apostas facilmente

### Registro de Apostas
- Registre novas apostas com todos os detalhes
- Suporte para múltiplos tipos de apostas
- Integração com casas de apostas

### Calculadoras
- **Calculadora de Arbitragem**: Identifique oportunidades de arbitragem
- **Calculadora de Exchange**: Calcule back/lay em exchanges
- **Calculadora de Odds Boost**: Otimize apostas com odds aumentadas
- **Calculadora de Dutching**: Distribua stake entre múltiplas seleções

### Gerenciamento
- **Casas de Apostas**: Gerencie suas contas em diferentes bookmakers
- **Operações**: Acompanhe operações multi-apostas
- **Configurações**: Personalize a aplicação

## 📦 Requisitos

### Sistema
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **SQLite3**: Incluído no projeto

### Navegadores Suportados
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🚀 Instalação Rápida

### 1. Extraia o Projeto

```bash
unzip betsync.zip
cd betsync
```

### 2. Instale Todas as Dependências

```bash
npm run install-deps
```

Ou manualmente:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Inicie a Aplicação

```bash
npm run dev
```

Isso iniciará:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 🏃 Execução Local

### Opção 1: Comando Único (Recomendado)

```bash
npm run dev
```

### Opção 2: Terminais Separados

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Opção 3: Build para Produção

```bash
# Build do frontend
cd frontend
npm run build

# Backend está pronto para produção
cd ../backend
npm start
```

## 📁 Estrutura do Projeto

```
betsync/
├── backend/
│   ├── database/
│   │   ├── connection.js       # Conexão com SQLite
│   │   ├── init.js             # Inicialização do banco
│   │   └── betsync.db          # Arquivo do banco de dados
│   ├── models/
│   │   ├── Bet.js              # Modelo de Apostas
│   │   ├── Bookmaker.js        # Modelo de Casas de Apostas
│   │   └── Operation.js        # Modelo de Operações
│   ├── routes/
│   │   ├── bets.js             # Endpoints de apostas
│   │   ├── bookmakers.js       # Endpoints de casas
│   │   ├── operations.js       # Endpoints de operações
│   │   ├── dashboard.js        # Endpoints do dashboard (MELHORADO)
│   │   └── calculators.js      # Endpoints das calculadoras
│   ├── server.js               # Servidor Express
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js       # Layout principal
│   │   │   └── Sidebar.js      # Barra lateral
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Página do dashboard (MELHORADA)
│   │   │   ├── History.js      # Página de histórico (MELHORADA)
│   │   │   ├── BetRegistration.js
│   │   │   ├── Operations.js
│   │   │   ├── Calculators.js
│   │   │   ├── Bookmakers.js
│   │   │   └── Settings.js
│   │   ├── services/
│   │   │   └── api.js          # Cliente Axios
│   │   ├── styles/
│   │   │   └── index.css       # Estilos globais
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── README.md                   # Documentação original
├── README-UPDATED.md           # Esta documentação
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais

#### `bets` - Apostas
```sql
CREATE TABLE bets (
  id TEXT PRIMARY KEY,
  operation_id TEXT,
  bookmaker_id INTEGER,
  date DATE NOT NULL,
  bet_type TEXT NOT NULL,
  event TEXT NOT NULL,
  market TEXT NOT NULL,
  odds REAL NOT NULL,
  stake REAL NOT NULL,
  potential_return REAL NOT NULL,
  back_odds REAL,
  lay_odds REAL,
  exchange_commission REAL DEFAULT 4.5,
  lay_stake REAL,
  liability REAL,
  status TEXT DEFAULT 'Open',
  profit_loss REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `bookmakers` - Casas de Apostas
```sql
CREATE TABLE bookmakers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  current_balance REAL DEFAULT 0,
  total_deposits REAL DEFAULT 0,
  total_withdrawals REAL DEFAULT 0,
  profit_generated REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `operations` - Operações Multi-Apostas
```sql
CREATE TABLE operations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  total_exposure REAL DEFAULT 0,
  guaranteed_profit REAL DEFAULT 0,
  status TEXT DEFAULT 'Open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `bankroll_history` - Histórico de Banca
```sql
CREATE TABLE bankroll_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  opening_balance REAL NOT NULL,
  closing_balance REAL NOT NULL,
  total_staked REAL DEFAULT 0,
  total_returns REAL DEFAULT 0,
  profit_loss REAL DEFAULT 0,
  number_of_bets INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `settings` - Configurações
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Casas de Apostas Padrão

O sistema vem pré-configurado com as seguintes casas:
- Bet365
- Betano
- Sportingbet
- Betsul
- Betfair

## 🔌 API Endpoints

### Dashboard (NOVOS/MELHORADOS)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/overview` | Visão geral com ROI, taxa de acerto, exposição |
| GET | `/api/dashboard/bankroll-history?days=30` | Histórico de banca com período customizável |
| GET | `/api/dashboard/recent-bets?limit=10` | Apostas recentes com detalhes |
| GET | `/api/dashboard/performance?days=30` | Desempenho por tipo e casa |
| GET | `/api/dashboard/daily-stats?days=30` | Estatísticas diárias |

### Apostas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/bets` | Listar todas as apostas |
| GET | `/api/bets/:id` | Obter aposta específica |
| POST | `/api/bets` | Criar nova aposta |
| PUT | `/api/bets/:id` | Atualizar aposta |
| DELETE | `/api/bets/:id` | Deletar aposta |
| GET | `/api/bets/statistics` | Estatísticas gerais |
| GET | `/api/bets/daily-stats?days=30` | Estatísticas diárias |

### Casas de Apostas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/bookmakers` | Listar casas |
| GET | `/api/bookmakers/:id` | Obter casa específica |
| POST | `/api/bookmakers` | Criar nova casa |
| PUT | `/api/bookmakers/:id` | Atualizar casa |
| DELETE | `/api/bookmakers/:id` | Deletar casa |
| POST | `/api/bookmakers/:id/balance` | Atualizar saldo |

### Operações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/operations` | Listar operações |
| GET | `/api/operations/:id` | Obter operação específica |
| POST | `/api/operations` | Criar nova operação |
| PUT | `/api/operations/:id` | Atualizar operação |
| DELETE | `/api/operations/:id` | Deletar operação |

### Calculadoras

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/calculators/arbitrage` | Calcular arbitragem |
| POST | `/api/calculators/exchange` | Calcular exchange |
| POST | `/api/calculators/odds-boost` | Calcular odds boost |
| POST | `/api/calculators/dutching` | Calcular dutching |

## 🚀 Deployment

### Deployment em Linux/Ubuntu

#### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

#### 2. Clonar o Projeto

```bash
cd /home/ubuntu
unzip betsync.zip
cd betsync
```

#### 3. Instalar Dependências

```bash
npm run install-deps
```

#### 4. Configurar com PM2

Crie um arquivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'betsync-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

#### 5. Iniciar com PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 6. Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend (build estático)
    location / {
        root /home/ubuntu/betsync/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Deployment com Docker

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --production && npm run build

COPY backend ./backend
COPY frontend ./frontend

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

Build e execute:

```bash
docker build -t betsync .
docker run -p 5000:5000 -p 3000:3000 betsync
```

## 🔧 Troubleshooting

### Problema: "Cannot find module 'express'"

**Solução:**
```bash
cd backend
npm install
```

### Problema: "Port 3000 is already in use"

**Solução:**
```bash
# Encontrar processo na porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm start
```

### Problema: "Database connection error"

**Solução:**
```bash
# Verificar permissões
chmod 755 backend/database/
chmod 644 backend/database/betsync.db

# Reinicializar banco de dados
rm backend/database/betsync.db
npm start
```

### Problema: "CORS error"

**Solução:** Verifique se o backend está rodando na porta 5000 e o frontend está configurado corretamente em `frontend/src/services/api.js`.

### Problema: "Frontend não conecta ao backend"

**Solução:** Verifique se:
1. Backend está rodando: `curl http://localhost:5000/api/health`
2. Frontend está apontando para a URL correta do backend
3. Não há firewall bloqueando as portas

## 📊 Métricas e KPIs Calculados

O dashboard calcula automaticamente:

- **Banca Atual**: Saldo total da banca (inicial + lucro/prejuízo)
- **Lucro/Prejuízo Total**: Diferença entre banca atual e inicial
- **ROI (Return on Investment)**: (Lucro Total / Total Apostado) * 100
- **Taxa de Acerto (Win Rate)**: (Apostas Ganhas / Total de Apostas) * 100
- **Lucro Diário**: Lucro do dia atual (últimas 24 horas)
- **Lucro Mensal**: Lucro do mês atual
- **Total Apostado**: Soma de todos os stakes
- **Apostas em Aberto**: Quantidade de apostas não resolvidas
- **Exposição Total**: Soma dos stakes de apostas abertas
- **Margem de Lucro**: (Lucro Total / Total Apostado) * 100

## 🔐 Segurança

- **Validação de Input**: Todos os dados são validados no backend
- **Rate Limiting**: Limite de 100 requisições por 15 minutos
- **CORS**: Configurado para aceitar localhost em desenvolvimento
- **Helmet**: Headers de segurança HTTP implementados
- **Sanitização**: Proteção contra SQL injection
- **Tratamento de Erros**: Erros são capturados e tratados adequadamente

## 📝 Changelog

### Versão 1.1.0 (Atual)
- ✅ Dashboard completamente redesenhado
- ✅ Histórico de apostas com paginação
- ✅ Novos endpoints do dashboard
- ✅ Exportação em CSV
- ✅ Melhor UX/UI
- ✅ Cálculos mais precisos
- ✅ Filtros avançados

### Versão 1.0.0
- Versão inicial com funcionalidades básicas

## 🤝 Suporte

Para reportar bugs ou sugerir melhorias, entre em contato ou crie uma issue no repositório.

---

**Última Atualização**: Março de 2026
**Versão**: 1.1.0
**Status**: Pronto para Produção ✅
