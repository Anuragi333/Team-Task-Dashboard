import { sql } from "./database"

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  notStartedTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime: number
}

export interface TeamAnalytics {
  teamId: number
  teamName: string
  memberCount: number
  taskCount: number
  completionRate: number
  mostActiveUser: string
}

export interface UserAnalytics {
  userId: number
  userName: string
  assignedTasks: number
  completedTasks: number
  completionRate: number
  averageCompletionTime: number
}

export async function getTaskAnalytics(teamId?: number, userId?: number): Promise<TaskAnalytics> {
  try {
    let result

    if (teamId) {
      result = await sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'Not Started' THEN 1 END) as not_started_tasks,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'Completed' THEN 1 END) as overdue_tasks,
          AVG(CASE 
            WHEN completed_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400 
          END) as avg_completion_days
        FROM tasks
        WHERE team_id = ${teamId}
      `
    } else if (userId) {
      result = await sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'Not Started' THEN 1 END) as not_started_tasks,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'Completed' THEN 1 END) as overdue_tasks,
          AVG(CASE 
            WHEN completed_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400 
          END) as avg_completion_days
        FROM tasks
        WHERE assigned_to = ${userId} OR created_by = ${userId}
      `
    } else {
      result = await sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'Not Started' THEN 1 END) as not_started_tasks,
          COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'Completed' THEN 1 END) as overdue_tasks,
          AVG(CASE 
            WHEN completed_at IS NOT NULL AND created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400 
          END) as avg_completion_days
        FROM tasks
      `
    }

    const data = result[0]
    const completionRate = data.total_tasks > 0 ? (data.completed_tasks / data.total_tasks) * 100 : 0

    return {
      totalTasks: Number.parseInt(data.total_tasks),
      completedTasks: Number.parseInt(data.completed_tasks),
      inProgressTasks: Number.parseInt(data.in_progress_tasks),
      notStartedTasks: Number.parseInt(data.not_started_tasks),
      overdueTasks: Number.parseInt(data.overdue_tasks),
      completionRate: Math.round(completionRate),
      averageCompletionTime: Math.round(data.avg_completion_days || 0),
    }
  } catch (error) {
    console.error("Error getting task analytics:", error)
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
    }
  }
}

export async function getTeamAnalytics(): Promise<TeamAnalytics[]> {
  try {
    const result = await sql`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(DISTINCT tm.user_id) as member_count,
        COUNT(DISTINCT ta.id) as task_count,
        COALESCE(
          (COUNT(CASE WHEN ta.status = 'Completed' THEN 1 END) * 100.0 / NULLIF(COUNT(ta.id), 0)), 
          0
        ) as completion_rate,
        u.name as most_active_user
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN tasks ta ON t.id = ta.team_id
      LEFT JOIN (
        SELECT 
          team_id,
          assigned_to,
          COUNT(*) as task_count,
          ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY COUNT(*) DESC) as rn
        FROM tasks
        WHERE assigned_to IS NOT NULL
        GROUP BY team_id, assigned_to
      ) most_active ON t.id = most_active.team_id AND most_active.rn = 1
      LEFT JOIN users u ON most_active.assigned_to = u.id
      GROUP BY t.id, t.name, u.name
      ORDER BY task_count DESC
    `

    return result.map((row: any) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      memberCount: Number.parseInt(row.member_count),
      taskCount: Number.parseInt(row.task_count),
      completionRate: Math.round(row.completion_rate),
      mostActiveUser: row.most_active_user || "N/A",
    }))
  } catch (error) {
    console.error("Error getting team analytics:", error)
    return []
  }
}

export async function getUserAnalytics(teamId?: number): Promise<UserAnalytics[]> {
  try {
    let result

    if (teamId) {
      result = await sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COUNT(t.id) as assigned_tasks,
          COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks,
          COALESCE(
            (COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0)), 
            0
          ) as completion_rate,
          AVG(CASE 
            WHEN t.completed_at IS NOT NULL AND t.created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 86400 
          END) as avg_completion_days
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        WHERE t.team_id = ${teamId}
        GROUP BY u.id, u.name
        HAVING COUNT(t.id) > 0
        ORDER BY assigned_tasks DESC
      `
    } else {
      result = await sql`
        SELECT 
          u.id as user_id,
          u.name as user_name,
          COUNT(t.id) as assigned_tasks,
          COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks,
          COALESCE(
            (COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0)), 
            0
          ) as completion_rate,
          AVG(CASE 
            WHEN t.completed_at IS NOT NULL AND t.created_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 86400 
          END) as avg_completion_days
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        GROUP BY u.id, u.name
        HAVING COUNT(t.id) > 0
        ORDER BY assigned_tasks DESC
      `
    }

    return result.map((row: any) => ({
      userId: row.user_id,
      userName: row.user_name,
      assignedTasks: Number.parseInt(row.assigned_tasks),
      completedTasks: Number.parseInt(row.completed_tasks),
      completionRate: Math.round(row.completion_rate),
      averageCompletionTime: Math.round(row.avg_completion_days || 0),
    }))
  } catch (error) {
    console.error("Error getting user analytics:", error)
    return []
  }
}
