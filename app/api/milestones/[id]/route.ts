import { type NextRequest, NextResponse } from "next/server"
import { updateMilestone, deleteMilestone } from "../../../../lib/tasks"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const milestoneId = Number.parseInt(params.id)
    const updates = await request.json()

    const milestone = await updateMilestone(milestoneId, updates)

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const milestoneId = Number.parseInt(params.id)

    const success = await deleteMilestone(milestoneId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete milestone" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting milestone:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
