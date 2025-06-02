import { type NextRequest, NextResponse } from "next/server"
import { getTasks, createTask } from "../../../lib/tasks"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const userId = searchParams.get("userId")

    const tasks = await getTasks(
      teamId ? Number.parseInt(teamId) : undefined,
      userId ? Number.parseInt(userId) : undefined,
    )

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()

    const task = await createTask(taskData)

    if (!task) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 400 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
