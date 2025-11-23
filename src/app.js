require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database");
const counterRoutes = require("./routes/counter");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares - CORS liberado para qualquer origem
app.use(
	cors({
		origin: true, // Aceita qualquer origem
		credentials: true, // Permite cookies
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Servir arquivos estáticos (widget.js, exemplo.html)
app.use(express.static("public"));

// Rotas
app.use("/api", counterRoutes);

// Rota de health check
app.get("/health", (req, res) => {
	res.json({ status: "ok", message: "Contador de Visitas API" });
});

// Página inicial com documentação
app.get("/", (req, res) => {
	res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contador de Visitas API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .endpoint { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; background: #f9f9f9; }
        .method { display: inline-block; padding: 2px 8px; border-radius: 3px; font-weight: bold; color: white; }
        .get { background: #61affe; }
        .post { background: #49cc90; }
        .put { background: #fca130; }
      </style>
    </head>
    <body>
      <h1>🚀 Contador de Visitas API</h1>
      <p>Sistema de contador de visitas customizável com suporte a cookies e LGPD.</p>

      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>✨ CORS Liberado!</strong><br>
        Use de qualquer domínio sem necessidade de configuração. O controle de acesso é feito pelo <code>siteId</code>.
        <br><br>
        <strong>🆔 Como funciona:</strong> Cada site usa um ID único (<code>:siteId</code>) para ter seu próprio contador independente.
      </div>

      <h2>📊 Endpoints Disponíveis</h2>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/badge/:siteId</code>
        <p>Retorna badge SVG com contador de visitas.</p>
        <strong>Query params:</strong> style, color, label, logo
      </div>

      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/track/:siteId</code>
        <p>Registra uma visita no site.</p>
        <strong>Body:</strong> { page, referrer }
      </div>

      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/consent/:siteId</code>
        <p>Atualiza consentimento de cookies.</p>
        <strong>Body:</strong> { visitorId, cookieConsent, analyticsConsent }
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/count/:siteId</code>
        <p>Retorna número total e único de visitas (sem incrementar).</p>
        <strong>Formatos:</strong> ?format=json | text | formatted
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/count/:siteId/increment</code>
        <p><strong>NOVO!</strong> Incrementa E retorna o contador (tracking + leitura em uma chamada).</p>
        <strong>Formatos:</strong> ?format=json | text | formatted
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/stats/:siteId</code>
        <p>Retorna estatísticas detalhadas.</p>
        <strong>Query params:</strong> days (padrão: 30)
      </div>

      <div class="endpoint">
        <span class="method put">PUT</span> <code>/api/config/:siteId</code>
        <p>Atualiza configurações de customização do badge.</p>
        <strong>Body:</strong> { badgeStyle, badgeColor, badgeLabel, badgeLogo }
      </div>

      <h2>💡 Exemplo de Uso</h2>
      <pre>&lt;!-- Badge SVG --&gt;
&lt;img src="http://localhost:${PORT}/api/badge/meu-site?style=flat&color=blue" alt="Visitas"&gt;

&lt;!-- Script de tracking --&gt;
&lt;script src="http://localhost:${PORT}/widget.js" data-site-id="meu-site"&gt;&lt;/script&gt;</pre>

      <h2>🎨 Estilos Disponíveis</h2>
      <p><code>flat</code>, <code>flat-square</code>, <code>plastic</code>, <code>for-the-badge</code></p>

      <h2>🎨 Cores Disponíveis</h2>
      <p><code>brightgreen</code>, <code>green</code>, <code>yellow</code>, <code>orange</code>, <code>red</code>, <code>blue</code>, ou código hex (ex: <code>007acc</code>)</p>
    </body>
    </html>
  `);
});

// Inicializa servidor
async function startServer() {
	try {
		// Testa conexão com banco
		await sequelize.authenticate();
		console.log("✅ Conexão com PostgreSQL estabelecida!");

		// Sincroniza models (cria tabelas se não existirem)
		await sequelize.sync();
		console.log("✅ Models sincronizados!");

		// Inicia servidor
		app.listen(PORT, () => {
			console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
			console.log(`📊 API disponível em http://localhost:${PORT}/api`);
			console.log(`📖 Documentação em http://localhost:${PORT}\n`);
		});
	} catch (error) {
		console.error("❌ Erro ao iniciar servidor:", error);
		process.exit(1);
	}
}

startServer();

module.exports = app;
