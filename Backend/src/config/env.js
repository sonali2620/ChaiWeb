import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback to current working directory

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ChaiWeb",
  jwtSecret: process.env.JWT_SECRET || "mySecretKey123"
};

export default env;