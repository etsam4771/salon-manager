import { useMemo, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlinePrinter,
  HiOutlineCheck,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { services } from "../../data/services";
import { stylists } from "../../data/stylists";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import type { PaymentMethod } from "../../types/salon";

type CatalogItem = {
  key: string;
  kind: "service" | "product";
  refId: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
};

interface CartLine {
  key: string;
  kind: "service" | "product";
  refId: string;
  name: string;
  unitPrice: number;
  qty: number;
  stylist?: string;
}

const PROMO_CODES: Record<string, { label: string; type: "percent" | "fixed"; value: number }> = {
  WELCOME10: { label: "WELCOME10 (10% off)", type: "percent", value: 10 },
  FLAT500: { label: "FLAT500 (₹500 off)", type: "fixed", value: 500 },
};

const DISPLAY_PAYMENT_METHODS = ["Cash", "UPI", "Card", "Split"] as const;
type DisplayPaymentMethod = (typeof DISPLAY_PAYMENT_METHODS)[number];

// The UI still shows "Split" as one of the buttons for convenience, but the
// schema's PaymentMethod enum has no such value — a split tender becomes two
// Payment rows against the same Invoice in a real backend. For this single
// mock Payment record we record whichever tender the split leans on.
function toSchemaPaymentMethod(method: DisplayPaymentMethod, splitCash: number, splitOther: number): PaymentMethod {
  if (method === "Cash") return "cash";
  if (method === "UPI") return "upi";
  if (method === "Card") return "card";
  return splitCash >= splitOther ? "cash" : "card";
}

const categories = ["All", "Skin", "Body", "Hair", "Nails", "Packages", "Products"];

export default function AdminPOSPage() {
  const { customers, products, createInvoice } = useSalonData();
  const { showToast } = useToast();

  const catalog: CatalogItem[] = useMemo(
    () => [
      ...services.map((s) => ({
        key: `service-${s.id}`,
        kind: "service" as const,
        refId: s.id,
        name: s.name,
        price: s.price,
        category: s.categoryName,
      })),
      ...products
        .filter((p) => p.usageType === "retail" || p.usageType === "both")
        .map((p) => ({
          key: `product-${p.id}`,
          kind: "product" as const,
          refId: p.id,
          name: p.name,
          price: p.sellingPrice,
          category: "Products",
          stock: p.quantity,
        })),
    ],
    [products]
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");

  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountLabel, setDiscountLabel] = useState("No discount");
  const [promoInput, setPromoInput] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<DisplayPaymentMethod>("Cash");
  const [splitCash, setSplitCash] = useState(0);
  const [splitOther, setSplitOther] = useState(0);

  const filteredCatalog = useMemo(
    () => (activeCategory === "All" ? catalog : catalog.filter((c) => c.category === activeCategory)),
    [catalog, activeCategory]
  );

  function stockFor(refId: string) {
    return products.find((p) => p.id === refId)?.quantity ?? 0;
  }

  function addToCart(item: CatalogItem) {
    if (item.kind === "product" && stockFor(item.refId) <= 0) {
      showToast(`${item.name} is out of stock.`, "error");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.key === item.key);
      if (existing) {
        const maxQty = item.kind === "product" ? stockFor(item.refId) : Infinity;
        if (existing.qty >= maxQty) {
          showToast(`Only ${maxQty} left in stock.`, "warning");
          return prev;
        }
        return prev.map((l) => (l.key === item.key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          key: item.key,
          kind: item.kind,
          refId: item.refId,
          name: item.name,
          unitPrice: item.price,
          qty: 1,
          stylist: item.kind === "service" ? stylists[0] : undefined,
        },
      ];
    });
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function updateLineStylist(key: string, stylist: string) {
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, stylist } : l)));
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function applyPromo() {
    const code = PROMO_CODES[promoInput.trim().toUpperCase()];
    if (!code) {
      showToast("That promo code isn't valid.", "error");
      return;
    }
    setDiscountType(code.type);
    setDiscountValue(code.value);
    setDiscountLabel(code.label);
    showToast(`Applied ${code.label}.`, "success");
  }

  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const discountAmount =
    discountType === "percent"
      ? Math.round((subtotal * discountValue) / 100)
      : discountType === "fixed"
      ? Math.min(discountValue, subtotal)
      : 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxable * 0.18);
  const total = taxable + tax;

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const splitValid = paymentMethod !== "Split" || splitCash + splitOther === total;

  function buildInvoiceText() {
    const lines = cart.map((l) => `${l.name} x${l.qty} — ₹${(l.unitPrice * l.qty).toLocaleString("en-IN")}`);
    return [
      `Invoice — ${selectedCustomer?.fullName ?? "Walk-in customer"}`,
      ...lines,
      `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
      discountAmount > 0 ? `Discount: -₹${discountAmount.toLocaleString("en-IN")}` : null,
      `GST (18%): ₹${tax.toLocaleString("en-IN")}`,
      `Total: ₹${total.toLocaleString("en-IN")}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function handlePrint() {
    if (cart.length === 0) {
      showToast("Add items to the bill before printing.", "warning");
      return;
    }
    window.print();
  }

  function handleWhatsApp() {
    if (cart.length === 0) {
      showToast("Add items to the bill first.", "warning");
      return;
    }
    const text = encodeURIComponent(buildInvoiceText());
    const phone = selectedCustomer?.phone.replace(/[^0-9]/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleCheckout() {
    if (cart.length === 0) {
      showToast("Your bill is empty.", "warning");
      return;
    }
    if (!splitValid) {
      showToast("Split amounts must add up to the total.", "error");
      return;
    }

    createInvoice({
      customerId: customerId || undefined,
      customerName: selectedCustomer?.fullName ?? "Walk-in customer",
      lines: cart.map((l) => ({
        itemType: l.kind,
        referenceId: l.refId,
        description: l.name,
        unitPrice: l.unitPrice,
        quantity: l.qty,
        stylist: l.stylist,
      })),
      discountLabel,
      subtotal,
      discountAmount,
      taxAmount: tax,
      totalAmount: total,
      paymentMethod: toSchemaPaymentMethod(paymentMethod, splitCash, splitOther),
    });

    showToast(`Checkout complete — ₹${total.toLocaleString("en-IN")} via ${paymentMethod}.`, "success");
    setCart([]);
    setDiscountType("none");
    setDiscountValue(0);
    setDiscountLabel("No discount");
    setPromoInput("");
    setPaymentMethod("Cash");
    setSplitCash(0);
    setSplitOther(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Billing / POS" subtitle="Fast checkout for walk-ins and appointments" />

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: catalog */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === c
                    ? "bg-forest text-sand-light border-forest"
                    : "border-blush text-ink/60 hover:border-forest/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredCatalog.map((item) => {
              const outOfStock = item.kind === "product" && stockFor(item.refId) <= 0;
              return (
                <button
                  key={item.key}
                  onClick={() => addToCart(item)}
                  disabled={outOfStock}
                  className="text-left bg-sand-light rounded-xl border border-blush/60 p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink leading-snug">{item.name}</p>
                    <span className="w-7 h-7 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
                      <HiOutlinePlus size={14} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/50">
                      {item.kind === "product" ? (outOfStock ? "Out of stock" : `${stockFor(item.refId)} in stock`) : item.category}
                    </span>
                    <span className="font-display text-base text-forest">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: bill summary */}
        <div className="lg:col-span-2 bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-5 lg:sticky lg:top-6">
          <div>
            <label htmlFor="customer" className="text-sm text-ink/70">
              Customer
            </label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-blush px-4 py-2.5 text-sm outline-none focus:border-forest transition-colors bg-white"
            >
              <option value="">Walk-in customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
            {cart.length === 0 && (
              <p className="text-sm text-ink/40 text-center py-6">Tap items to add them to the bill.</p>
            )}
            {cart.map((line) => (
              <div key={line.key} className="rounded-xl bg-white p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{line.name}</p>
                  <button onClick={() => removeLine(line.key)} className="text-ink/30 hover:text-red-500 shrink-0">
                    <HiOutlineTrash size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(line.key, -1)}
                      className="w-6 h-6 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
                    >
                      <HiOutlineMinus size={11} />
                    </button>
                    <span className="text-sm font-mono w-5 text-center">{line.qty}</span>
                    <button
                      onClick={() => updateQty(line.key, 1)}
                      className="w-6 h-6 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
                    >
                      <HiOutlinePlus size={11} />
                    </button>
                  </div>
                  {line.kind === "service" && (
                    <select
                      value={line.stylist}
                      onChange={(e) => updateLineStylist(line.key, e.target.value)}
                      className="text-xs border border-blush rounded-full px-2 py-1 outline-none bg-white"
                      title="Commission assigned to"
                    >
                      {stylists.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="text-sm text-ink/70 ml-auto">
                    ₹{(line.unitPrice * line.qty).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Discount engine */}
          <div className="flex flex-col gap-2 border-t border-blush/40 pt-4">
            <p className="text-sm text-ink/70">Discount</p>
            <div className="flex gap-2">
              {(["none", "percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setDiscountType(t);
                    setDiscountValue(t === "none" ? 0 : discountValue || (t === "percent" ? 10 : 100));
                    setDiscountLabel(t === "none" ? "No discount" : `Manual ${t === "percent" ? "%" : "₹"} discount`);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    discountType === t
                      ? "bg-forest text-sand-light border-forest"
                      : "border-blush text-ink/60 hover:border-forest/40"
                  }`}
                >
                  {t === "none" ? "None" : t === "percent" ? "%" : "₹ fixed"}
                </button>
              ))}
              {discountType !== "none" && (
                <input
                  type="number"
                  min={0}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  className="w-20 rounded-full border border-blush px-3 py-1 text-xs outline-none focus:border-forest"
                />
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code"
                className="flex-1 rounded-full border border-blush px-3 py-1.5 text-xs outline-none focus:border-forest uppercase"
              />
              <button
                onClick={applyPromo}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-forest text-forest hover:bg-forest hover:text-sand-light transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Tax box */}
          <div className="border-t border-blush/40 pt-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Discount</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/60">
              <span>GST (18%)</span>
              <span className="font-mono">₹{tax.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-lg font-display text-ink pt-1">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="border-t border-blush/40 pt-4">
            <p className="text-sm text-ink/70 mb-2">Payment method</p>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    paymentMethod === m
                      ? "bg-forest text-sand-light border-forest"
                      : "border-blush text-ink/60 hover:border-forest/40"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === "UPI" && total > 0 && (
              <div className="mt-3 flex items-center gap-3 bg-white rounded-xl p-3">
                <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0" aria-label="UPI QR code">
                  <rect width="80" height="80" fill="white" />
                  {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const on = (row * 7 + col * total) % 5 < 2;
                    return on ? <rect key={i} x={col * 10} y={row * 10} width="10" height="10" fill="#0F172A" /> : null;
                  })}
                </svg>
                <div className="text-xs text-ink/60">
                  <p className="font-medium text-ink">Scan to pay</p>
                  <p>₹{total.toLocaleString("en-IN")} via UPI</p>
                </div>
              </div>
            )}

            {paymentMethod === "Split" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-ink/50">Cash</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCash}
                    onChange={(e) => setSplitCash(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink/50">Card / UPI</label>
                  <input
                    type="number"
                    min={0}
                    value={splitOther}
                    onChange={(e) => setSplitOther(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest"
                  />
                </div>
                {!splitValid && (
                  <p className="col-span-2 text-xs text-red-500">
                    Split amounts must total ₹{total.toLocaleString("en-IN")}.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 text-sm border border-blush rounded-full py-2.5 text-ink/70 hover:border-forest hover:text-forest transition-colors"
            >
              <HiOutlinePrinter size={15} /> Print
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1.5 text-sm border border-blush rounded-full py-2.5 text-ink/70 hover:border-forest hover:text-forest transition-colors"
            >
              <FaWhatsapp size={14} /> WhatsApp
            </button>
          </div>

          <button
            onClick={handleCheckout}
            className="flex items-center justify-center gap-1.5 bg-forest text-sand-light rounded-full py-3 font-medium hover:bg-forest-dark transition-colors"
          >
            <HiOutlineCheck /> Complete checkout
          </button>
        </div>
      </div>
    </div>
  );
}
