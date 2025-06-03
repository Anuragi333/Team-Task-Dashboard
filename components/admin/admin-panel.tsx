"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, UserPlus, Check, X, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import type { User, Role, AdminRequest } from "../../types"

interface AdminPanelProps {
  user: User
  onBack: () => void
}

export function AdminPanel({ user, onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("requests")
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    level: 1,
    permissions: {} as Record<string, any>,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [requestsRes, usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/users"),
        fetch("/api/admin/roles"),
      ])

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setAdminRequests(requestsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewRequest = async (requestId: number, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerId: user.id }),
      })

      if (response.ok) {
        setAdminRequests(
          adminRequests.map((req) =>
            req.id === requestId
              ? { ...req, status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }
              : req,
          ),
        )
      }
    } catch (error) {
      console.error("Error reviewing request:", error)
    }
  }

  const handleUpdateUserRole = async (userId: number, roleId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      })

      if (response.ok) {
        loadData() // Reload to get updated user data
      }
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name) return

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRole,
          created_by: user.id,
        }),
      })

      if (response.ok) {
        const role = await response.json()
        setRoles([...roles, role])
        setNewRole({ name: "", description: "", level: 1, permissions: {} })
        setIsCreateRoleOpen(false)
      }
    } catch (error) {
      console.error("Error creating role:", error)
    }
  }

  const pendingRequests = adminRequests.filter((req) => req.status === "pending")

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <div className="h-1 w-24 bg-white rounded-full"></div>
            <p className="text-gray-400 mt-2">System administration and user management</p>
          </div>

          <Button
            variant="outline"
            onClick={onBack}
            className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-900/50 border-gray-700">
            <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <UserPlus className="w-4 h-4 mr-2" />
              Access Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-red-600 text-white">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Shield className="w-4 h-4 mr-2" />
              Role Management
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="requests" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Admin Access Requests</h2>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">
                  {pendingRequests.length} pending
                </Badge>
              </div>

              {adminRequests.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-8 text-center">
                    <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg">No admin requests found</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {adminRequests.map((request) => (
                    <Card key={request.id} className="bg-gray-900/50 border-gray-700/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white">{request.name}</CardTitle>
                            <CardDescription className="text-gray-400">{request.email}</CardDescription>
                          </div>
                          <Badge
                            className={
                              request.status === "pending"
                                ? "bg-yellow-900/30 text-yellow-400 border-yellow-400/30"
                                : request.status === "approved"
                                  ? "bg-green-900/30 text-green-400 border-green-400/30"
                                  : "bg-red-900/30 text-red-400 border-red-400/30"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {request.reason && (
                          <div className="mb-4">
                            <Label className="text-white text-sm font-medium">Reason:</Label>
                            <p className="text-gray-300 mt-1">{request.reason}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Requested: {new Date(request.requested_at).toLocaleString()}</span>
                          {request.reviewed_at && (
                            <span>Reviewed: {new Date(request.reviewed_at).toLocaleString()}</span>
                          )}
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleReviewRequest(request.id, "approved")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReviewRequest(request.id, "rejected")}
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">{users.length} users</Badge>
              </div>

              <Card className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Current Role</TableHead>
                        <TableHead className="text-gray-300">Level</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem.id} className="border-gray-700">
                          <TableCell className="text-white">{userItem.name}</TableCell>
                          <TableCell className="text-gray-300">{userItem.email}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">
                              {userItem.roleDetails?.name || "No Role"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{userItem.roleDetails?.level || 0}</TableCell>
                          <TableCell>
                            <Select
                              value={userItem.role_id?.toString() || ""}
                              onValueChange={(value) => handleUpdateUserRole(userItem.id, Number.parseInt(value))}
                            >
                              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()} className="text-white">
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Role Management</h2>
                <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="roleName" className="text-white">
                            Role Name
                          </Label>
                          <Input
                            id="roleName"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="e.g., Project Manager"
                          />
                        </div>
                        <div>
                          <Label htmlFor="roleLevel" className="text-white">
                            Permission Level (1-10)
                          </Label>
                          <Input
                            id="roleLevel"
                            type="number"
                            min="1"
                            max="10"
                            value={newRole.level}
                            onChange={(e) => setNewRole({ ...newRole, level: Number.parseInt(e.target.value) || 1 })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="roleDescription" className="text-white">
                          Description
                        </Label>
                        <Textarea
                          id="roleDescription"
                          value={newRole.description}
                          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Describe the role responsibilities..."
                          rows={3}
                        />
                      </div>

                      <Alert className="bg-blue-900/20 border-blue-700">
                        <AlertDescription className="text-blue-400">
                          Permission levels: 1-3 (Basic), 4-6 (Team Lead), 7-8 (Manager), 9-10 (Admin)
                        </AlertDescription>
                      </Alert>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleCreateRole} className="bg-white text-black hover:bg-gray-200 flex-1">
                          Create Role
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateRoleOpen(false)}
                          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{role.name}</CardTitle>
                        <Badge
                          className={
                            role.level >= 9
                              ? "bg-red-900/30 text-red-400 border-red-400/30"
                              : role.level >= 7
                                ? "bg-orange-900/30 text-orange-400 border-orange-400/30"
                                : role.level >= 4
                                  ? "bg-blue-900/30 text-blue-400 border-blue-400/30"
                                  : "bg-gray-900/30 text-gray-400 border-gray-400/30"
                          }
                        >
                          Level {role.level}
                        </Badge>
                      </div>
                      {role.description && (
                        <CardDescription className="text-gray-400">{role.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-400">
                        Created: {new Date(role.created_at).toLocaleDateString()}
                      </div>
                      {!["admin", "manager", "member"].includes(role.name) && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
