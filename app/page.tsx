"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "../components/auth/login-form"
import { RegisterForm } from "../components/auth/register-form"
import { TaskCard } from "../components/dashboard/task-card"
import { TaskDetailsModal } from "../components/dashboard/task-details-modal"
import { AnalyticsDashboard } from "../components/dashboard/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, EyeOff, LogOut, BarChart3 } from "lucide-react"
import type { Task, Milestone, Comment, User } from "../types"

export default function TaskTracker() {
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "Medium" as Task["priority"],
  })

  // Mock team members - in real app, this would come from API
  const teamMembers = [
    { id: 1, name: "Ananya Anuragi", email: "ananya@example.com" },
    { id: 2, name: "Jaykumar Wadia", email: "jay@example.com" },
    { id: 3, name: "Pragati Jain", email: "pragati@example.com" },
    { id: 4, name: "Vinit Jogi", email: "vinit@example.com" },
  ]

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const handleRegister = async (email: string, name: string, password: string, role: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const handleLogout = () => {
    setUser(null)
    setTasks([])
    setSelectedTask(null)
    setActiveTab("dashboard")
  }

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
    }
  }

  const loadMilestones = async (taskId: number) => {
    try {
      const response = await fetch(`/api/milestones?taskId=${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setMilestones(data)
      }
    } catch (error) {
      console.error("Error loading milestones:", error)
    }
  }

  const loadComments = async (taskId: number) => {
    try {
      const response = await fetch(`/api/comments?taskId=${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title || !user) return

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          created_by: user.id,
          team_id: 1, // Default team - in real app, user would select
          assigned_to: newTask.assigned_to ? Number.parseInt(newTask.assigned_to) : null,
        }),
      })

      if (response.ok) {
        const task = await response.json()
        setTasks([task, ...tasks])
        setNewTask({
          title: "",
          description: "",
          assigned_to: "",
          due_date: "",
          priority: "Medium",
        })
        setIsAddTaskOpen(false)
      }
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: number, status: Task["status"]) => {
    if (!user) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          userId: user.id,
          completed_at: status === "Completed" ? new Date().toISOString() : null,
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)))
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask)
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!user) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== taskId))
        if (selectedTask?.id === taskId) {
          setSelectedTask(null)
          setIsDetailsOpen(false)
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleViewDetails = async (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
    await loadMilestones(task.id)
    await loadComments(task.id)
  }

  const handleAddMilestone = async (taskId: number, milestone: Omit<Milestone, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(milestone),
      })

      if (response.ok) {
        const newMilestone = await response.json()
        setMilestones([...milestones, newMilestone])
      }
    } catch (error) {
      console.error("Error adding milestone:", error)
    }
  }

  const handleUpdateMilestone = async (milestoneId: number, updates: Partial<Milestone>) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedMilestone = await response.json()
        setMilestones(milestones.map((m) => (m.id === milestoneId ? updatedMilestone : m)))
      }
    } catch (error) {
      console.error("Error updating milestone:", error)
    }
  }

  const handleDeleteMilestone = async (milestoneId: number) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMilestones(milestones.filter((m) => m.id !== milestoneId))
      }
    } catch (error) {
      console.error("Error deleting milestone:", error)
    }
  }

  const handleAddComment = async (taskId: number, content: string) => {
    if (!user) return

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          user_id: user.id,
          content,
        }),
      })

      if (response.ok) {
        const newComment = await response.json()
        setComments([newComment, ...comments])
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase()
    return task.title.toLowerCase().includes(query) || (task.assigned_user?.name.toLowerCase().includes(query) ?? false)
  })

  const activeTasks = filteredTasks.filter((task) => task.status !== "Completed")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")
  const displayTasks = showCompleted ? filteredTasks : activeTasks

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Team Task Tracker</h1>
              <div className="h-1 w-24 bg-white rounded-full"></div>
              <p className="text-gray-400 mt-2">Welcome back, {user.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <TabsList className="bg-gray-900/50 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="dashboard" className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks or team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
                >
                  {showCompleted ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showCompleted ? "Hide" : "Show"} Completed ({completedTasks.length})
                </Button>

                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-white">
                          Task Title
                        </Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Enter task title..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-white">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Enter task description..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="assignedTo" className="text-white">
                          Assigned To
                        </Label>
                        <Select
                          value={newTask.assigned_to}
                          onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id.toString()} className="text-white">
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dueDate" className="text-white">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="priority" className="text-white">
                          Priority
                        </Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: Task["priority"]) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="High" className="text-white">
                              High
                            </SelectItem>
                            <SelectItem value="Medium" className="text-white">
                              Medium
                            </SelectItem>
                            <SelectItem value="Low" className="text-white">
                              Low
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddTask} className="bg-white text-black hover:bg-gray-200 flex-1">
                          Add Task
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddTaskOpen(false)}
                          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleUpdateTaskStatus}
                  onDelete={handleDeleteTask}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Empty State */}
            {displayTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  {searchQuery
                    ? `No tasks found for "${searchQuery}"`
                    : showCompleted
                      ? "No tasks found"
                      : "No active tasks"}
                </div>
                {!searchQuery && (
                  <Button onClick={() => setIsAddTaskOpen(true)} className="bg-white text-black hover:bg-gray-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Task
                  </Button>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{filteredTasks.length}</div>
                <div className="text-gray-300 text-sm font-medium">
                  {searchQuery ? "Filtered Tasks" : "Total Tasks"}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {filteredTasks.filter((task) => task.status === "Completed").length}
                </div>
                <div className="text-gray-300 text-sm font-medium">Completed</div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {filteredTasks.filter((task) => task.status === "In Progress").length}
                </div>
                <div className="text-gray-300 text-sm font-medium">In Progress</div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  {filteredTasks.filter((task) => task.status === "Not Started").length}
                </div>
                <div className="text-gray-300 text-sm font-medium">Not Started</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard userId={user.id} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdateTask={(taskId, updates) => handleUpdateTaskStatus(taskId, updates.status!)}
        onAddMilestone={handleAddMilestone}
        onUpdateMilestone={handleUpdateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onAddComment={handleAddComment}
        milestones={milestones}
        comments={comments}
      />
    </div>
  )
}
