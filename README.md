# 📊 Contador de Visitas

Sistema completo de contador de visitas auto-hospedado com Docker, PostgreSQL e suporte a cookies com consentimento LGPD.

## ✨ Funcionalidades

-   🎨 **Badge SVG customizável** (4 estilos, cores personalizadas)
-   🔒 **Conformidade LGPD** (banner de consentimento, IPs anonimizados)
-   🍪 **Gerenciamento de cookies** (com permissão do usuário)
-   📈 **Analytics detalhado** (dispositivos, navegadores, geolocalização)
-   🐳 **Docker ready** (deploy fácil com docker-compose)
-   🚀 **API REST completa** (fácil integração)
-   🌍 **Widget JavaScript** (incorporável em qualquer site)
-   ✨ **CORS liberado** - Use de qualquer domínio sem configuração!
-   🆔 **Controle por Site ID** - Cada site tem seu contador único e independente

## 🏗️ Tecnologias

-   **Backend**: Node.js + Express
-   **Banco de dados**: PostgreSQL
-   **ORM**: Sequelize
-   **Container**: Docker + Docker Compose
-   **Analytics**: GeoIP-Lite + UserAgent

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd contador-de-visitas
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=contador_visitas
DB_USER=postgres
DB_PASSWORD=sua_senha_segura_aqui
COOKIE_SECRET=sua_chave_secreta_aqui

# Admin (para registrar novos sites)
ADMIN_USER=seu_usuario
ADMIN_PASSWORD=sua_senha_forte

# Base URL (usado para gerar scripts)
BASE_URL=http://localhost:3000
```

### 3. Instalar dependências (desenvolvimento local)

```bash
npm install
```

**⚠️ Nota sobre CORS:** O sistema está configurado para aceitar requisições de qualquer origem. O controle de acesso é feito pelo `siteId`, não por domínio. Não é necessário configurar `ALLOWED_ORIGINS`.

### 4. Executar com Docker (Produção)

```bash
docker-compose up -d
```

O servidor estará disponível em `http://localhost:3000`

### 5. Executar localmente (Desenvolvimento)

```bash
npm run dev
```

## 🚀 Como Usar

### Passo 1: Registrar um Novo Site

**Antes de usar o contador, você precisa registrar seu site via API:**

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": "seu_usuario",
    "password": "sua_senha",
    "customizable": true
  }'
```

**Resposta:**

```json
{
	"success": true,
	"siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	"customizable": true,
	"script": "<!-- código pronto para copiar -->",
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

-   `customizable: true` → Retorna exemplo de código para criar sua própria tag
-   `customizable: false` → Retorna widget completo (badge + LGPD)

---

### Opção 1: Tag 100% Customizada (customizable: true)

**Crie seu próprio design e use apenas nossa API para buscar o número!**

```html
<!-- Seu design customizado -->
<div
	style="padding: 15px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
     color: white; border-radius: 8px; font-weight: 600;"
>
	👁️ <span id="contador">0</span> visitas
</div>

<!-- JavaScript simples -->
<script>
	// Use o siteId que você recebeu no registro!
	fetch("https://seu-servidor.com/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment?format=text", {
		credentials: "include",
	})
		.then((r) => r.text())
		.then((count) => (document.getElementById("contador").textContent = count));
</script>
```

**Formatos disponíveis:**

-   `?format=json` - JSON completo `{ totalVisits: 1234, uniqueVisits: 567 }`
-   `?format=text` - Apenas o número `1234`
-   `?format=formatted` - Formatado `1.2K` ou `1.5M`

**Endpoints:**

-   `GET /api/count/:siteId` - Apenas leitura (não incrementa)
-   `GET /api/count/:siteId/increment` - Incrementa E retorna o valor

[**Ver exemplos completos de tags customizadas →**](http://localhost:3000/custom-examples.html)

### Opção 2: Widget Completo (Tracking Automático)

Adicione no seu HTML, antes do `</body>`:

```html
<script
	src="https://seu-servidor.com/widget.js"
	data-site-id="meu-site"
	data-show-badge="true"
	data-badge-position="bottom-right"
></script>
```

**Atributos disponíveis:**

-   `data-site-id`: ID único do seu site (obrigatório)
-   `data-show-badge`: Mostrar badge no canto (true/false)
-   `data-badge-position`: Posição do badge (top-left, top-right, bottom-left, bottom-right)
-   `data-auto-consent`: Aceitar cookies automaticamente (true/false)

### Opção 3: Badge SVG Pré-feito

```html
<img src="https://seu-servidor.com/api/badge/meu-site" alt="Visitas" />
```

**Customizar badge via URL:**

```html
<img
	src="https://seu-servidor.com/api/badge/meu-site?style=flat-square&color=blue&label=Visitantes&logo=👁️"
	alt="Visitas"
/>
```

### Opção 3: Tracking Manual (JavaScript)

```javascript
// Registrar visita
fetch("https://seu-servidor.com/api/track/meu-site", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	credentials: "include",
	body: JSON.stringify({
		page: window.location.href,
		referrer: document.referrer,
	}),
});

// Obter estatísticas
const stats = await fetch("https://seu-servidor.com/api/stats/meu-site?days=30").then((r) => r.json());
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
curl -X PUT https://seu-servidor.com/api/config/meu-site \
  -H "Content-Type: application/json" \
  -d '{
    "badgeStyle": "flat-square",
    "badgeColor": "blue",
    "badgeLabel": "Visitantes",
    "badgeLogo": "👁️"
  }'
```

## 📡 API Endpoints

### `GET /api/badge/:siteId`

Retorna badge SVG com contador de visitas.

**Query params:**

-   `style`: flat, flat-square, plastic, for-the-badge
-   `color`: Nome da cor ou hex
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

### `POST /api/consent/:siteId`

Atualiza consentimento de cookies.

**Body:**

```json
{
	"visitorId": "uuid-do-visitante",
	"cookieConsent": true,
	"analyticsConsent": true
}
```

### `GET /api/count/:siteId` ⭐

Retorna contador **sem registrar visita nova** (apenas leitura).

**Query params:**

-   `format=json` - Retorna JSON completo (padrão)
-   `format=text` - Retorna apenas o número como texto
-   `format=formatted` - Retorna número formatado (1.2K, 1.5M)

**Response (JSON):**

```json
{
	"totalVisits": 1234,
	"uniqueVisits": 567
}
```

**Response (text):**

```
1234
```

**Response (formatted):**

```
1.2K
```

### `GET /api/count/:siteId/increment` ⭐ NOVO!

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

**Response:**

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

## 🔒 LGPD e Privacidade

### Dados Coletados

**Sem consentimento (básico):**

-   IP anonimizado (hash SHA-256)
-   User Agent (navegador/SO)
-   Página visitada
-   Referrer
-   Geolocalização aproximada (país/região)
-   Idioma do navegador

**Com consentimento (cookies aceitos):**

-   ID único do visitante (UUID)
-   Histórico de visitas
-   Tempo de permanência
-   Padrões de navegação

### Conformidade

✅ IPs são sempre anonimizados  
✅ Banner de consentimento obrigatório  
✅ Usuário pode rejeitar cookies  
✅ Dados coletados são mínimos  
✅ Sem rastreamento entre sites  
✅ Transparência total sobre dados coletados

## 🆔 Como Funciona o Controle por Site ID

Cada site/projeto usa um **ID único** (`siteId`) para ter seu próprio contador independente:

```javascript
// Site 1
fetch("/api/count/meu-blog/increment"); // Contador: 1234

// Site 2
fetch("/api/count/portfolio/increment"); // Contador: 567

// Site 3
fetch("/api/count/loja/increment"); // Contador: 890
```

**Vantagens:**

-   ✅ Sem necessidade de configurar domínios
-   ✅ Use em múltiplos sites sem burocracia
-   ✅ Cada site mantém seu contador separado
-   ✅ Funciona de qualquer origem (CORS liberado)
-   ✅ Controle simples: quem tem o ID, pode usar

**Para criar um novo site, é só usar um novo ID!** Não precisa configurar nada no servidor.

## 🐳 Deploy com Docker

### Docker Compose (Recomendado)

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Resetar banco (CUIDADO!)
docker-compose down -v
```

### Docker Manual

```bash
# Build
docker build -t contador-visitas .

# Run
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name contador-visitas \
  contador-visitas
```

## 🛠️ Desenvolvimento

### Instalar dependências

```bash
npm install
```

### Executar em modo desenvolvimento

```bash
npm run dev
```

### Executar migrations

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
│   │   ├── Site.js         # Model de Sites
│   │   ├── Visit.js        # Model de Visitas
│   │   └── Visitor.js      # Model de Visitantes
│   ├── routes/
│   │   └── counter.js      # Rotas da API
│   ├── services/
│   │   └── badge.js        # Gerador de badges SVG
│   ├── utils/
│   │   └── analytics.js    # Utilitários analytics
│   └── migrations/
│       └── run.js          # Script de migration
├── public/
│   ├── widget.js           # Widget JavaScript
│   └── exemplo.html        # Página de exemplo
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env.example
```

## 📊 Banco de Dados

### Tabelas

**sites**

-   Configurações de cada site
-   Contadores totais (total e único)
-   Preferências de badge

**visitors**

-   Visitantes únicos
-   Consentimentos de cookies
-   Estatísticas de visitas

**visits**

-   Registro de cada visita
-   Dados técnicos e analytics
-   Geolocalização

## ❓ FAQ

### Preciso configurar CORS?

**Não!** O CORS está liberado para qualquer origem. Basta usar o `siteId` correto.

### Como adiciono um novo site?

**É automático!** Só use um novo `siteId` na URL e o sistema cria o contador automaticamente:

```javascript
fetch("/api/count/novo-site/increment"); // Contador criado automaticamente!
```

### Posso usar em múltiplos domínios?

**Sim!** Use o mesmo `siteId` em todos os sites onde quiser compartilhar o contador, ou use IDs diferentes para contadores separados.

### É seguro deixar o CORS aberto?

**Sim!** O controle de acesso é pelo `siteId`, não por domínio. Quem não souber o ID correto não consegue acessar o contador de outro site.

### Como proteger meu contador?

Use `siteId` aleatórios ou difíceis de adivinhar:

```javascript
// ❌ Fácil de adivinhar
fetch("/api/count/site1/increment");

// ✅ Difícil de adivinhar
fetch("/api/count/a7f2e9b3-4d1c-4f8e-9a2b-c5d8e1f6a3b7/increment");
```

### Posso ver estatísticas de outros sites?

**Não!** Você só consegue ver estatísticas se souber o `siteId` exato. Cada contador é isolado.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes

## 💬 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

---

Feito com ❤️ usando Node.js, PostgreSQL e Docker
