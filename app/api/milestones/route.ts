import { type NextRequest, NextResponse } from "next/server"
import { getMilestones, createMilestone } from "../../../lib/tasks"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const milestones = await getMilestones(Number.parseInt(taskId))
    return NextResponse.json(milestones)
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const milestoneData = await request.json()

    const milestone = await createMilestone(milestoneData)

    if (!milestone) {
      return NextResponse.json({ error: "Failed to create milestone" }, { status: 400 })
    }

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
