"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Search, Shield, BarChart3, LogOut, Loader2 } from "lucide-react"
import type { Team, User } from "../../types"

interface TeamSelectionProps {
  user: User
  onSelectTeam: (team: Team) => void
  onLogout: () => void
  onOpenAdmin: () => void
}

export function TeamSelection({ user, onSelectTeam, onLogout, onOpenAdmin }: TeamSelectionProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/teams?userId=${user.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error loading teams:", error)
      setError("Failed to load teams. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return

    setCreateLoading(true)
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTeam,
          created_by: user.id,
        }),
      })

      if (response.ok) {
        const team = await response.json()
        setTeams([team, ...teams])
        setNewTeam({ name: "", description: "" })
        setIsCreateTeamOpen(false)
      } else {
        setError("Failed to create team")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      setError("Failed to create team")
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const canCreateTeams = user.roleDetails?.level >= 6 // team_lead and above
  const canAccessAdmin = user.roleDetails?.level >= 8 // manager and above

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xl">Loading teams...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Select Team</h1>
            <div className="h-1 w-24 bg-white rounded-full"></div>
            <p className="text-gray-400 mt-2">
              Welcome back, {user.name} ({user.roleDetails?.name || "Member"})
            </p>
          </div>

          <div className="flex items-center gap-4">
            {canAccessAdmin && (
              <Button
                variant="outline"
                onClick={onOpenAdmin}
                className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onLogout}
              className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {canCreateTeams && (
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName" className="text-white">
                      Team Name
                    </Label>
                    <Input
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter team name..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamDescription" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="teamDescription"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter team description..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateTeam}
                      className="bg-white text-black hover:bg-gray-200 flex-1"
                      disabled={createLoading || !newTeam.name.trim()}
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Team"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateTeamOpen(false)}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-400">
              {error}
              <Button variant="link" onClick={loadTeams} className="ml-2 text-red-400 hover:text-red-300 p-0 h-auto">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-4">
              {searchQuery ? `No teams found for "${searchQuery}"` : "No teams available"}
            </div>
            {canCreateTeams && !searchQuery && (
              <Button onClick={() => setIsCreateTeamOpen(true)} className="bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Team
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                className="bg-gray-900/50 border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => onSelectTeam(team)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Users className="w-8 h-8 text-blue-400" />
                    <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">
                      {team.memberCount || 0} members
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl">{team.name}</CardTitle>
                  {team.description && <CardDescription className="text-gray-400">{team.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{team.taskCount || 0} tasks</span>
                    <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button className="w-full bg-white text-black hover:bg-gray-200">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
