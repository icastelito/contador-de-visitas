# 🧪 Testando a API com Postman

## 📥 Importar Collection

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json`
4. A collection "Contador de Visitas API" será importada com todas as requisições

## 🔧 Configurar Variáveis

A collection já vem com variáveis configuradas:

-   `base_url`: `http://localhost:3000` (mude se seu servidor estiver em outro endereço)
-   `site_id`: `teste-postman` (ID único para seus testes)

**Para editar:**

1. Clique na collection
2. Aba **Variables**
3. Altere os valores conforme necessário

## 🧪 Ordem Recomendada de Testes

### 1️⃣ Verificar Servidor

```
GET Health Check
```

Deve retornar: `{ "status": "ok", "message": "Contador de Visitas API" }`

### 2️⃣ Testar Contador Básico

**a) Ver contador atual (sem incrementar):**

```
GET Get Count (JSON)
```

Primeira vez retorna: `{ "totalVisits": 0, "uniqueVisits": 0 }`

**b) Incrementar contador:**

```
GET Increment Count (JSON)
```

Retorna o contador atualizado + informações sobre o visitante

**c) Ver contador novamente:**

```
GET Get Count (JSON)
```

Agora deve mostrar: `{ "totalVisits": 1, "uniqueVisits": 1 }`

### 3️⃣ Testar Formatos Diferentes

**Formato Text (apenas número):**

```
GET Get Count (Text)
```

Retorna: `1`

**Formato Formatted (formatado):**

```
GET Get Count (Formatted)
```

Retorna: `1` (ou `1.2K` se tiver mais de 1000)

### 4️⃣ Testar Tracking Manual

```
POST Track Visit
Body: {
  "page": "https://meusite.com/pagina-teste",
  "referrer": "https://google.com"
}
```

⚠️ **Importante:** Copie o `visitorId` retornado para usar no próximo passo!

### 5️⃣ Atualizar Consentimento

```
POST Update Consent
Body: {
  "visitorId": "COLE_O_ID_AQUI",
  "cookieConsent": true,
  "analyticsConsent": true
}
```

### 6️⃣ Ver Estatísticas

```
GET Get Stats (30 dias)
```

Retorna estatísticas detalhadas:

-   Total de visitas
-   Visitantes únicos
-   Dispositivos (desktop, mobile, tablet)
-   Navegadores
-   Países
-   Referrers

### 7️⃣ Configurar Badge Padrão

```
PUT Update Badge Config
Body: {
  "badgeStyle": "flat-square",
  "badgeColor": "4c1",
  "badgeLabel": "Visitas",
  "badgeLogo": "📊"
}
```

### 8️⃣ Testar Badges

**Badge padrão:**

```
GET Badge Padrão
```

Retorna SVG com estilo padrão

**Badge customizado:**

```
GET Badge Customizado
```

Retorna SVG com estilos personalizados via query params

### 9️⃣ Testar Múltiplos Sites

Execute em sequência:

```
GET Increment Site 1
GET Increment Site 2
GET Increment Site 3
```

Cada site terá seu próprio contador independente!

## 🎯 Cenários de Teste

### Cenário 1: Primeira Visita

1. `GET /api/count/novo-site` → Retorna `0`
2. `GET /api/count/novo-site/increment` → Cria site e retorna `1`
3. `GET /api/count/novo-site` → Retorna `1`

### Cenário 2: Visitante Recorrente

1. `GET /api/count/site-teste/increment` → Primeira visita (uniqueVisits: 1)
2. ⚠️ Salve os cookies do Postman
3. `GET /api/count/site-teste/increment` → Segunda visita (uniqueVisits: 1)
4. Total aumenta, mas unique não

### Cenário 3: Múltiplos Sites Independentes

1. `GET /api/count/blog/increment` → `1`
2. `GET /api/count/portfolio/increment` → `1`
3. `GET /api/count/loja/increment` → `1`
4. Cada um mantém seu contador separado

### Cenário 4: Formatos Diferentes

1. `GET /api/count/site/increment?format=json` → `{ "totalVisits": 1, ... }`
2. `GET /api/count/site?format=text` → `1`
3. `GET /api/count/site?format=formatted` → `1`

## 🔍 Verificar Dados no Banco

Se quiser ver os dados diretamente no PostgreSQL:

```bash
# Acessar o container do banco
docker exec -it contador-visitas-db psql -U postgres -d contador_visitas

# Ver todos os sites
SELECT site_id, total_visits, unique_visits FROM sites;

# Ver últimas visitas
SELECT site_id, device_type, browser, country, created_at
FROM visits
ORDER BY created_at DESC
LIMIT 10;

# Ver visitantes únicos
SELECT site_id, visit_count, cookie_consent, last_visit
FROM visitors
ORDER BY last_visit DESC;

# Sair
\q
```

## 📊 Resultados Esperados

### Primeira execução completa:

-   ✅ Site criado automaticamente
-   ✅ Contador inicia em `0`
-   ✅ Cada increment aumenta o contador
-   ✅ Visitas são registradas no banco
-   ✅ Estatísticas mostram dados agregados
-   ✅ Badges SVG são gerados corretamente

### Múltiplas execuções:

-   ✅ `totalVisits` aumenta sempre
-   ✅ `uniqueVisits` aumenta apenas para novos visitantes
-   ✅ Cookies mantêm sessão (se habilitados no Postman)
-   ✅ Estatísticas acumulam dados

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED"

**Problema:** Servidor não está rodando
**Solução:** `docker compose up -d`

### Erro: "Cannot read property 'visitor_id'"

**Problema:** Cookies não estão habilitados no Postman
**Solução:** Settings → General → Enable cookies

### Badge não aparece

**Problema:** Endpoint retorna XML/SVG mas Postman não renderiza
**Solução:** Normal! Copie a URL e abra no navegador para ver o badge

### Contador não incrementa

**Problema:** Usando `/count` em vez de `/count/increment`
**Solução:** Use `/increment` para registrar visita

## 💡 Dicas

1. **Use variáveis de ambiente** para trocar facilmente entre local/produção
2. **Salve responses** para comparar resultados
3. **Use Tests** no Postman para validar automaticamente:

    ```javascript
    pm.test("Status 200", function () {
    	pm.response.to.have.status(200);
    });

    pm.test("Contador aumentou", function () {
    	var json = pm.response.json();
    	pm.expect(json.totalVisits).to.be.above(0);
    });
    ```

4. **Organize em pastas** por tipo de teste
5. **Use Runner** para executar toda a collection de uma vez

## 🎉 Pronto!

Agora você pode testar toda a API facilmente! Qualquer dúvida, consulte a documentação em `http://localhost:3000`
