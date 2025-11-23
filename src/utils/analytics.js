const crypto = require("crypto");
const geoip = require("geoip-lite");
const useragent = require("useragent");

/**
 * Anonimiza IP para conformidade LGPD
 */
function hashIp(ip) {
	if (!ip) return null;
	return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

/**
 * Extrai informações de geolocalização do IP
 */
function getGeoData(ip) {
	if (!ip) return { country: null, region: null, city: null };

	const geo = geoip.lookup(ip);
	if (!geo) return { country: null, region: null, city: null };

	return {
		country: geo.country,
		region: geo.region,
		city: geo.city,
	};
}

/**
 * Analisa User Agent para extrair informações do dispositivo
 */
function parseUserAgent(userAgentString) {
	const agent = useragent.parse(userAgentString);

	let deviceType = "unknown";
	if (userAgentString) {
		const ua = userAgentString.toLowerCase();
		if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) {
			deviceType = "bot";
		} else if (ua.includes("mobile")) {
			deviceType = "mobile";
		} else if (ua.includes("tablet") || ua.includes("ipad")) {
			deviceType = "tablet";
		} else {
			deviceType = "desktop";
		}
	}

	return {
		browser: `${agent.family} ${agent.major || ""}`.trim(),
		os: `${agent.os.family} ${agent.os.major || ""}`.trim(),
		deviceType,
	};
}

/**
 * Extrai idioma do navegador
 */
function getLanguage(acceptLanguage) {
	if (!acceptLanguage) return null;
	return acceptLanguage.split(",")[0].split("-")[0];
}

/**
 * Obtém IP real do cliente (considera proxies)
 */
function getClientIp(req) {
	return (
		req.headers["x-forwarded-for"]?.split(",")[0] ||
		req.headers["x-real-ip"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		null
	);
}

module.exports = {
	hashIp,
	getGeoData,
	parseUserAgent,
	getLanguage,
	getClientIp,
};
