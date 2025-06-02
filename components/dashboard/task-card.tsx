"use client"

import { Calendar, CheckCircle, Clock, Play, User, X, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "../../types"

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: number, status: Task["status"]) => void
  onDelete: (taskId: number) => void
  onViewDetails: (task: Task) => void
}

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

export function TaskCard({ task, onStatusChange, onDelete, onViewDetails }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "Completed"

  return (
    <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">{task.title}</h3>
          <div className="flex items-center gap-2">
            <Badge className={`${getPriorityColor(task.priority)} text-xs font-medium shrink-0`}>{task.priority}</Badge>
            {isOverdue && (
              <Badge className="bg-red-900/30 text-red-400 border-red-400/30 text-xs font-medium">Overdue</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
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
          <Select value={task.status} onValueChange={(value: Task["status"]) => onStatusChange(task.id, value)}>
            <SelectTrigger className={`${getStatusColor(task.status)} text-sm font-medium border-0 h-auto p-1 px-2`}>
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
        {task.assigned_user && (
          <div className="flex items-center gap-3 text-gray-300">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{task.assigned_user.name}</span>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${isOverdue ? "text-red-400" : ""}`}>
              {formatDate(task.due_date)}
            </span>
          </div>
        )}

        {/* Milestones Progress */}
        {task.milestones && task.milestones.length > 0 && (
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">
              {task.milestones.filter((m) => m.completed).length}/{task.milestones.length} milestones
            </span>
          </div>
        )}

        {/* Details Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(task)}
          className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
