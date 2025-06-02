import { type NextRequest, NextResponse } from "next/server"
import { updateTask, deleteTask } from "../../../../lib/tasks"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)
    const { userId, ...updates } = await request.json()

    const task = await updateTask(taskId, updates, userId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)
    const { userId } = await request.json()

    const success = await deleteTask(taskId, userId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete task" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
