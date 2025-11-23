# 🆕 Novo Sistema de Registro - Guia Postman

## 🎯 Mudanças Principais

### Sistema Antigo ❌

-   Qualquer um podia criar sites usando IDs aleatórios
-   Não havia controle de acesso
-   `siteId` era definido manualmente

### Sistema Novo ✅

-   **Autenticação obrigatória** para criar novos sites
-   **Rota protegida** `/api/register` que gera IDs automaticamente
-   **Credenciais de admin** definidas no `.env`
-   **Modo customizável** configurável por site
-   **Scripts prontos** retornados automaticamente

---

## 🔐 Configuração Inicial

### 1. Credenciais no `.env`

```env
ADMIN_USER=castelo
ADMIN_PASSWORD=M@lu140895
BASE_URL=http://localhost:3000
```

### 2. Variáveis no Postman

Ao importar `postman_collection_v2.json`, você terá:

-   `base_url`: `http://localhost:3000`
-   `admin_user`: `castelo`
-   `admin_password`: `M@lu140895`
-   `site_id`: (vazio, será preenchido automaticamente)

---

## 🧪 Testando o Sistema

### 1️⃣ Registrar Novo Site (Widget Completo)

**POST** `{{base_url}}/api/register`

```json
{
	"user": "{{admin_user}}",
	"password": "{{admin_password}}",
	"customizable": false
}
```

**Resposta:**

```json
{
	"success": true,
	"siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	"customizable": false,
	"script": "<!-- Contador de Visitas -->\n<div id=\"visit-counter-f47ac10b-58cc-4372-a567-0e02b2c3d479\"></div>\n<script src=\"http://localhost:3000/widget.js\" data-site-id=\"f47ac10b-58cc-4372-a567-0e02b2c3d479\"></script>",
	"endpoints": {
		"badge": "http://localhost:3000/api/badge/f47ac10b-58cc-4372-a567-0e02b2c3d479",
		"count": "http://localhost:3000/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479",
		"increment": "http://localhost:3000/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment",
		"stats": "http://localhost:3000/api/stats/f47ac10b-58cc-4372-a567-0e02b2c3d479"
	}
}
```

✨ **O script já vem pronto!** É só copiar e colar no HTML.

---

### 2️⃣ Registrar Site Customizado (Apenas API)

**POST** `{{base_url}}/api/register`

```json
{
	"user": "{{admin_user}}",
	"password": "{{admin_password}}",
	"customizable": true
}
```

**Resposta:**

```json
{
	"success": true,
	"siteId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"customizable": true,
	"script": "<!-- Contador de Visitas - Modo Customizado -->\n<script>\n  // Use a API para buscar o contador:\n  // GET http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890?format=text\n  // GET http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890?format=formatted\n  // GET http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment?format=text (rastreia + retorna)\n  \n  // Exemplo de uso:\n  fetch('http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment?format=text')\n    .then(r => r.text())\n    .then(count => {\n      document.getElementById('contador').textContent = count;\n    });\n</script>",
	"endpoints": {
		"badge": "http://localhost:3000/api/badge/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		"count": "http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		"increment": "http://localhost:3000/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment",
		"stats": "http://localhost:3000/api/stats/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
	}
}
```

🎨 **Modo customizado** retorna um exemplo de código com a API pronta para usar.

---

### 3️⃣ Testar Erro de Autenticação

**POST** `{{base_url}}/api/register`

```json
{
	"user": "usuario_errado",
	"password": "senha_errada",
	"customizable": false
}
```

**Resposta:** `401 Unauthorized`

```json
{
	"error": "Credenciais inválidas"
}
```

---

## 🔄 Fluxo Completo Automatizado

A collection tem uma pasta **"🧪 Fluxo Completo"** que executa:

1. **Registrar Novo Site** → Salva `site_id` automaticamente
2. **Incrementar Contador** → Usa o `site_id` salvo
3. **Ver Badge** → Gera SVG com o contador
4. **Ver Estatísticas** → Mostra dados agregados

Execute essa sequência para testar tudo de uma vez! ✅

---

## 📊 O que mudou nos outros endpoints?

### Todos os endpoints continuam funcionando!

A única mudança é que agora você **deve registrar o site primeiro** usando `/api/register` para obter um `siteId` válido.

**Antes:** Você criava manualmente `site-1`, `site-2`, etc.  
**Agora:** O sistema gera UUIDs únicos como `f47ac10b-58cc-4372-a567-0e02b2c3d479`

### Exemplos:

```
GET  /api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479
GET  /api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment?format=text
GET  /api/badge/f47ac10b-58cc-4372-a567-0e02b2c3d479
GET  /api/stats/f47ac10b-58cc-4372-a567-0e02b2c3d479
POST /api/track/f47ac10b-58cc-4372-a567-0e02b2c3d479
PUT  /api/config/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## 🎯 Casos de Uso

### Para sua namorada (Widget completo):

```json
{
	"user": "castelo",
	"password": "M@lu140895",
	"customizable": false
}
```

Ela recebe: `<script>` pronto com badge + LGPD banner + tracking automático

### Para sites com design próprio (API apenas):

```json
{
	"user": "castelo",
	"password": "M@lu140895",
	"customizable": true
}
```

Você recebe: Endpoints da API para criar seu próprio contador customizado

---

## 🔒 Segurança

### ✅ O que está protegido:

-   Apenas `/api/register` requer autenticação
-   Credenciais definidas no `.env`
-   UUIDs únicos impedem colisões

### ⚠️ O que NÃO está protegido:

-   Endpoints de contador (`/count`, `/badge`, etc.) são públicos
-   Qualquer um com o `siteId` pode ver estatísticas
-   Para produção, considere adicionar rate limiting

---

## 📝 Checklist de Testes

Usando a collection atualizada:

-   [ ] ✅ Registrar site com widget (`customizable: false`)
-   [ ] ✅ Registrar site customizado (`customizable: true`)
-   [ ] ❌ Tentar registrar com credenciais inválidas
-   [ ] ✅ Incrementar contador do site registrado
-   [ ] ✅ Ver badge SVG
-   [ ] ✅ Ver estatísticas
-   [ ] ✅ Configurar badge padrão
-   [ ] ✅ Track manual com POST /track

---

## 🐛 Troubleshooting

### Erro: "Credenciais inválidas"

**Solução:** Verifique se `ADMIN_USER` e `ADMIN_PASSWORD` no `.env` correspondem aos valores no Postman.

### Erro: "column 'customizable' does not exist"

**Solução:** Execute:

```bash
docker compose exec postgres psql -U postgres -d contador_visitas -c "ALTER TABLE sites ADD COLUMN customizable BOOLEAN DEFAULT false;"
docker compose restart app
```

### O `site_id` não está sendo salvo automaticamente

**Solução:** Vá na aba **Tests** do request "Registrar Site Widget Completo" e verifique se tem:

```javascript
if (pm.response.code === 200) {
	var json = pm.response.json();
	pm.collectionVariables.set("site_id", json.siteId);
}
```

---

## 🎉 Pronto!

Agora você tem um sistema profissional de registro de sites com:

-   🔐 Autenticação obrigatória
-   🎨 Modo customizável opcional
-   📜 Scripts prontos para copiar
-   🆔 UUIDs únicos automáticos
-   📊 Endpoints organizados

Importe `postman_collection_v2.json` e comece a testar! 🚀
