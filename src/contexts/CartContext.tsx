"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface CartItem {
  productId: string
  name: string
  price: number // in RANDs (as stored in Supabase)
  quantity: number // actual quantity (already multiplied by MOQ)
  image_url: string | null
  category: string
  unit: string // 'g', 'ml', 'gummy', 'pack', etc.
  moq: number // base MOQ for step increment
  strain_name?: string
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number // in RANDs
  addToCart: (item: Omit<CartItem, "quantity">, qty: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  syncCartToSupabase: (userId: string) => Promise<void>
  loadCartFromSupabase: (userId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = "blazr_cart"

function getMOQStep(unit: string): number {
  const u = unit.toLowerCase()
  if (u === "g") return 100 // Flower: 100g steps
  if (u === "ml") return 10 // Concentrates: 10ml steps
  if (u === "gummy") return 10 // Edibles: 10-unit steps
  if (u === "pack") return 1 // Packs: 1 pack steps
  return 10
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCartItems(JSON.parse(stored))
      }
    } catch {}
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch {}
  }, [cartItems, isHydrated])

  const cartCount = cartItems.reduce((sum, item) => sum + 1, 0)

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, qty: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + qty }
            : i
        )
      }
      return [...prev, { ...item, quantity: qty }]
    })
    toast.success(`${item.name} added to cart`)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId))
      return
    }
    setCartItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  // Sync cart TO Supabase (logged-in user)
  const syncCartToSupabase = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      // Try to upsert each item
      for (const item of cartItems) {
        await supabase.from("carts").upsert(
          {
            user_id: userId,
            product_id: item.productId,
            quantity: item.quantity,
          },
          { onConflict: "user_id,product_id" }
        )
      }
    } catch (e) {
      // Carts table may not exist — silent fail
      console.warn("Cart sync to Supabase failed:", e)
    }
  }, [cartItems])

  // Load cart FROM Supabase (logged-in user, on login)
  const loadCartFromSupabase = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("carts")
        .select("*, products(name, wholesale_price, image_url, unit, moq, categories(name))")
        .eq("user_id", userId)

      if (error || !data) return

      const supabaseItems: CartItem[] = data
        .filter((row: any) => row.products != null)
        .map((row: any) => ({
          productId: row.product_id,
          name: row.products.name,
          price: row.products.wholesale_price,
          quantity: row.quantity,
          image_url: row.products.image_url,
          category: row.products.categories?.name || "Unknown",
          unit: row.products.unit,
          moq: row.products.moq || getMOQStep(row.products.unit),
        }))

      if (supabaseItems.length > 0) {
        // Merge with local cart (prefer higher quantity)
        setCartItems((prev) => {
          const merged = [...prev]
          for (const si of supabaseItems) {
            const idx = merged.findIndex((m) => m.productId === si.productId)
            if (idx >= 0) {
              if (si.quantity > merged[idx].quantity) {
                merged[idx] = si
              }
            } else {
              merged.push(si)
            }
          }
          return merged
        })
      }
    } catch (e) {
      // Carts table may not exist — silent fail
      console.warn("Cart load from Supabase failed:", e)
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        syncCartToSupabase,
        loadCartFromSupabase,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
