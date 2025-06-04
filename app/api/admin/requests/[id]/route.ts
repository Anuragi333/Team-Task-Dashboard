import { type NextRequest, NextResponse } from "next/server"
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

    // Update the request
    await sql`
      UPDATE admin_requests 
      SET status = ${status}, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ${reviewerId}
      WHERE id = ${requestId}
    `

    // Try to send email notification to requester
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const isApproved = status === "approved"
        await resend.emails.send({
          from: "Task Tracker <noreply@tasktracker.dev>",
          to: [request_data.email],
          subject: `Admin Access Request ${isApproved ? "Approved" : "Rejected"} - Task Tracker`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">
                ${isApproved ? "✅" : "❌"} Admin Access Request ${isApproved ? "Approved" : "Rejected"}
              </h1>
              
              <p>Hello ${request_data.name},</p>
              
              <div style="background-color: ${isApproved ? "#d4edda" : "#f8d7da"}; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="color: ${isApproved ? "#155724" : "#721c24"}; margin: 0; font-weight: bold;">
                  Your admin access request has been ${status} by ${request_data.reviewer_name || "System Administrator"}.
                </p>
              </div>

              ${
                isApproved
                  ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                     style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Access Task Tracker
                  </a>
                </div>
              `
                  : ""
              }
            </div>
          `,
        })
      }
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
