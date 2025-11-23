/**
 * Widget de Contador de Visitas com Consentimento LGPD
 *
 * Uso:
 * <script src="https://seu-servidor.com/widget.js" data-site-id="meu-site"></script>
 *
 * Opções via data attributes:
 * - data-site-id: ID único do site (obrigatório)
 * - data-show-badge: true/false (mostrar badge, padrão: true)
 * - data-badge-position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 * - data-auto-consent: true/false (aceitar automaticamente, padrão: false)
 */

(function () {
	"use strict";

	// Configuração
	const script = document.currentScript;
	const API_BASE = script.src.replace("/widget.js", "/api");
	const SITE_ID = script.dataset.siteId;
	const SHOW_BADGE = script.dataset.showBadge !== "false";
	const BADGE_POSITION = script.dataset.badgePosition || "bottom-right";
	const AUTO_CONSENT = script.dataset.autoConsent === "true";

	if (!SITE_ID) {
		console.error("[Contador] data-site-id é obrigatório");
		return;
	}

	// Estado
	let visitorId = null;
	let hasConsent = false;

	// CSS do banner de consentimento
	const styles = `
    #contador-consent-banner {
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 380px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #contador-consent-banner h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
    }
    #contador-consent-banner p {
      margin: 0 0 15px 0;
      color: #666;
    }
    #contador-consent-banner .buttons {
      display: flex;
      gap: 10px;
    }
    #contador-consent-banner button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    #contador-consent-banner .accept {
      background: #007acc;
      color: white;
    }
    #contador-consent-banner .accept:hover {
      background: #005a9e;
    }
    #contador-consent-banner .reject {
      background: #f0f0f0;
      color: #666;
    }
    #contador-consent-banner .reject:hover {
      background: #e0e0e0;
    }
    #contador-badge {
      position: fixed;
      z-index: 9999;
    }
    #contador-badge.top-left { top: 10px; left: 10px; }
    #contador-badge.top-right { top: 10px; right: 10px; }
    #contador-badge.bottom-left { bottom: 10px; left: 10px; }
    #contador-badge.bottom-right { bottom: 10px; right: 10px; }
  `;

	// Injeta CSS
	const styleSheet = document.createElement("style");
	styleSheet.textContent = styles;
	document.head.appendChild(styleSheet);

	// Verifica se já tem consentimento salvo
	function getStoredConsent() {
		try {
			const consent = localStorage.getItem(`contador_consent_${SITE_ID}`);
			return consent ? JSON.parse(consent) : null;
		} catch (e) {
			return null;
		}
	}

	// Salva consentimento no localStorage
	function saveConsent(cookieConsent, analyticsConsent) {
		try {
			localStorage.setItem(
				`contador_consent_${SITE_ID}`,
				JSON.stringify({
					cookie: cookieConsent,
					analytics: analyticsConsent,
					date: new Date().toISOString(),
				})
			);
		} catch (e) {
			console.error("[Contador] Erro ao salvar consentimento:", e);
		}
	}

	// Mostra banner de consentimento
	function showConsentBanner() {
		const banner = document.createElement("div");
		banner.id = "contador-consent-banner";
		banner.innerHTML = `
      <h3>🍪 Este site usa cookies</h3>
      <p>Usamos cookies para contar visitas e melhorar sua experiência. Seus dados são anônimos e respeitam a LGPD.</p>
      <div class="buttons">
        <button class="reject" onclick="window.contadorReject()">Rejeitar</button>
        <button class="accept" onclick="window.contadorAccept()">Aceitar</button>
      </div>
    `;
		document.body.appendChild(banner);
	}

	// Remove banner
	function removeBanner() {
		const banner = document.getElementById("contador-consent-banner");
		if (banner) {
			banner.style.animation = "slideIn 0.3s ease-out reverse";
			setTimeout(() => banner.remove(), 300);
		}
	}

	// Aceitar cookies
	window.contadorAccept = async function () {
		hasConsent = true;
		saveConsent(true, true);
		removeBanner();

		if (visitorId) {
			await updateConsent(true, true);
		}
	};

	// Rejeitar cookies
	window.contadorReject = function () {
		hasConsent = false;
		saveConsent(false, false);
		removeBanner();

		if (visitorId) {
			updateConsent(false, false);
		}
	};

	// Atualiza consentimento no servidor
	async function updateConsent(cookieConsent, analyticsConsent) {
		try {
			await fetch(`${API_BASE}/consent/${SITE_ID}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					visitorId,
					cookieConsent,
					analyticsConsent,
				}),
			});
		} catch (e) {
			console.error("[Contador] Erro ao atualizar consentimento:", e);
		}
	}

	// Registra visita
	async function trackVisit() {
		try {
			const response = await fetch(`${API_BASE}/track/${SITE_ID}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					page: window.location.href,
					referrer: document.referrer,
				}),
			});

			const data = await response.json();
			visitorId = data.visitorId;

			// Verifica se precisa mostrar banner de consentimento
			const storedConsent = getStoredConsent();

			if (AUTO_CONSENT) {
				// Aceita automaticamente
				hasConsent = true;
				await updateConsent(true, true);
				saveConsent(true, true);
			} else if (!storedConsent && data.needsConsent) {
				// Mostra banner se não tem consentimento salvo
				showConsentBanner();
			} else if (storedConsent) {
				// Usa consentimento salvo
				hasConsent = storedConsent.cookie;
				await updateConsent(storedConsent.cookie, storedConsent.analytics);
			}
		} catch (error) {
			console.error("[Contador] Erro ao registrar visita:", error);
		}
	}

	// Mostra badge (opcional)
	function showBadge() {
		if (!SHOW_BADGE) return;

		const badge = document.createElement("img");
		badge.id = "contador-badge";
		badge.className = BADGE_POSITION;
		badge.src = `${API_BASE}/badge/${SITE_ID}`;
		badge.alt = "Contador de Visitas";
		badge.style.cursor = "pointer";

		// Recarrega badge a cada 30 segundos
		setInterval(() => {
			badge.src = `${API_BASE}/badge/${SITE_ID}?t=${Date.now()}`;
		}, 30000);

		document.body.appendChild(badge);
	}

	// Inicializa quando DOM estiver pronto
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			trackVisit();
			showBadge();
		});
	} else {
		trackVisit();
		showBadge();
	}

	// API pública para uso manual
	window.ContadorVisitas = {
		trackPageView: function (page) {
			return fetch(`${API_BASE}/track/${SITE_ID}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ page, referrer: document.referrer }),
			});
		},
		getStats: async function (days = 30) {
			const response = await fetch(`${API_BASE}/stats/${SITE_ID}?days=${days}`);
			return response.json();
		},
		getCount: async function () {
			const response = await fetch(`${API_BASE}/count/${SITE_ID}`);
			return response.json();
		},
		updateConfig: function (config) {
			return fetch(`${API_BASE}/config/${SITE_ID}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(config),
			});
		},
	};
})();
