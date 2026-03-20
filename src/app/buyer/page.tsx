"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, ShoppingCart, FileText, LogOut, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"

const WHATSAPP = "27663249083"

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
}

interface CustomerAccount {
  id: string
  buyer_name: string
  buyer_email: string
  is_active: boolean
}

interface Profile {
  full_name: string
  role: string
}

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [account, setAccount] = useState<CustomerAccount | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Get profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
      setProfile(prof as Profile | null)

      // Get customer account
      const { data: cust } = await supabase
        .from("customer_accounts")
        .select("*")
        .eq("user_id", user.id)
        .single()
      setAccount(cust as CustomerAccount | null)

      // Get orders
      if (cust) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id, order_number, status, total, created_at")
          .eq("customer_account_id", cust.id)
          .order("created_at", { ascending: false })
          .limit(10)
        setOrders(ordersData || [])
      }

      setLoading(false)
    }
    load()
  }, [router])

  function handleLogout() {
    const supabase = createClient()
    supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    quoted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
    processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    shipped: "bg-green-600/10 text-green-300 border-green-600/20",
    delivered: "bg-green-700/20 text-green-200 border-green-700/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-slate-400">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-slate-800/40 bg-[#0b1628]/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {profile?.full_name || account?.buyer_name || "Buyer"}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {account
                  ? account.buyer_email
                  : "Account pending approval"}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-500 text-white gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  New Order
                </Button>
              </a>
              <Button variant="outline" onClick={handleLogout} className="border-slate-700 text-slate-400 gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!account ? (
          // Pending approval state
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">Account Pending Approval</h2>
            <p className="mb-6 mx-auto max-w-md text-sm text-slate-400">
              Your account is currently under review. We verify all wholesale accounts within 24 hours.
              You&apos;ll receive an email and WhatsApp message once approved.
            </p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                Chat with us on WhatsApp
              </Button>
            </a>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card className="card-surface">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5">
                      <Package className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{orders.length}</div>
                      <p className="text-xs text-slate-500">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-surface">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {orders.filter((o) => ["pending", "quoted", "confirmed", "processing"].includes(o.status)).length}
                      </div>
                      <p className="text-xs text-slate-500">Active Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-surface">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        R{orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-500">Total Spend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="card-surface mb-8">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription className="text-xs">Your 10 most recent orders</CardDescription>
                </div>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 gap-1.5 text-xs">
                    New Order <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-500">
                    No orders yet.{" "}
                    <a href={`https://wa.me/${WHATSAPP}`} className="text-green-400 hover:underline">
                      Place your first order via WhatsApp
                    </a>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800/60 hover:bg-transparent">
                        <TableHead className="text-xs text-slate-500">Order #</TableHead>
                        <TableHead className="text-xs text-slate-500">Status</TableHead>
                        <TableHead className="text-xs text-slate-500">Total</TableHead>
                        <TableHead className="text-xs text-slate-500">Date</TableHead>
                        <TableHead className="text-xs text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-slate-800/60">
                          <TableCell className="font-mono text-sm text-slate-300">
                            {order.order_number || order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status] || "bg-slate-700 text-slate-300"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-400">
                            R{(order.total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleDateString("ZA")}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi, I'd like to follow up on order ${order.order_number || order.id.slice(0, 8)}. Status: ${order.status}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="ghost" className="text-xs text-green-400 hover:text-green-300 h-7">
                                📱 Follow up
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I'd like to place a new order for:")}`} target="_blank" rel="noopener noreferrer">
                <Card className="card-surface cursor-pointer glow-green-hover transition-all duration-300 hover:border-green-500/20">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5">
                      <ShoppingCart className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Place New Order</div>
                      <div className="text-xs text-slate-500">Via WhatsApp</div>
                    </div>
                  </CardContent>
                </Card>
              </a>

              <Link href="/catalogue">
                <Card className="card-surface cursor-pointer glow-green-hover transition-all duration-300 hover:border-green-500/20">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <Package className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Browse Catalogue</div>
                      <div className="text-xs text-slate-500">View all products</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I have a question about my account:")}`} target="_blank" rel="noopener noreferrer">
                <Card className="card-surface cursor-pointer glow-green-hover transition-all duration-300 hover:border-green-500/20">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/5">
                      <FileText className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Account Query</div>
                      <div className="text-xs text-slate-500">Chat with us</div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
