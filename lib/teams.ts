import { sql } from "./database"
import type { Team, TeamMember } from "../types"

export async function getTeams(userId?: number): Promise<Team[]> {
  try {
    let query = `
      SELECT DISTINCT t.*
      FROM teams t
    `

    if (userId) {
      query += `
        LEFT JOIN team_members tm ON t.id = tm.team_id
        WHERE t.created_by = ${userId} OR tm.user_id = ${userId}
      `
    }

    query += ` ORDER BY t.created_at DESC`

    const result = await sql(query)
    return result as Team[]
  } catch (error) {
    console.error("Error getting teams:", error)
    return []
  }
}

export async function createTeam(team: Omit<Team, "id" | "created_at" | "updated_at">): Promise<Team | null> {
  try {
    const result = await sql`
      INSERT INTO teams (name, description, created_by)
      VALUES (${team.name}, ${team.description || null}, ${team.created_by})
      RETURNING *
    `

    // Add creator as admin of the team
    await addTeamMember(result[0].id, team.created_by, "admin")

    return result[0] as Team
  } catch (error) {
    console.error("Error creating team:", error)
    return null
  }
}

export async function getTeamMembers(teamId: number): Promise<TeamMember[]> {
  try {
    const result = await sql`
      SELECT tm.*, u.name as user_name, u.email as user_email, u.avatar_url
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${teamId}
      ORDER BY tm.joined_at ASC
    `
    return result.map((row: any) => ({
      ...row,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        avatar_url: row.avatar_url,
      },
    })) as TeamMember[]
  } catch (error) {
    console.error("Error getting team members:", error)
    return []
  }
}

export async function addTeamMember(teamId: number, userId: number, role = "member"): Promise<TeamMember | null> {
  try {
    const result = await sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${teamId}, ${userId}, ${role})
      ON CONFLICT (team_id, user_id) DO UPDATE SET role = ${role}
      RETURNING *
    `
    return result[0] as TeamMember
  } catch (error) {
    console.error("Error adding team member:", error)
    return null
  }
}

export async function removeTeamMember(teamId: number, userId: number): Promise<boolean> {
  try {
    await sql`DELETE FROM team_members WHERE team_id = ${teamId} AND user_id = ${userId}`
    return true
  } catch (error) {
    console.error("Error removing team member:", error)
    return false
  }
}

export async function getUserTeams(userId: number): Promise<Team[]> {
  try {
    const result = await sql`
      SELECT t.*
      FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ${userId}
      ORDER BY t.created_at DESC
    `
    return result as Team[]
  } catch (error) {
    console.error("Error getting user teams:", error)
    return []
  }
}
