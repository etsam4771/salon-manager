export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: "Hair" | "Skin" | "Nails" | "Spa" | "Tools";
  sku: string;
  quantity: number;
  threshold: number;
  unit: string;
  supplierId: string;
  costPrice: number;
  sellPrice: number;
  retail: boolean; // sellable to walk-in customers via POS
}

export const inventory: InventoryItem[] = [
  { id: "inv-01", name: "Argan Repair Shampoo 250ml", category: "Hair", sku: "HR-SHM-250", quantity: 34, threshold: 10, unit: "bottle", supplierId: "sp-01", costPrice: 280, sellPrice: 650, retail: true },
  { id: "inv-02", name: "Keratin Smoothing Serum", category: "Hair", sku: "HR-SER-100", quantity: 6, threshold: 8, unit: "bottle", supplierId: "sp-01", costPrice: 420, sellPrice: 950, retail: true },
  { id: "inv-03", name: "Vitamin C Brightening Mask", category: "Skin", sku: "SK-MSK-050", quantity: 18, threshold: 10, unit: "jar", supplierId: "sp-02", costPrice: 190, sellPrice: 450, retail: true },
  { id: "inv-04", name: "SPF 50 Daily Sunscreen", category: "Skin", sku: "SK-SPF-075", quantity: 3, threshold: 12, unit: "tube", supplierId: "sp-02", costPrice: 160, sellPrice: 420, retail: true },
  { id: "inv-05", name: "Gel Polish — Rose Nude", category: "Nails", sku: "NL-GEL-014", quantity: 22, threshold: 6, unit: "bottle", supplierId: "sp-03", costPrice: 110, sellPrice: 0, retail: false },
  { id: "inv-06", name: "Cuticle Oil Pen", category: "Nails", sku: "NL-OIL-009", quantity: 0, threshold: 10, unit: "pcs", supplierId: "sp-03", costPrice: 60, sellPrice: 250, retail: true },
  { id: "inv-07", name: "Hot Stone Set (12pc)", category: "Spa", sku: "SP-STN-012", quantity: 5, threshold: 2, unit: "set", supplierId: "sp-04", costPrice: 1800, sellPrice: 0, retail: false },
  { id: "inv-08", name: "Massage Oil — Lavender 500ml", category: "Spa", sku: "SP-OIL-500", quantity: 14, threshold: 8, unit: "bottle", supplierId: "sp-04", costPrice: 220, sellPrice: 580, retail: true },
  { id: "inv-09", name: "Disposable Towels (pack of 50)", category: "Tools", sku: "TL-TWL-050", quantity: 9, threshold: 15, unit: "pack", supplierId: "sp-04", costPrice: 340, sellPrice: 0, retail: false },
  { id: "inv-10", name: "Nitrile Gloves (box of 100)", category: "Tools", sku: "TL-GLV-100", quantity: 2, threshold: 5, unit: "box", supplierId: "sp-04", costPrice: 260, sellPrice: 0, retail: false },
];

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return "Out of Stock";
  if (item.quantity <= item.threshold) return "Low Stock";
  return "In Stock";
}
