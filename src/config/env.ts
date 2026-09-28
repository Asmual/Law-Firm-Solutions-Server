import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://Law-Firm-Solutions:kNhwX5CoMAvt7iim@asmual.4icepzp.mongodb.net/law_firm_solutions?retryWrites=true&w=majority&appName=Asmual",
  JWT_TOKEN_SECRET:
    process.env.JWT_TOKEN_SECRET || "chamber_super_secure_jwt_secret_token_law_firm_solutions_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "chamber_super_secure_refresh_secret_key_law_firm_2026_bd",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
} as const;
