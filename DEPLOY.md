# 🚀 Guia de Deploy em Produção

## ✅ Checklist Antes de Colocar no Ar

### 1️⃣ Configurar o `.env` no Servidor

Quando copiar o projeto para o servidor Ubuntu, edite o arquivo `.env`:

```bash
# Servidor
PORT=3000
NODE_ENV=production

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=contador_visitas
DB_USER=postgres
DB_PASSWORD=COLOQUE_UMA_SENHA_FORTE_AQUI  # ⚠️ MUDE ISSO!

# Aplicação
COOKIE_SECRET=GERE_UMA_CHAVE_SECRETA_FORTE_AQUI  # ⚠️ MUDE ISSO!

# Admin (para registrar novos sites)
ADMIN_USER=seu_usuario_admin  # ⚠️ MUDE ISSO!
ADMIN_PASSWORD=sua_senha_admin_forte  # ⚠️ MUDE ISSO!

# Base URL (domínio do seu servidor)
BASE_URL=https://contador.seudominio.com

# Customização padrão
DEFAULT_BADGE_STYLE=flat
DEFAULT_BADGE_COLOR=4c1
DEFAULT_LABEL=Visitas
```

**🔒 Gerar senha segura (no terminal do Ubuntu):**

```bash
# Senha do banco
openssl rand -base64 32

# Cookie secret
openssl rand -base64 48
```

### 2️⃣ CORS - Funciona Automaticamente! ✅

**Não precisa configurar nada!** O CORS está configurado para aceitar qualquer origem.

O controle de acesso é feito pelo `siteId` - cada pessoa usa um ID único:

-   `site-dela`
-   `meu-blog`
-   `projeto-x`

Não há mais necessidade de adicionar domínios manualmente. É só usar e pronto! 🎉

### 3️⃣ Configurar Nginx (Recomendado)

Crie um proxy reverso com Nginx no seu Ubuntu:

```nginx
# /etc/nginx/sites-available/contador

server {
    listen 80;
    server_name contador.seudominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name contador.seudominio.com;

    # Certificado SSL (use Certbot para gerar)
    ssl_certificate /etc/letsencrypt/live/contador.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/contador.seudominio.com/privkey.pem;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy para o Docker
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Ativar o site:**

```bash
sudo ln -s /etc/nginx/sites-available/contador /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Obter certificado SSL (HTTPS):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d contador.seudominio.com
```

### 4️⃣ Subir os Containers no Servidor

No diretório do projeto:

```bash
# Primeira vez
docker compose up -d

# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Parar
docker compose down
```

### 5️⃣ Registrar o Site Dela

**Primeiro, registre um site para ela via API:**

```bash
curl -X POST https://contador.seudominio.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": "seu_usuario_admin",
    "password": "sua_senha_admin",
    "customizable": true
  }'
```

**Você vai receber uma resposta assim:**
```json
{
  "success": true,
  "siteId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customizable": true,
  "script": "<!-- código pronto -->",
  "endpoints": {...}
}
```

**💡 Copie o `siteId` e o `script` para passar pra ela!**

---

### 6️⃣ Script para Sua Namorada Usar

Depois de registrado, ela pode adicionar no site dela:

**Opção 1: Tag Customizada (Recomendado)**

```html
<!-- Onde ela quiser mostrar o contador -->
<div
	style="padding: 15px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
     color: white; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center;"
>
	👁️ <span id="contador-visitas">0</span> visitas
</div>

<!-- No final do HTML, antes do </body> -->
<script>
	// Use o siteId que você recebeu no registro!
	fetch("https://contador.seudominio.com/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment?format=text", {
		credentials: "include",
	})
		.then((r) => r.text())
		.then((count) => (document.getElementById("contador-visitas").textContent = count))
		.catch((err) => console.error("Erro ao carregar contador:", err));
</script>
```

**Opção 2: Widget Automático**

```html
<!-- No final do HTML, antes do </body> -->
<script
	src="https://contador.seudominio.com/widget.js"
	data-site-id="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
	data-show-badge="true"
	data-badge-position="bottom-right"
></script>
```

**Opção 3: Badge SVG Simples**

```html
<img src="https://contador.seudominio.com/api/badge/a1b2c3d4-e5f6-7890-abcd-ef1234567890" alt="Visitas" />
```

### 7️⃣ Testar Antes de Passar pra Ela

```bash
# No servidor, teste a API
curl http://localhost:3000/health

# Registre um site de teste
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"user":"seu_usuario","password":"sua_senha","customizable":true}'

# Use o siteId retornado para testar
curl http://localhost:3000/api/count/SEU_SITE_ID_AQUI/increment?format=text

# Do seu PC, teste o domínio
curl https://contador.seudominio.com/health

# Registre um site de produção
curl -X POST https://contador.seudominio.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"user":"seu_usuario","password":"sua_senha","customizable":true}'
```

### 7️⃣ Monitoramento (Recomendado)

**Ver logs em tempo real:**

```bash
docker compose logs -f app
```

**Ver estatísticas:**

```bash
# Acessar PostgreSQL
docker exec -it contador-visitas-db psql -U postgres -d contador_visitas

# Ver sites registrados
SELECT site_id, total_visits, unique_visits FROM sites;

# Ver últimas visitas
SELECT * FROM visits ORDER BY created_at DESC LIMIT 10;
```

**Auto-restart se cair:**
O `docker-compose.yml` já tem `restart: unless-stopped`, então se o servidor reiniciar, os containers sobem automaticamente.

---

## 🔥 Comandos Rápidos no Servidor

```bash
# Ver status
docker compose ps

# Reiniciar tudo
docker compose restart

# Ver logs dos últimos 100 registros
docker compose logs app --tail 100

# Backup do banco
docker exec contador-visitas-db pg_dump -U postgres contador_visitas > backup.sql

# Restaurar backup
cat backup.sql | docker exec -i contador-visitas-db psql -U postgres -d contador_visitas

# Atualizar código (depois de fazer git pull)
docker compose up -d --build

# Limpar tudo e começar do zero (⚠️ APAGA DADOS!)
docker compose down -v
docker compose up -d
```

---

## 🐛 Troubleshooting

### Problema: "CORS error" no site dela

**Não deve acontecer!** O CORS está liberado para qualquer origem.

Se acontecer, verifique:

1. Se o navegador está bloqueando por segurança (mixed content - HTTP/HTTPS)
2. Se há algum firewall/proxy bloqueando
3. Console do navegador (F12) para ver o erro exato

### Problema: Cookies não funcionam

**Causa:** Site dela é HTTP e seu servidor é HTTPS (ou vice-versa).

**Solução:** Ambos precisam usar HTTPS em produção para cookies funcionarem corretamente.

### Problema: Contador não incrementa

**Verificar:**

1. Logs do servidor: `docker compose logs app`
2. Console do navegador (F12) no site dela
3. Se o domínio está correto no script
4. Se o CORS está configurado

### Problema: Container não inicia

```bash
# Ver erro completo
docker compose logs

# Verificar portas
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 5432

# Se portas estiverem ocupadas, mude no .env:
PORT=3001  # ou outra porta livre
```

---

## 📊 Personalizações para Ela

Ela pode customizar o badge sem mexer no código:

```html
<!-- Customização via URL -->
<img
	src="https://contador.seudominio.com/api/badge/site-dela?style=for-the-badge&color=pink&label=Visitantes&logo=💖"
	alt="Contador"
/>
```

**Ou configurar padrão via API:**

```bash
curl -X PUT https://contador.seudominio.com/api/config/site-dela \
  -H "Content-Type: application/json" \
  -d '{
    "badgeStyle": "flat-square",
    "badgeColor": "ff69b4",
    "badgeLabel": "Visitantes",
    "badgeLogo": "💖"
  }'
```

---

## ✅ Checklist Final

-   [ ] Senhas alteradas no `.env` (DB_PASSWORD, COOKIE_SECRET, ADMIN_USER, ADMIN_PASSWORD)
-   [ ] BASE_URL configurado com o domínio correto
-   [ ] Nginx configurado com SSL
-   [ ] Containers rodando: `docker compose ps`
-   [ ] API respondendo: `curl https://seudominio.com/health`
-   [ ] Site registrado via `/api/register` e `siteId` salvo
-   [ ] Script de exemplo com o `siteId` correto enviado pra ela
-   [ ] Teste feito: `curl https://seudominio.com/api/count/SEU_SITE_ID/increment?format=text`
-   [ ] Logs monitorados: `docker compose logs -f`

---

**🎉 Pronto! Agora é só passar o script pra ela e vai funcionar perfeitamente!**
