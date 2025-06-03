import { type NextRequest, NextResponse } from "next/server"
import { createAdminRequest } from "../../../../lib/admin"
import { sendAdminRequestNotification } from "../../../../lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, name, reason } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const adminRequest = await createAdminRequest(email, name, reason)

    if (!adminRequest) {
      return NextResponse.json({ error: "Failed to create admin request" }, { status: 500 })
    }

    // Send email notification
    try {
      await sendAdminRequestNotification({
        requestId: adminRequest.id,
        requesterName: name,
        requesterEmail: email,
        reason: reason || "No reason provided",
        requestedAt: adminRequest.requested_at,
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(adminRequest)
  } catch (error) {
    console.error("Error in admin request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
