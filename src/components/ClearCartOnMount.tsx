"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Clears the cart only after a successful order page load (payment done / confirmed). */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
