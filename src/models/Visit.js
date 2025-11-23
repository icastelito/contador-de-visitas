const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Visit = sequelize.define(
	"Visit",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		siteId: {
			type: DataTypes.STRING,
			allowNull: false,
			field: "site_id",
		},
		visitorId: {
			type: DataTypes.UUID,
			allowNull: true,
			field: "visitor_id",
		},
		// Dados técnicos
		ipHash: {
			type: DataTypes.STRING,
			allowNull: true,
			field: "ip_hash",
		},
		userAgent: {
			type: DataTypes.TEXT,
			field: "user_agent",
		},
		referrer: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		page: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// Geolocalização
		country: {
			type: DataTypes.STRING(2),
			allowNull: true,
		},
		region: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		city: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		// Dispositivo
		browser: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		os: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		deviceType: {
			type: DataTypes.ENUM("desktop", "mobile", "tablet", "bot", "unknown"),
			defaultValue: "unknown",
			field: "device_type",
		},
		// Idioma
		language: {
			type: DataTypes.STRING(10),
			allowNull: true,
		},
		// Consentimento
		hasConsent: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			field: "has_consent",
		},
		// Dados com consentimento (cookies)
		sessionDuration: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: "session_duration",
		},
		pagesViewed: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			field: "pages_viewed",
		},
	},
	{
		tableName: "visits",
		timestamps: true,
		underscored: true,
		indexes: [{ fields: ["site_id"] }, { fields: ["visitor_id"] }, { fields: ["created_at"] }],
	}
);

module.exports = Visit;
