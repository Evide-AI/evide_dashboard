export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",

  APP_NAME: "Evide Dashboard",

  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

export default config;
