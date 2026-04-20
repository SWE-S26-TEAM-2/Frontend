export const ENV = {
  USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === "true",
  // Upgrade http→https when served over HTTPS (guards against wrong env var on server)
  get API_BASE_URL(): string {
    const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    if (typeof window !== "undefined" && window.location.protocol === "https:" && raw.startsWith("http://")) {
      return raw.replace("http://", "https://");
    }
    return raw;
  },
};