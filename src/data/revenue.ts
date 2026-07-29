export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: "Feb", amount: 412000 },
  { month: "Mar", amount: 468000 },
  { month: "Apr", amount: 439000 },
  { month: "May", amount: 512000 },
  { month: "Jun", amount: 561000 },
  { month: "Jul", amount: 598000 },
];

export interface CategoryRevenue {
  category: string;
  amount: string;
  pct: number;
}

export const revenueByCategory: CategoryRevenue[] = [
  { category: "Skin", amount: "₹1,84,200", pct: 31 },
  { category: "Hair", amount: "₹1,52,600", pct: 25 },
  { category: "Body", amount: "₹1,21,800", pct: 20 },
  { category: "Nails", amount: "₹86,400", pct: 14 },
  { category: "Packages", amount: "₹53,000", pct: 10 },
];

export const revenueStats = {
  monthToDate: "₹5,98,000",
  monthDelta: "+12.3% vs June",
  avgTicket: "₹2,640",
  avgTicketDelta: "+6.1% vs June",
  outstanding: "₹18,400",
  outstandingNote: "4 unpaid invoices",
};
