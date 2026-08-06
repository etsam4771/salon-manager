import type { Product, StockStatus } from "../types/salon";

export function stockStatus(product: Product): StockStatus {
  if (product.quantity <= 0) return "Out of Stock";
  if (product.quantity <= product.reorderLevel) return "Low Stock";
  return "In Stock";
}
