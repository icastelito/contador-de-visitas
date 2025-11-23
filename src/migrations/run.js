const sequelize = require("../config/database");
const Site = require("../models/Site");
const Visit = require("../models/Visit");
const Visitor = require("../models/Visitor");

async function runMigrations() {
	try {
		console.log("🔄 Conectando ao banco de dados...");
		await sequelize.authenticate();
		console.log("✅ Conexão estabelecida com sucesso!");

		console.log("🔄 Sincronizando models...");
		await sequelize.sync({ force: false });
		console.log("✅ Tabelas criadas/atualizadas com sucesso!");

		console.log("\n📊 Estrutura do banco:");
		console.log("  - sites: Configurações dos sites");
		console.log("  - visitors: Dados dos visitantes com consentimento");
		console.log("  - visits: Registro de cada visita");
	} catch (error) {
		console.error("❌ Erro ao executar migrations:", error);
		process.exit(1);
	} finally {
		await sequelize.close();
	}
}

if (require.main === module) {
	runMigrations();
}

module.exports = runMigrations;
