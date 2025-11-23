# 📊 API Contador de Visitas

Sistema auto-hospedado de contador de visitas com Docker, PostgreSQL e sistema de autenticação para registro de sites.

**[🇺🇸 English Version](./README.md)** | **🇧🇷 Versão em Português**

## ✨ Funcionalidades

-   🎨 **Badges SVG Customizáveis** (4 estilos, cores personalizadas)
-   🔐 **Sistema de Autenticação** (registro seguro de sites via API)
-   🍪 **Rastreamento por Cookies** (detecção de visitantes únicos)
-   📈 **Analytics Detalhado** (dispositivos, navegadores, geolocalização)
-   🐳 **Docker Ready** (deploy fácil com docker-compose)
-   🚀 **API REST Completa** (fácil integração)
-   🌍 **CORS Habilitado** - Use de qualquer domínio sem configuração!
-   🆔 **IDs baseados em UUID** - Cada site tem seu contador independente
-   📊 **Estatísticas em Tempo Real** (visitas totais, visitantes únicos)

## 🏗️ Stack Tecnológica

-   **Backend**: Node.js 18 + Express 4.18
-   **Banco de dados**: PostgreSQL 15
-   **ORM**: Sequelize
-   **Container**: Docker + Docker Compose
-   **Analytics**: GeoIP-Lite + UserAgent
-   **Autenticação**: Credenciais baseadas em variáveis de ambiente

## 📦 Início Rápido

### 1. Clonar o Repositório

```bash
git clone https://github.com/icastelito/contador-de-visitas.git
cd contador-de-visitas
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

**Edite o `.env` com suas configurações:**

```env
# Servidor
PORT=3000
NODE_ENV=production

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=contador_visitas
DB_USER=postgres
DB_PASSWORD=sua_senha_segura_aqui  # ⚠️ MUDE ISSO!

# Aplicação
COOKIE_SECRET=sua_chave_secreta_aqui  # ⚠️ MUDE ISSO!

# Admin (para registrar novos sites)
ADMIN_USER=seu_usuario  # ⚠️ MUDE ISSO!
ADMIN_PASSWORD=sua_senha_forte  # ⚠️ MUDE ISSO!

# Base URL (usada para gerar scripts)
BASE_URL=http://localhost:3000

# Customização padrão do badge
DEFAULT_BADGE_STYLE=flat
DEFAULT_BADGE_COLOR=4c1
DEFAULT_LABEL=Visitas
```

**🔒 Gerar senhas seguras:**

```bash
# Senha do banco
openssl rand -base64 32

# Cookie secret
openssl rand -base64 48
```

### 3. Executar com Docker (Recomendado)

```bash
# Iniciar containers
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f

# Parar containers
docker compose down
```

Servidor estará disponível em `http://localhost:3000`

### 4. Desenvolvimento Local (Opcional)

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

**⚠️ Nota sobre CORS:** O sistema aceita requisições de qualquer origem. O controle de acesso é feito pelo `siteId`, não por domínio.

## 🚀 Guia de Uso

### Passo 1: Registrar um Novo Site

**Antes de usar o contador, você precisa registrar seu site via API:**

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": "seu_usuario_admin",
    "password": "sua_senha_admin",
    "customizable": true
  }'
```

**Resposta:**

```json
{
	"success": true,
	"siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	"customizable": true,
	"script": "<!-- código pronto para usar -->",
	"scriptFormatted": "<!-- código formatado com quebras de linha -->",
	"endpoints": {
		"badge": "http://localhost:3000/api/badge/f47ac10b...",
		"count": "http://localhost:3000/api/count/f47ac10b...",
		"increment": "http://localhost:3000/api/count/f47ac10b.../increment",
		"stats": "http://localhost:3000/api/stats/f47ac10b..."
	}
}
```

**💡 Guarde o `siteId` retornado!** Você vai precisar dele em todas as requisições.

**Parâmetros:**

-   `customizable: true` → Retorna código de exemplo para criar sua própria tag customizada
-   `customizable: false` → Retorna widget completo (badge + LGPD)

---

### Opção 1: Tag 100% Customizada (customizable: true)

**Crie seu próprio design e use apenas nossa API para buscar o número!**

```html
<!-- Seu design customizado -->
<div
	style="padding: 15px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
     color: white; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center;"
>
	👁️ <span id="contador-visitas">0</span> visitas
</div>

<!-- JavaScript simples -->
<script>
	// Use o siteId que você recebeu no registro!
	fetch("https://seu-servidor.com/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment?format=text", {
		credentials: "include",
	})
		.then((r) => r.text())
		.then((count) => (document.getElementById("contador-visitas").textContent = count))
		.catch((err) => console.error("Erro ao carregar contador:", err));
</script>
```

**Formatos disponíveis:**

-   `?format=json` - JSON completo `{ totalVisits: 1234, uniqueVisits: 567 }`
-   `?format=text` - Apenas o número `1234`
-   `?format=formatted` - Formatado `1.2K` ou `1.5M`

**Endpoints:**

-   `GET /api/count/:siteId` - Apenas leitura (não incrementa)
-   `GET /api/count/:siteId/increment` - Incrementa E retorna o valor

### Opção 2: Badge SVG

```html
<img src="https://seu-servidor.com/api/badge/seu-site-id" alt="Visitas" />
```

**Customizar badge via URL:**

```html
<img
	src="https://seu-servidor.com/api/badge/seu-site-id?style=flat-square&color=blue&label=Visitantes&logo=👁️"
	alt="Visitas"
/>
```

### Opção 3: Tracking Manual (JavaScript)

```javascript
// Registrar visita
fetch("https://seu-servidor.com/api/track/seu-site-id", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	credentials: "include",
	body: JSON.stringify({
		page: window.location.href,
		referrer: document.referrer,
	}),
});

// Obter estatísticas
const stats = await fetch("https://seu-servidor.com/api/stats/seu-site-id?days=30").then((r) => r.json());
console.log(stats);
```

## 🎨 Customização

### Estilos de Badge

-   `flat` - Estilo plano padrão
-   `flat-square` - Quadrado sem bordas arredondadas
-   `plastic` - Efeito plástico 3D
-   `for-the-badge` - Estilo GitHub Actions

### Cores Disponíveis

-   `brightgreen`, `green`, `yellowgreen`, `yellow`
-   `orange`, `red`, `blue`, `lightgrey`
-   Ou use código hex: `007acc`, `4c1`, etc.

### Configurar Badge Padrão

```bash
curl -X PUT https://seu-servidor.com/api/config/seu-site-id \
  -H "Content-Type: application/json" \
  -d '{
    "badgeStyle": "flat-square",
    "badgeColor": "blue",
    "badgeLabel": "Visitantes",
    "badgeLogo": "👁️"
  }'
```

## 📡 Endpoints da API

### `POST /api/register`

Registra um novo site e obtém um UUID único.

**Autenticação obrigatória:** Credenciais de admin do `.env`

**Body da Requisição:**

```json
{
	"user": "seu_usuario_admin",
	"password": "sua_senha_admin",
	"customizable": true
}
```

**Resposta:**

```json
{
  "success": true,
  "siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "customizable": true,
  "script": "<!-- código pronto para usar -->",
  "scriptFormatted": "<!-- formatado com quebras de linha -->",
  "endpoints": { ... }
}
```

### `GET /api/badge/:siteId`

Retorna badge SVG com contador de visitas.

**Query params:**

-   `style`: flat, flat-square, plastic, for-the-badge
-   `color`: Nome da cor ou código hex
-   `label`: Texto customizado
-   `logo`: Emoji ou unicode

### `POST /api/track/:siteId`

Registra uma nova visita.

**Body:**

```json
{
	"page": "https://meusite.com/pagina",
	"referrer": "https://google.com"
}
```

### `GET /api/count/:siteId` ⭐

Retorna contador **sem registrar uma nova visita** (apenas leitura).

**Query params:**

-   `format=json` - Retorna JSON completo (padrão)
-   `format=text` - Retorna apenas o número como texto
-   `format=formatted` - Retorna número formatado (1.2K, 1.5M)

**Resposta (JSON):**

```json
{
	"totalVisits": 1234,
	"uniqueVisits": 567
}
```

**Resposta (text):**

```
1234
```

**Resposta (formatted):**

```
1.2K
```

### `GET /api/count/:siteId/increment` ⭐

**Incrementa o contador E retorna o valor** (tracking + count em uma chamada).

Aceita os mesmos query params de formato. Ideal para integração com tags customizadas.

**Exemplo:**

```javascript
fetch("/api/count/meu-site/increment?format=text", {
	credentials: "include",
})
	.then((r) => r.text())
	.then((count) => console.log(count)); // "1235"
```

### `GET /api/stats/:siteId`

Retorna estatísticas detalhadas.

**Query params:**

-   `days`: Número de dias (padrão: 30)

**Resposta:**

```json
{
	"totalVisits": 1234,
	"uniqueVisits": 567,
	"period": {
		"days": 30,
		"visits": 890
	},
	"devices": {
		"desktop": 450,
		"mobile": 380,
		"tablet": 60
	},
	"browsers": {
		"Chrome 120": 500,
		"Firefox 121": 250
	},
	"countries": {
		"BR": 600,
		"US": 200
	}
}
```

### `PUT /api/config/:siteId`

Atualiza configurações do badge.

**Body:**

```json
{
	"badgeStyle": "flat",
	"badgeColor": "blue",
	"badgeLabel": "Visitas",
	"badgeLogo": "📊",
	"domain": "meusite.com"
}
```

## 🔒 Privacidade e Segurança

### Dados Coletados

-   **IP Anonimizado** (hash SHA-256)
-   **User Agent** (navegador/SO)
-   **Página visitada**
-   **Referrer**
-   **Geolocalização aproximada** (país/região)
-   **Idioma do navegador**
-   **ID único do visitante** (UUID, baseado em cookie com expiração de 1 ano)

### Gerenciamento de Cookies

-   **Cookie visitor_id** - Rastreia visitantes únicos (expiração de 1 ano)
-   Mesmo visitante = múltiplas visitas totais mas apenas 1 visita única
-   Cookie é definido automaticamente na primeira visita
-   Flags de segurança httpOnly e sameSite habilitadas

### Conformidade

✅ IPs são sempre anonimizados  
✅ Coleta de dados mínima  
✅ Sem rastreamento entre sites  
✅ Transparência total sobre dados coletados  
✅ Detecção de visitantes baseada em cookies

## 🆔 Como Funciona o Controle por Site ID

Cada site/projeto usa um **UUID único** (`siteId`) para ter seu próprio contador independente:

```javascript
// Site 1
fetch("/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment"); // Contador: 1234

// Site 2
fetch("/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment"); // Contador: 567

// Site 3
fetch("/api/count/9z8y7x6w-5v4u-3t2s-1r0q-p9o8n7m6l5k4/increment"); // Contador: 890
```

**Vantagens:**

-   ✅ Sem necessidade de configurar domínios
-   ✅ Use em múltiplos sites sem burocracia
-   ✅ Cada site mantém seu contador separado
-   ✅ Funciona de qualquer origem (CORS habilitado)
-   ✅ Controle simples: quem tem o ID pode usar
-   ✅ Seguro: UUIDs são difíceis de adivinhar

**Para criar um novo contador de site, registre-o via endpoint `/api/register`!**

## 🐳 Deploy com Docker

### Docker Compose (Recomendado)

```bash
# Iniciar containers
docker compose up -d

# Ver logs
docker compose logs -f

# Parar containers
docker compose down

# Reiniciar containers
docker compose restart

# Resetar banco de dados (ATENÇÃO: Apaga todos os dados!)
docker compose down -v
docker compose up -d
```

### Deploy em Produção

Para deploy em produção com Nginx Proxy Manager e SSL, confira nossos guias completos:

-   **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy em produção
-   **[AUTO_DEPLOY.md](./AUTO_DEPLOY.md)** - Deploy automatizado com webhooks do GitHub
-   **[DBEAVER.md](./DBEAVER.md)** - Guia de conexão ao banco com DBeaver

### Configuração Rápida para Produção

1. Edite o `.env` com senhas seguras
2. Configure o Nginx Proxy Manager para SSL e roteamento de domínio
3. Execute `docker compose up -d`
4. Registre seu primeiro site via `/api/register`
5. Use o script retornado no seu website

### Acesso ao Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it contador-visitas-db psql -U postgres -d contador_visitas

# Ver sites registrados
SELECT id, domain, total_visits, unique_visits FROM sites;

# Sair
\q
```

## 🛠️ Desenvolvimento

### Instalar Dependências

```bash
npm install
```

### Executar Servidor de Desenvolvimento

```bash
npm run dev
```

### Executar Migrations

```bash
npm run migrate
```

### Estrutura do Projeto

```
contador-de-visitas/
├── src/
│   ├── app.js              # Servidor Express
│   ├── config/
│   │   └── database.js     # Configuração PostgreSQL
│   ├── models/
│   │   ├── Site.js         # Model de Site (baseado em UUID)
│   │   ├── Visit.js        # Model de Visita
│   │   └── Visitor.js      # Model de Visitante
│   ├── routes/
│   │   └── counter.js      # Rotas da API (register, count, stats, etc.)
│   ├── services/
│   │   └── badge.js        # Gerador de badges SVG
│   ├── utils/
│   │   └── analytics.js    # Utilitários de analytics
│   └── migrations/
│       └── run.js          # Script de migration
├── public/
│   ├── widget.js           # Widget JavaScript
│   └── exemplo.html        # Página de exemplo
├── docker-compose.yml      # Orquestração Docker
├── Dockerfile              # Imagem Node.js 18 Alpine
├── package.json
├── .env.example            # Template de variáveis de ambiente
├── DEPLOY.md               # Guia de deploy em produção
├── AUTO_DEPLOY.md          # Guia de deploy automatizado
└── DBEAVER.md              # Guia de conexão ao banco
```

## 📊 Schema do Banco de Dados

### Tabelas

**sites**

-   `id` (UUID, chave primária) - Identificador único do site
-   `domain` (string) - Domínio do site (opcional)
-   `total_visits` (integer) - Contagem total de visitas
-   `unique_visits` (integer) - Contagem de visitantes únicos
-   `badge_style`, `badge_color`, `badge_label`, `badge_logo` - Customização do badge
-   `customizable` (boolean) - Se o site pode customizar o badge
-   `created_at`, `updated_at` - Timestamps

**visitors**

-   Rastreamento de visitantes únicos
-   Gerenciamento de consentimento de cookies
-   Estatísticas de visitas

**visits**

-   Registros individuais de visitas
-   Dados técnicos e analytics
-   Dados de geolocalização
-   Informações de referrer e página

## ❓ FAQ

### Preciso configurar CORS?

**Não!** O CORS está habilitado para todas as origens. Basta usar o `siteId` correto.

### Como adiciono um novo site?

**Registre-o via API!** Use o endpoint `/api/register` com credenciais de admin:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"user":"admin","password":"senha","customizable":true}'
```

Você receberá um UUID único para usar no seu website.

### Posso usar em múltiplos domínios?

**Sim!** Use o mesmo `siteId` em todos os sites onde quiser compartilhar o contador, ou use UUIDs diferentes para contadores separados.

### É seguro deixar o CORS aberto?

**Sim!** O controle de acesso é pelo `siteId` (UUID), não por domínio. Sem conhecer o UUID exato, ninguém pode acessar o contador de outro site. UUIDs são criptograficamente aleatórios e muito difíceis de adivinhar.

### Como protejo meu contador?

UUIDs gerados pelo endpoint `/api/register` já são seguros e difíceis de adivinhar:

```javascript
// ✅ UUID seguro (gerado automaticamente)
fetch("/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment");
```

### Posso ver estatísticas de outros sites?

**Não!** Você só pode ver estatísticas se souber o UUID exato do `siteId`. Cada contador é isolado.

### Qual a diferença entre /count e /count/increment?

-   `GET /api/count/:siteId` - **Apenas leitura**, não rastreia a visita, apenas retorna a contagem atual
-   `GET /api/count/:siteId/increment` - **Rastreia a visita** (incrementa contador) E retorna a contagem

Use `/increment` quando quiser rastrear cada carregamento de página, ou `/count` quando quiser apenas exibir o número atual sem rastrear.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes

## 💬 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

## 🔗 Links

-   **Repositório GitHub**: [icastelito/contador-de-visitas](https://github.com/icastelito/contador-de-visitas)
-   **Docker Hub**: Em breve
-   **Documentação**: [DEPLOY.md](./DEPLOY.md), [AUTO_DEPLOY.md](./AUTO_DEPLOY.md), [DBEAVER.md](./DBEAVER.md)

---

Feito com ❤️ usando Node.js, PostgreSQL e Docker

**Dê uma ⭐ neste repositório se você achar útil!**
