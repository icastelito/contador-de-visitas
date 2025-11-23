const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Visitor = sequelize.define(
	"Visitor",
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
		// Consentimentos
		cookieConsent: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			field: "cookie_consent",
		},
		analyticsConsent: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			field: "analytics_consent",
		},
		consentDate: {
			type: DataTypes.DATE,
			allowNull: true,
			field: "consent_date",
		},
		// Estatísticas
		visitCount: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			field: "visit_count",
		},
		lastVisit: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			field: "last_visit",
		},
		firstVisit: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			field: "first_visit",
		},
	},
	{
		tableName: "visitors",
		timestamps: true,
		underscored: true,
		indexes: [{ fields: ["site_id"] }, { unique: true, fields: ["id", "site_id"] }],
	}
);

module.exports = Visitor;
