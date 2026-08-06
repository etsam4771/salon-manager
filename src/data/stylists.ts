import { staff } from "./staff";

// Simple display-name list for booking/POS selectors — sourced from
// StaffMember.fullName (StaffProfile -> User.fullName in the schema).
export const stylists: string[] = staff.map((s) => s.fullName);
