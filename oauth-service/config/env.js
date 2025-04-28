require("dotenv").config();

const requiredEnvVars = [
  "PORT",
  "SUPERBASE_DB_URL",
  "SUPERBASE_API_KEY",
  "REDIRECT_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT,
  REDIRECT_URL: process.env.REDIRECT_URL,
  GITHUB: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  }
};