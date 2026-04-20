export const ENV = {
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === "true",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
};