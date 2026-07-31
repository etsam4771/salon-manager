// Kept as a simple name list for existing dropdowns (booking form, POS
// commission assignor). src/data/staff.ts is now the richer source of
// truth used by the Staff admin page.
import { staff } from "./staff";

export const stylists = staff.map((s) => s.name);
