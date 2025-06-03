import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface AdminRequestNotification {
  requestId: number
  requesterName: string
  requesterEmail: string
  reason: string
  requestedAt: string
}

export async function sendAdminRequestNotification(data: AdminRequestNotification) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "Task Tracker <noreply@tasktracker.dev>",
      to: ["anuragiananya1@gmail.com"],
      subject: `New Admin Access Request - ${data.requesterName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              🔐 New Admin Access Request
            </h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #495057; margin-top: 0;">Request Details</h2>
              <p><strong>Name:</strong> ${data.requesterName}</p>
              <p><strong>Email:</strong> ${data.requesterEmail}</p>
              <p><strong>Request ID:</strong> #${data.requestId}</p>
              <p><strong>Requested At:</strong> ${new Date(data.requestedAt).toLocaleString()}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Reason for Access:</h3>
              <p style="color: #856404; margin-bottom: 0;">${data.reason}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Request in Admin Panel
              </a>
            </div>

            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Log into the admin panel</li>
                <li>Review the request details</li>
                <li>Approve or reject the request</li>
                <li>The requester will be notified of your decision</li>
              </ol>
              
              <p style="margin-top: 20px;">
                <em>This is an automated notification from the Task Tracker system.</em>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
New Admin Access Request

Name: ${data.requesterName}
Email: ${data.requesterEmail}
Request ID: #${data.requestId}
Requested At: ${new Date(data.requestedAt).toLocaleString()}

Reason for Access:
${data.reason}

Please log into the admin panel to review and approve/reject this request.
Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin
      `,
    })

    if (error) {
      console.error("Resend email error:", error)
      throw error
    }

    console.log("Admin request notification sent successfully:", emailData)
    return emailData
  } catch (error) {
    console.error("Failed to send admin request notification:", error)
    throw error
  }
}

export async function sendAdminRequestDecision(
  requesterEmail: string,
  requesterName: string,
  decision: "approved" | "rejected",
  reviewerName: string,
) {
  try {
    const isApproved = decision === "approved"
    const { data: emailData, error } = await resend.emails.send({
      from: "Task Tracker <noreply@tasktracker.dev>",
      to: [requesterEmail],
      subject: `Admin Access Request ${isApproved ? "Approved" : "Rejected"} - Task Tracker`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid ${isApproved ? "#28a745" : "#dc3545"}; padding-bottom: 10px;">
              ${isApproved ? "✅" : "❌"} Admin Access Request ${isApproved ? "Approved" : "Rejected"}
            </h1>
            
            <p>Hello ${requesterName},</p>
            
            <div style="background-color: ${isApproved ? "#d4edda" : "#f8d7da"}; padding: 20px; border-radius: 6px; border-left: 4px solid ${isApproved ? "#28a745" : "#dc3545"}; margin: 20px 0;">
              <p style="color: ${isApproved ? "#155724" : "#721c24"}; margin: 0; font-weight: bold;">
                Your admin access request has been ${decision} by ${reviewerName}.
              </p>
            </div>

            ${
              isApproved
                ? `
              <div style="background-color: #d1ecf1; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #0c5460; margin-top: 0;">What's Next?</h3>
                <p style="color: #0c5460;">You now have admin access to the Task Tracker system. You can:</p>
                <ul style="color: #0c5460;">
                  <li>Access the admin panel</li>
                  <li>Manage user roles and permissions</li>
                  <li>Review and approve other admin requests</li>
                  <li>Manage teams and system settings</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                   style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Access Task Tracker
                </a>
              </div>
            `
                : `
              <div style="background-color: #f8d7da; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #721c24;">
                  If you believe this decision was made in error or if you have additional information to provide, 
                  please contact the system administrator directly.
                </p>
              </div>
            `
            }

            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p><em>This is an automated notification from the Task Tracker system.</em></p>
            </div>
          </div>
        </div>
      `,
      text: `
Admin Access Request ${isApproved ? "Approved" : "Rejected"}

Hello ${requesterName},

Your admin access request has been ${decision} by ${reviewerName}.

${
  isApproved
    ? "You now have admin access to the Task Tracker system. You can log in and access the admin panel."
    : "If you believe this decision was made in error, please contact the system administrator directly."
}

Task Tracker: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
      `,
    })

    if (error) {
      console.error("Resend email error:", error)
      throw error
    }

    console.log("Admin decision notification sent successfully:", emailData)
    return emailData
  } catch (error) {
    console.error("Failed to send admin decision notification:", error)
    throw error
  }
}
