import { type NextRequest, NextResponse } from "next/server"
import { reviewAdminRequest } from "../../../../../lib/admin"
import { sendAdminRequestDecision } from "../../../../../lib/email"
import { sql } from "../../../../../lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, reviewerId } = await request.json()
    const requestId = Number.parseInt(params.id)

    if (!status || !reviewerId) {
      return NextResponse.json({ error: "Status and reviewer ID are required" }, { status: 400 })
    }

    // Get request details before updating
    const requestDetails = await sql`
      SELECT ar.*, u.name as reviewer_name
      FROM admin_requests ar
      LEFT JOIN users u ON ${reviewerId} = u.id
      WHERE ar.id = ${requestId}
    `

    if (requestDetails.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const request_data = requestDetails[0]

    const success = await reviewAdminRequest(requestId, status, reviewerId)

    if (!success) {
      return NextResponse.json({ error: "Failed to review request" }, { status: 500 })
    }

    // Send email notification to requester
    try {
      await sendAdminRequestDecision(
        request_data.email,
        request_data.name,
        status,
        request_data.reviewer_name || "System Administrator",
      )
    } catch (emailError) {
      console.error("Failed to send decision email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reviewing admin request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
