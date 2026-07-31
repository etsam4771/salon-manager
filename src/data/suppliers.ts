export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  categories: string[];
}

export const suppliers: Supplier[] = [
  { id: "sp-01", name: "Lumière Haircare Co.", contactPerson: "Rahul Mehta", phone: "+91 98100 22334", categories: ["Hair"] },
  { id: "sp-02", name: "PureSkin Distributors", contactPerson: "Anjali Kulkarni", phone: "+91 98100 55667", categories: ["Skin"] },
  { id: "sp-03", name: "Bloom Nail Supplies", contactPerson: "Vikram Shah", phone: "+91 98100 88990", categories: ["Nails"] },
  { id: "sp-04", name: "SpaEssentials India", contactPerson: "Neha Joshi", phone: "+91 98100 11223", categories: ["Spa", "Tools"] },
];
