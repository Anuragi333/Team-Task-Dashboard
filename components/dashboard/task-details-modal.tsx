"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, GripVertical, User, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task, Milestone, Comment } from "../../types"

interface TaskDetailsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdateTask: (taskId: number, updates: Partial<Task>) => void
  onAddMilestone: (taskId: number, milestone: Omit<Milestone, "id" | "created_at" | "updated_at">) => void
  onUpdateMilestone: (milestoneId: number, updates: Partial<Milestone>) => void
  onDeleteMilestone: (milestoneId: number) => void
  onAddComment: (taskId: number, content: string) => void
  milestones: Milestone[]
  comments: Comment[]
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

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddComment,
  milestones,
  comments,
}: TaskDetailsModalProps) {
  const [newMilestone, setNewMilestone] = useState({ title: "", due_date: "" })
  const [newComment, setNewComment] = useState("")
  const [draggedMilestone, setDraggedMilestone] = useState<number | null>(null)

  if (!task) return null

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.due_date) return

    onAddMilestone(task.id, {
      task_id: task.id,
      title: newMilestone.title,
      completed: false,
      due_date: newMilestone.due_date,
      order_index: milestones.length,
    })
    setNewMilestone({ title: "", due_date: "" })
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    onAddComment(task.id, newComment)
    setNewComment("")
  }

  const handleDragStart = (e: React.DragEvent, milestoneId: number) => {
    setDraggedMilestone(milestoneId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetMilestoneId: number) => {
    e.preventDefault()
    if (!draggedMilestone || draggedMilestone === targetMilestoneId) return

    const draggedIndex = milestones.findIndex((m) => m.id === draggedMilestone)
    const targetIndex = milestones.findIndex((m) => m.id === targetMilestoneId)

    const newMilestones = [...milestones]
    const [draggedItem] = newMilestones.splice(draggedIndex, 1)
    newMilestones.splice(targetIndex, 0, draggedItem)

    // Update order for all affected milestones
    newMilestones.forEach((milestone, index) => {
      if (milestone.order_index !== index) {
        onUpdateMilestone(milestone.id, { order_index: index })
      }
    })

    setDraggedMilestone(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Assigned To</Label>
              <p className="text-white font-medium">{task.assigned_user?.name || "Unassigned"}</p>
            </div>
            <div>
              <Label className="text-gray-400">Due Date</Label>
              <p className="text-white font-medium">{task.due_date ? formatDate(task.due_date) : "No due date"}</p>
            </div>
            <div>
              <Label className="text-gray-400">Status</Label>
              <Badge className={`${getStatusColor(task.status)} text-sm font-medium`}>{task.status}</Badge>
            </div>
            <div>
              <Label className="text-gray-400">Priority</Label>
              <Badge className={`${getPriorityColor(task.priority)} text-sm font-medium`}>{task.priority}</Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <Label className="text-gray-400 mb-2 block">Description</Label>
              <p className="text-white bg-gray-800/50 p-3 rounded-lg">{task.description}</p>
            </div>
          )}

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
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white w-40"
                />
                <Button onClick={handleAddMilestone} size="sm" className="bg-white text-black hover:bg-gray-200">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {milestones
                .sort((a, b) => a.order_index - b.order_index)
                .map((milestone) => (
                  <div
                    key={milestone.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, milestone.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, milestone.id)}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-move"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={(checked) => onUpdateMilestone(milestone.id, { completed: !!checked })}
                      className="border-gray-600"
                    />
                    <span className={`flex-1 ${milestone.completed ? "line-through text-gray-400" : "text-white"}`}>
                      {milestone.title}
                    </span>
                    {milestone.due_date && (
                      <span className="text-gray-400 text-sm w-24">{formatDate(milestone.due_date)}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMilestone(milestone.id)}
                      className="p-1 h-auto text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label className="text-gray-400 mb-4 block">Comments</Label>

            {/* Add Comment */}
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white flex-1"
                rows={2}
              />
              <Button onClick={handleAddComment} className="bg-white text-black hover:bg-gray-200 self-end">
                <MessageSquare className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">{comment.user?.name}</span>
                    <span className="text-gray-400 text-sm">{formatDateTime(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-400 text-center py-4">No comments yet</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
