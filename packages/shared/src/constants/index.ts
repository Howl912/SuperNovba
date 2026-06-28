// API 路由常量
export const API_ROUTES = {
  generate: "/api/generate",
  cards: "/api/cards",
  products: "/api/products",
} as const;

// Supabase 表名
export const DB_TABLES = {
  products: "products",
  generationSessions: "generation_sessions",
  cards: "cards",
} as const;

// Supabase Storage bucket
export const STORAGE_BUCKETS = {
  productImages: "product-images",
  generatedImages: "generated-images",
} as const;
