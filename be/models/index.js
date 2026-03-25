// models/index.js (FINAL)

import { readdirSync } from "fs";
import { dirname, basename, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sequelize, { Sequelize } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = {};
const modelPromises = [];

const collectModelPromises = (dirPath) => {
  const files = readdirSync(dirPath).filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename(__filename) &&
      file.slice(-3) === ".js"
    );
  });

  for (const file of files) {
    const modelPath = join(dirPath, file);
    const modelUrl = pathToFileURL(modelPath).href;

    modelPromises.push(
      import(modelUrl)
        .then((modelModule) => {
          return modelModule.default(sequelize);
        })
        .catch((error) => {
          console.error(`❌ Gagal memuat model dari ${modelPath}:`, error);
          return null;
        }),
    );
  }
};

collectModelPromises(join(__dirname, "1_user_management"));
collectModelPromises(join(__dirname, "2_eam_core"));
collectModelPromises(join(__dirname, "3_maintenance_flow"));
collectModelPromises(join(__dirname, "4_inventory_tools"));
collectModelPromises(join(__dirname, "5_itam_management"));
collectModelPromises(join(__dirname, "6_general_utility"));
collectModelPromises(join(__dirname, "approval"));
collectModelPromises(join(__dirname, "hrga"));

/**
 * Fungsi ASINKRON untuk memuat semua model dan menginisialisasi asosiasi.
 */
export const initializeDB = async () => {
  console.log("⏳ Memuat model database...");
  const models = await Promise.all(modelPromises);

  models.forEach((model) => {
    if (model && model.name) {
      console.log(
        `Loading model: ${model.name} from ${model.constructor.name}`,
      );
      db[model.name] = model;
    }
  });
  console.log(`✅ ${Object.keys(db).length} Model berhasil dimuat.`);
  console.log("Available models:", Object.keys(db));

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  console.log("✅ Asosiasi Model berhasil diinisialisasi.");

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};

// Mengekspor db sebagai named export
export { db, sequelize, Sequelize };
