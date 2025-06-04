import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, name, reason } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Create admin request
    const result = await sql`
      INSERT INTO admin_requests (email, name, reason)
      VALUES (${email}, ${name}, ${reason || null})
      RETURNING *
    `

    const adminRequest = result[0]

    // Try to send email notification using Resend
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: "Task Tracker <noreply@tasktracker.dev>",
          to: ["anuragiananya1@gmail.com"],
          subject: `New Admin Access Request - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">🔐 New Admin Access Request</h1>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #495057; margin-top: 0;">Request Details</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Request ID:</strong> #${adminRequest.id}</p>
                <p><strong>Requested At:</strong> ${new Date(adminRequest.requested_at).toLocaleString()}</p>
              </div>

              <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Reason for Access:</h3>
                <p style="color: #856404;">${reason || "No reason provided"}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Review Request in Admin Panel
                </a>
              </div>
            </div>
          `,
        })

        console.log("Admin request notification sent successfully")
      }
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
