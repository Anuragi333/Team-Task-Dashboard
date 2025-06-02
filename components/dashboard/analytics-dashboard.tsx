"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TaskAnalytics, TeamAnalytics, UserAnalytics } from "../../lib/analytics"

interface AnalyticsDashboardProps {
  teamId?: number
  userId?: number
}

export function AnalyticsDashboard({ teamId, userId }: AnalyticsDashboardProps) {
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics | null>(null)
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics[]>([])
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [teamId, userId])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load task analytics
      const taskResponse = await fetch(
        `/api/analytics/tasks?${teamId ? `teamId=${teamId}` : userId ? `userId=${userId}` : ""}`,
      )
      if (taskResponse.ok) {
        const taskData = await taskResponse.json()
        setTaskAnalytics(taskData)
      }

      // Load team analytics (only if not filtering by specific user)
      if (!userId) {
        const teamResponse = await fetch("/api/analytics/teams")
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamAnalytics(teamData)
        }
      }

      // Load user analytics
      const userResponse = await fetch(`/api/analytics/users${teamId ? `?teamId=${teamId}` : ""}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserAnalytics(userData)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Analytics */}
      {taskAnalytics && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Task Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{taskAnalytics.totalTasks}</div>
                <div className="text-gray-300 text-sm font-medium">Total Tasks</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{taskAnalytics.completedTasks}</div>
                <div className="text-gray-300 text-sm font-medium">Completed</div>
                <Badge className="bg-green-900/30 text-green-400 border-green-400/30 text-xs mt-1">
                  {taskAnalytics.completionRate}%
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{taskAnalytics.inProgressTasks}</div>
                <div className="text-gray-300 text-sm font-medium">In Progress</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">{taskAnalytics.overdueTasks}</div>
                <div className="text-gray-300 text-sm font-medium">Overdue</div>
                {taskAnalytics.averageCompletionTime > 0 && (
                  <div className="text-gray-400 text-xs mt-1">Avg: {taskAnalytics.averageCompletionTime} days</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Team Analytics */}
      {teamAnalytics.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Team Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamAnalytics.map((team) => (
              <Card key={team.teamId} className="bg-gray-900/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{team.teamName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members:</span>
                    <span className="text-white">{team.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tasks:</span>
                    <span className="text-white">{team.taskCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion:</span>
                    <Badge className="bg-green-900/30 text-green-400 border-green-400/30">{team.completionRate}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Top Performer:</span>
                    <span className="text-white text-sm">{team.mostActiveUser}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* User Analytics */}
      {userAnalytics.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Individual Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAnalytics.slice(0, 6).map((user) => (
              <Card key={user.userId} className="bg-gray-900/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{user.userName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned:</span>
                    <span className="text-white">{user.assignedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">{user.completedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate:</span>
                    <Badge className="bg-blue-900/30 text-blue-400 border-blue-400/30">{user.completionRate}%</Badge>
                  </div>
                  {user.averageCompletionTime > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Time:</span>
                      <span className="text-white text-sm">{user.averageCompletionTime} days</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
