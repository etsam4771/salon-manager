export interface Service {
  id: string;
  category: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

export const services: Service[] = [
  {
    id: "signature-facial",
    category: "Skin",
    name: "Elanova Signature Facial",
    duration: "75 min",
    price: "₹3,200",
    description:
      "A layered ritual of steam, cold-stone massage, and a botanical enzyme mask suited to your skin's mood that day.",
  },
  {
    id: "deep-tissue",
    category: "Body",
    name: "Deep Tissue Massage",
    duration: "60 min",
    price: "₹2,800",
    description:
      "Slow, deliberate pressure through the shoulders and back, aimed at knots built up over weeks, not days.",
  },
  {
    id: "hot-stone",
    category: "Body",
    name: "Hot Stone Therapy",
    duration: "90 min",
    price: "₹3,600",
    description:
      "Warmed basalt stones trace the spine and limbs, easing muscle into stillness before hands take over.",
  },
  {
    id: "classic-haircut",
    category: "Hair",
    name: "Precision Haircut & Style",
    duration: "45 min",
    price: "₹1,400",
    description:
      "A consultation-led cut finished with a blow-dry shaped to how you actually wear your hair.",
  },
  {
    id: "keratin",
    category: "Hair",
    name: "Keratin Smoothing",
    duration: "150 min",
    price: "₹6,500",
    description:
      "Frizz-taming treatment that softens texture for up to twelve weeks without flattening natural volume.",
  },
  {
    id: "gel-manicure",
    category: "Nails",
    name: "Gel Manicure",
    duration: "50 min",
    price: "₹1,100",
    description: "Cuticle care, shape, and a chip-resistant gel finish in a shade from our seasonal edit.",
  },
  {
    id: "pedicure-ritual",
    category: "Nails",
    name: "Restorative Pedicure",
    duration: "60 min",
    price: "₹1,500",
    description:
      "Warm salt soak, callus treatment, and an extended foot-and-calf massage to close out the session.",
  },
  {
    id: "bridal-package",
    category: "Packages",
    name: "Bridal Glow Package",
    duration: "4 hrs",
    price: "₹14,000",
    description:
      "Facial, hair styling, makeup trial, and mani-pedi bundled into a single unhurried appointment.",
  },
];

export const categories = ["All", "Skin", "Body", "Hair", "Nails", "Packages"];
