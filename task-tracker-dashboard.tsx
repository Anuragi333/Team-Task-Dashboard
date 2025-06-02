"use client"

import type React from "react"

import { useState } from "react"
import {
  Calendar,
  CheckCircle,
  Clock,
  Play,
  User,
  Plus,
  X,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  GripVertical,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Milestone {
  id: number
  title: string
  completed: boolean
  dueDate: string
  order: number
}

interface Task {
  id: number
  title: string
  status: "Not Started" | "In Progress" | "Completed"
  assignedTo: string
  dueDate: string
  priority: "High" | "Medium" | "Low"
  comments: string
  milestones: Milestone[]
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Redesign User Authentication Flow",
    status: "In Progress",
    assignedTo: "Ananya Anuragi",
    dueDate: "2024-01-15",
    priority: "High",
    comments: "Working on the wireframes. Need to review with UX team by Friday.",
    milestones: [
      { id: 1, title: "Complete wireframes", completed: true, dueDate: "2024-01-10", order: 1 },
      { id: 2, title: "UX team review", completed: false, dueDate: "2024-01-12", order: 2 },
      { id: 3, title: "Development implementation", completed: false, dueDate: "2024-01-15", order: 3 },
    ],
  },
  {
    id: 2,
    title: "Database Migration to PostgreSQL",
    status: "Not Started",
    assignedTo: "Jaykumar Wadia",
    dueDate: "2024-01-20",
    priority: "Medium",
    comments: "Waiting for infrastructure team approval. Migration scripts are ready.",
    milestones: [
      { id: 4, title: "Backup current database", completed: false, dueDate: "2024-01-18", order: 1 },
      { id: 5, title: "Run migration scripts", completed: false, dueDate: "2024-01-19", order: 2 },
      { id: 6, title: "Verify data integrity", completed: false, dueDate: "2024-01-20", order: 3 },
    ],
  },
]

const teamMembers = ["Ananya Anuragi", "Jaykumar Wadia", "Pragati Jain", "Vinit Jogi"]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "In Progress":
      return <Play className="w-4 h-4 text-blue-400" />
    case "Not Started":
      return <Clock className="w-4 h-4 text-gray-400" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-900/30 text-green-400 border-green-400/30"
    case "In Progress":
      return "bg-blue-900/30 text-blue-400 border-blue-400/30"
    case "Not Started":
      return "bg-gray-800/50 text-gray-400 border-gray-400/30"
    default:
      return "bg-gray-800/50 text-gray-400 border-gray-400/30"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-900/30 text-red-400 border-red-400/30"
    case "Medium":
      return "bg-yellow-900/30 text-yellow-400 border-yellow-400/30"
    case "Low":
      return "bg-green-900/30 text-green-400 border-green-400/30"
    default:
      return "bg-gray-800/50 text-gray-400 border-gray-400/30"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showCompleted, setShowCompleted] = useState(true)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium" as Task["priority"],
  })
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "" })
  const [draggedMilestone, setDraggedMilestone] = useState<number | null>(null)

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase()
    return task.title.toLowerCase().includes(query) || task.assignedTo.toLowerCase().includes(query)
  })

  const activeTasks = filteredTasks.filter((task) => task.status !== "Completed")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")
  const displayTasks = showCompleted ? filteredTasks : activeTasks

  const addTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) return

    const task: Task = {
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      title: newTask.title,
      status: "Not Started",
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      comments: "",
      milestones: [],
    }

    setTasks([...tasks, task])
    setNewTask({ title: "", assignedTo: "", dueDate: "", priority: "Medium" })
    setIsAddTaskOpen(false)
  }

  const updateTaskStatus = (taskId: number, newStatus: Task["status"]) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const updateTaskComments = (taskId: number, comments: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, comments } : task)))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, comments })
    }
  }

  const addMilestone = (taskId: number) => {
    if (!newMilestone.title || !newMilestone.dueDate) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const milestone: Milestone = {
      id: Math.max(...task.milestones.map((m) => m.id), 0) + 1,
      title: newMilestone.title,
      completed: false,
      dueDate: newMilestone.dueDate,
      order: task.milestones.length + 1,
    }

    const updatedTask = {
      ...task,
      milestones: [...task.milestones, milestone],
    }

    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask)
    }
    setNewMilestone({ title: "", dueDate: "" })
  }

  const toggleMilestone = (taskId: number, milestoneId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = {
      ...task,
      milestones: task.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m)),
    }

    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask)
    }
  }

  const deleteMilestone = (taskId: number, milestoneId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = {
      ...task,
      milestones: task.milestones.filter((m) => m.id !== milestoneId),
    }

    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask)
    }
  }

  const handleDragStart = (e: React.DragEvent, milestoneId: number) => {
    setDraggedMilestone(milestoneId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetMilestoneId: number, taskId: number) => {
    e.preventDefault()
    if (!draggedMilestone || draggedMilestone === targetMilestoneId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const draggedIndex = task.milestones.findIndex((m) => m.id === draggedMilestone)
    const targetIndex = task.milestones.findIndex((m) => m.id === targetMilestoneId)

    const newMilestones = [...task.milestones]
    const [draggedItem] = newMilestones.splice(draggedIndex, 1)
    newMilestones.splice(targetIndex, 0, draggedItem)

    // Update order
    const updatedMilestones = newMilestones.map((milestone, index) => ({
      ...milestone,
      order: index + 1,
    }))

    const updatedTask = { ...task, milestones: updatedMilestones }
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask)
    }
    setDraggedMilestone(null)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Team Task Tracker</h1>
            <div className="h-1 w-24 bg-white rounded-full"></div>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle Completed Tasks */}
            <Button
              variant="outline"
              onClick={() => setShowCompleted(!showCompleted)}
              className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800"
            >
              {showCompleted ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showCompleted ? "Hide" : "Show"} Completed ({completedTasks.length})
            </Button>

            {/* Add New Task */}
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
                    <Label htmlFor="assignedTo" className="text-white">
                      Assigned To
                    </Label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member} className="text-white">
                            {member}
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
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
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
                    <Button onClick={addTask} className="bg-white text-black hover:bg-gray-200 flex-1">
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

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tasks or team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayTasks.map((task) => (
          <Card
            key={task.id}
            className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">{task.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={`${getPriorityColor(task.priority)} text-xs font-medium shrink-0`}>
                    {task.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <Select value={task.status} onValueChange={(value: Task["status"]) => updateTaskStatus(task.id, value)}>
                  <SelectTrigger
                    className={`${getStatusColor(task.status)} text-sm font-medium border-0 h-auto p-1 px-2`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Not Started" className="text-white">
                      Not Started
                    </SelectItem>
                    <SelectItem value="In Progress" className="text-white">
                      In Progress
                    </SelectItem>
                    <SelectItem value="Completed" className="text-white">
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="flex items-center gap-3 text-gray-300">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{task.assignedTo}</span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{formatDate(task.dueDate)}</span>
              </div>

              {/* Milestones Progress */}
              {task.milestones.length > 0 && (
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {task.milestones.filter((m) => m.completed).length}/{task.milestones.length} milestones
                  </span>
                </div>
              )}

              {/* Details Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                    className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                  {selectedTask && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">{selectedTask.title}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Task Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-400">Assigned To</Label>
                            <p className="text-white font-medium">{selectedTask.assignedTo}</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Due Date</Label>
                            <p className="text-white font-medium">{formatDate(selectedTask.dueDate)}</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Status</Label>
                            <Badge className={`${getStatusColor(selectedTask.status)} text-sm font-medium`}>
                              {selectedTask.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-gray-400">Priority</Label>
                            <Badge className={`${getPriorityColor(selectedTask.priority)} text-sm font-medium`}>
                              {selectedTask.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Comments */}
                        <div>
                          <Label className="text-gray-400 mb-2 block">Latest Comments & Remarks</Label>
                          <Textarea
                            value={selectedTask.comments}
                            onChange={(e) => updateTaskComments(selectedTask.id, e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                            placeholder="Add comments and remarks..."
                          />
                        </div>

                        {/* Milestones */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <Label className="text-gray-400">Milestones</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Milestone title"
                                value={newMilestone.title}
                                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                className="bg-gray-800 border-gray-600 text-white w-48"
                              />
                              <Input
                                type="date"
                                value={newMilestone.dueDate}
                                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                className="bg-gray-800 border-gray-600 text-white w-40"
                              />
                              <Button
                                onClick={() => addMilestone(selectedTask.id)}
                                size="sm"
                                className="bg-white text-black hover:bg-gray-200"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {selectedTask.milestones
                              .sort((a, b) => a.order - b.order)
                              .map((milestone) => (
                                <div
                                  key={milestone.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, milestone.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, milestone.id, selectedTask.id)}
                                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-move"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <Checkbox
                                    checked={milestone.completed}
                                    onCheckedChange={() => toggleMilestone(selectedTask.id, milestone.id)}
                                    className="border-gray-600"
                                  />
                                  <span
                                    className={`flex-1 ${milestone.completed ? "line-through text-gray-400" : "text-white"}`}
                                  >
                                    {milestone.title}
                                  </span>
                                  <span className="text-gray-400 text-sm w-24">{formatDate(milestone.dueDate)}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteMilestone(selectedTask.id, milestone.id)}
                                    className="p-1 h-auto text-gray-400 hover:text-red-400"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {displayTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {searchQuery ? `No tasks found for "${searchQuery}"` : showCompleted ? "No tasks found" : "No active tasks"}
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
          <div className="text-gray-300 text-sm font-medium">{searchQuery ? "Filtered Tasks" : "Total Tasks"}</div>
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
    </div>
  )
}
