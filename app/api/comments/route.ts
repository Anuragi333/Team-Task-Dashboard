import { type NextRequest, NextResponse } from "next/server"
import { getComments, createComment } from "../../../lib/tasks"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const comments = await getComments(Number.parseInt(taskId))
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json()

    const comment = await createComment(commentData)

    if (!comment) {
      return NextResponse.json({ error: "Failed to create comment" }, { status: 400 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
