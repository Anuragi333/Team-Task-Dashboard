"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft } from "lucide-react"

interface AdminLoginFormProps {
  onBack: () => void
}

export function AdminLoginForm({ onBack }: AdminLoginFormProps) {
  const [mode, setMode] = useState<"request" | "login">("request")
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    reason: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/admin/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          reason: formData.reason,
        }),
      })

      if (response.ok) {
        setMessage("Admin access request submitted successfully. You will receive an email once approved.")
        setFormData({ email: "", name: "", reason: "", password: "" })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to submit request")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to admin dashboard
        window.location.href = "/admin"
      } else {
        const data = await response.json()
        setError(data.error || "Invalid credentials")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-gray-900 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-white text-2xl">Admin Access</CardTitle>
        <CardDescription className="text-gray-400">
          {mode === "request" ? "Request admin access" : "Admin login"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "request" ? (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="your.email@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="reason" className="text-white">
                Reason for Admin Access
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Please explain why you need admin access..."
                rows={3}
                required
              />
            </div>

            {error && (
              <Alert className="bg-red-900/20 border-red-700">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="bg-green-900/20 border-green-700">
                <AlertDescription className="text-green-400">{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Submitting..." : "Request Access"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("login")}
                className="text-blue-400 hover:text-blue-300"
              >
                Already have admin access? Login
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="admin@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <Alert className="bg-red-900/20 border-red-700">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Logging in..." : "Login as Admin"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode("request")}
                className="text-blue-400 hover:text-blue-300"
              >
                Need admin access? Request here
              </Button>
            </div>
          </form>
        )}

        <div className="text-center pt-4">
          <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main Login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
