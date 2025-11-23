const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Site = sequelize.define(
	"Site",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		domain: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		totalVisits: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: "total_visits",
		},
		uniqueVisits: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: "unique_visits",
		},
		// Configurações de customização
		badgeStyle: {
			type: DataTypes.STRING,
			defaultValue: "flat",
			field: "badge_style",
		},
		badgeColor: {
			type: DataTypes.STRING,
			defaultValue: "4c1",
			field: "badge_color",
		},
		badgeLabel: {
			type: DataTypes.STRING,
			defaultValue: "Visitas",
			field: "badge_label",
		},
		badgeLogo: {
			type: DataTypes.STRING,
			allowNull: true,
			field: "badge_logo",
		},
		customizable: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: "sites",
		timestamps: true,
		underscored: true,
	}
);

module.exports = Site;
