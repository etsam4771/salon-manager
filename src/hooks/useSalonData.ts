import { useContext } from "react";
import { SalonDataContext } from "../store/SalonDataContext";

export function useSalonData() {
  const ctx = useContext(SalonDataContext);
  if (!ctx) {
    throw new Error("useSalonData must be used within a <SalonDataProvider>");
  }
  return ctx;
}
