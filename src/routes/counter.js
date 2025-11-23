const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Site = require("../models/Site");
const Visit = require("../models/Visit");
const Visitor = require("../models/Visitor");
const { generateBadge } = require("../services/badge");
const { hashIp, getGeoData, parseUserAgent, getLanguage, getClientIp } = require("../utils/analytics");

const router = express.Router();

/**
 * POST /register
 * Cria um novo site e retorna o script configurado
 * Requer autenticação básica
 */
router.post("/register", async (req, res) => {
	try {
		const { user, password, customizable = false } = req.body;

		// Validação de credenciais
		if (!user || !password) {
			return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
		}

		if (user !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
			return res.status(401).json({ error: "Credenciais inválidas" });
		}

		// Cria novo site
		const site = await Site.create({
			customizable: customizable === true || customizable === "true",
		});

		// Gera script baseado no tipo
		const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
		const siteId = site.id;

		let script;
		if (site.customizable) {
			// Script para uso customizado (API apenas)
			script = `<!-- Contador de Visitas - Modo Customizado -->
<script>
  // Use a API para buscar o contador:
  // GET ${baseUrl}/api/count/${siteId}?format=text
  // GET ${baseUrl}/api/count/${siteId}?format=formatted
  // GET ${baseUrl}/api/count/${siteId}/increment?format=text (rastreia + retorna)
  
  // Exemplo de uso:
  fetch('${baseUrl}/api/count/${siteId}/increment?format=text')
    .then(r => r.text())
    .then(count => {
      document.getElementById('contador').textContent = count;
    });
</script>`;
		} else {
			// Script com widget completo (badge + LGPD)
			script = `<!-- Contador de Visitas -->
<div id="visit-counter-${siteId}"></div>
<script src="${baseUrl}/widget.js" data-site-id="${siteId}"></script>`;
		}

		res.json({
			success: true,
			siteId: siteId,
			customizable: site.customizable,
			script: script,
			scriptFormatted: script.replace(/\\n/g, "\n"), // Script formatado para copiar
			endpoints: {
				badge: `${baseUrl}/api/badge/${siteId}`,
				count: `${baseUrl}/api/count/${siteId}`,
				increment: `${baseUrl}/api/count/${siteId}/increment`,
				stats: `${baseUrl}/api/stats/${siteId}`,
			},
		});
	} catch (error) {
		console.error("Erro ao registrar site:", error);
		res.status(500).json({ error: "Erro ao registrar site" });
	}
});

/**
 * GET /badge/:siteId
 * Retorna badge SVG com contador de visitas
 */
router.get("/badge/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { style, color, label, logo, format = "svg" } = req.query;

		// Busca site por ID
		let site = await Site.findByPk(siteId);
		if (!site) {
			return res.status(404).send("Site não encontrado");
		}

		// Opções de customização (query params tem prioridade)
		const badgeOptions = {
			style: style || site.badgeStyle,
			color: color || site.badgeColor,
			label: label || site.badgeLabel,
			logo: logo || site.badgeLogo,
		};

		const svg = generateBadge(site.totalVisits, badgeOptions);

		res.setHeader("Content-Type", "image/svg+xml");
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.send(svg);
	} catch (error) {
		console.error("Erro ao gerar badge:", error);
		res.status(500).send("Erro ao gerar badge");
	}
});

/**
 * POST /track/:siteId
 * Registra uma visita
 */
router.post("/track/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { page, referrer } = req.body;

		// Dados da requisição
		const ip = getClientIp(req);
		const ipHash = hashIp(ip);
		const userAgent = req.headers["user-agent"];
		const acceptLanguage = req.headers["accept-language"];

		// Análise de dados
		const geoData = getGeoData(ip);
		const deviceData = parseUserAgent(userAgent);
		const language = getLanguage(acceptLanguage);

		// Busca site por ID
		let site = await Site.findByPk(siteId);
		if (!site) {
			return res.status(404).json({ error: "Site não encontrado" });
		}

		// Verifica cookie de visitor_id
		let visitorId = req.cookies?.visitor_id;
		let visitor = null;
		let isNewVisitor = false;

		if (visitorId) {
			visitor = await Visitor.findOne({
				where: { id: visitorId, siteId },
			});

			if (visitor) {
				// Visitante retornando
				visitor.visitCount += 1;
				visitor.lastVisit = new Date();
				await visitor.save();
			}
		}

		if (!visitor) {
			// Novo visitante
			isNewVisitor = true;
			visitorId = uuidv4();
			visitor = await Visitor.create({
				id: visitorId,
				siteId,
				cookieConsent: false,
				analyticsConsent: false,
			});

			// Define cookie (1 ano)
			res.cookie("visitor_id", visitorId, {
				maxAge: 365 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				sameSite: "none",
				secure: process.env.NODE_ENV === "production",
			});

			site.uniqueVisits += 1;
		}

		// Registra visita
		await Visit.create({
			siteId,
			visitorId,
			ipHash,
			userAgent,
			referrer,
			page,
			...geoData,
			...deviceData,
			language,
			hasConsent: visitor.cookieConsent,
		});

		// Atualiza total de visitas
		site.totalVisits += 1;
		await site.save();

		res.json({
			success: true,
			visitorId,
			isNewVisitor,
			needsConsent: !visitor.cookieConsent,
		});
	} catch (error) {
		console.error("Erro ao registrar visita:", error);
		res.status(500).json({ error: "Erro ao registrar visita" });
	}
});

/**
 * POST /consent/:siteId
 * Atualiza consentimento de cookies
 */
router.post("/consent/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { visitorId, cookieConsent, analyticsConsent } = req.body;

		if (!visitorId) {
			return res.status(400).json({ error: "visitorId obrigatório" });
		}

		const visitor = await Visitor.findOne({
			where: { id: visitorId, siteId },
		});

		if (!visitor) {
			return res.status(404).json({ error: "Visitante não encontrado" });
		}

		visitor.cookieConsent = cookieConsent;
		visitor.analyticsConsent = analyticsConsent;
		visitor.consentDate = new Date();
		await visitor.save();

		res.json({ success: true, message: "Consentimento atualizado" });
	} catch (error) {
		console.error("Erro ao atualizar consentimento:", error);
		res.status(500).json({ error: "Erro ao atualizar consentimento" });
	}
});

/**
 * GET /count/:siteId
 * Retorna apenas o número de visitas
 */
router.get("/count/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { format = "json" } = req.query;

		const site = await Site.findByPk(siteId);

		const data = {
			totalVisits: site?.totalVisits || 0,
			uniqueVisits: site?.uniqueVisits || 0,
		};

		// Retorna apenas o número se format=text
		if (format === "text") {
			res.setHeader("Content-Type", "text/plain");
			return res.send(data.totalVisits.toString());
		}

		// Retorna apenas o número formatado se format=formatted
		if (format === "formatted") {
			res.setHeader("Content-Type", "text/plain");
			return res.send(formatNumber(data.totalVisits));
		}

		// Retorna JSON completo
		res.json(data);
	} catch (error) {
		console.error("Erro ao buscar contagem:", error);
		res.status(500).json({ error: "Erro ao buscar contagem" });
	}
});

/**
 * GET /count/:siteId/increment
 * Incrementa E retorna o contador (tracking + count em uma chamada)
 */
router.get("/count/:siteId/increment", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { format = "json" } = req.query;
		const { page, referrer } = req.query;

		// Dados da requisição
		const ip = getClientIp(req);
		const ipHash = hashIp(ip);
		const userAgent = req.headers["user-agent"];
		const acceptLanguage = req.headers["accept-language"];

		// Análise de dados
		const geoData = getGeoData(ip);
		const deviceData = parseUserAgent(userAgent);
		const language = getLanguage(acceptLanguage);

		// Busca site por ID
		let site = await Site.findByPk(siteId);
		if (!site) {
			return res.status(404).json({ error: "Site não encontrado" });
		}

		// Verifica cookie de visitor_id
		let visitorId = req.cookies?.visitor_id;
		let visitor = null;
		let isNewVisitor = false;

		if (visitorId) {
			visitor = await Visitor.findOne({
				where: { id: visitorId, siteId },
			});

			if (visitor) {
				visitor.visitCount += 1;
				visitor.lastVisit = new Date();
				await visitor.save();
			}
		}

		if (!visitor) {
			isNewVisitor = true;
			visitorId = uuidv4();
			visitor = await Visitor.create({
				id: visitorId,
				siteId,
				cookieConsent: false,
				analyticsConsent: false,
			});

			res.cookie("visitor_id", visitorId, {
				maxAge: 365 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				sameSite: "none",
				secure: process.env.NODE_ENV === "production",
			});

			site.uniqueVisits += 1;
		}

		// Registra visita
		await Visit.create({
			siteId,
			visitorId,
			ipHash,
			userAgent,
			referrer: referrer || req.headers.referer,
			page: page || req.headers.referer,
			...geoData,
			...deviceData,
			language,
			hasConsent: visitor.cookieConsent,
		});

		// Atualiza total de visitas
		site.totalVisits += 1;
		await site.save();

		const data = {
			totalVisits: site.totalVisits,
			uniqueVisits: site.uniqueVisits,
			isNewVisitor,
			needsConsent: !visitor.cookieConsent,
		};

		// Retorna apenas o número se format=text
		if (format === "text") {
			res.setHeader("Content-Type", "text/plain");
			res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			return res.send(data.totalVisits.toString());
		}

		// Retorna apenas o número formatado se format=formatted
		if (format === "formatted") {
			res.setHeader("Content-Type", "text/plain");
			res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			return res.send(formatNumber(data.totalVisits));
		}

		// Retorna JSON completo
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.json(data);
	} catch (error) {
		console.error("Erro ao incrementar contador:", error);
		res.status(500).json({ error: "Erro ao incrementar contador" });
	}
});

// Função auxiliar para formatar números
function formatNumber(num) {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
}

/**
 * GET /stats/:siteId
 * Retorna estatísticas detalhadas
 */
router.get("/stats/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { days = 30 } = req.query;

		const site = await Site.findByPk(siteId);
		if (!site) {
			return res.status(404).json({ error: "Site não encontrado" });
		}

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(days));

		// Busca visitas no período
		const visits = await Visit.findAll({
			where: {
				siteId,
				createdAt: {
					[require("sequelize").Op.gte]: startDate,
				},
			},
		});

		// Estatísticas agregadas
		const stats = {
			totalVisits: site.totalVisits,
			uniqueVisits: site.uniqueVisits,
			period: {
				days: parseInt(days),
				visits: visits.length,
			},
			devices: {},
			browsers: {},
			countries: {},
			referrers: {},
		};

		// Agregação de dados
		visits.forEach((visit) => {
			// Dispositivos
			stats.devices[visit.deviceType] = (stats.devices[visit.deviceType] || 0) + 1;

			// Navegadores
			if (visit.browser) {
				stats.browsers[visit.browser] = (stats.browsers[visit.browser] || 0) + 1;
			}

			// Países
			if (visit.country) {
				stats.countries[visit.country] = (stats.countries[visit.country] || 0) + 1;
			}

			// Referrers
			if (visit.referrer) {
				stats.referrers[visit.referrer] = (stats.referrers[visit.referrer] || 0) + 1;
			}
		});

		res.json(stats);
	} catch (error) {
		console.error("Erro ao buscar estatísticas:", error);
		res.status(500).json({ error: "Erro ao buscar estatísticas" });
	}
});

/**
 * PUT /config/:siteId
 * Atualiza configurações de customização do badge
 */
router.put("/config/:siteId", async (req, res) => {
	try {
		const { siteId } = req.params;
		const { badgeStyle, badgeColor, badgeLabel, badgeLogo, domain } = req.body;

		let site = await Site.findByPk(siteId);

		if (!site) {
			return res.status(404).json({ error: "Site não encontrado" });
		}

		// Atualiza apenas campos fornecidos
		if (badgeStyle) site.badgeStyle = badgeStyle;
		if (badgeColor) site.badgeColor = badgeColor;
		if (badgeLabel) site.badgeLabel = badgeLabel;
		if (badgeLogo !== undefined) site.badgeLogo = badgeLogo;
		if (domain) site.domain = domain;

		await site.save();

		res.json({
			success: true,
			message: "Configurações atualizadas",
			config: {
				badgeStyle: site.badgeStyle,
				badgeColor: site.badgeColor,
				badgeLabel: site.badgeLabel,
				badgeLogo: site.badgeLogo,
			},
		});
	} catch (error) {
		console.error("Erro ao atualizar configurações:", error);
		res.status(500).json({ error: "Erro ao atualizar configurações" });
	}
});

module.exports = router;
