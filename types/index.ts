export type Role = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: Role
  active: boolean
  created_at: string
}

export interface EmailTemplate {
  id: string
  user_id: string
  name: string
  subject: string
  html_content: string
  variables: string[] // extracted variable names like ['nombre', 'empresa']
  created_at: string
  updated_at: string
}

export interface ContactList {
  id: string
  user_id: string
  name: string
  file_url: string | null
  total_contacts: number
  columns: string[] // column names from uploaded CSV/XLSX
  created_at: string
}

export interface Contact {
  id: string
  list_id: string
  email: string
  data: Record<string, string> // dynamic columns
  created_at: string
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'

export interface Campaign {
  id: string
  user_id: string
  name: string
  template_id: string
  contact_list_id: string
  status: CampaignStatus
  scheduled_at: string | null
  sent_at: string | null
  from_name: string
  from_email: string
  reply_to: string | null
  total_recipients: number
  sent_count: number
  opened_count: number
  failed_count: number
  created_at: string
  updated_at: string
  // joined
  template?: EmailTemplate
  contact_list?: ContactList
}

export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'

export interface EmailLog {
  id: string
  campaign_id: string
  contact_id: string
  email: string
  status: EmailStatus
  sent_at: string | null
  opened_at: string | null
  error_message: string | null
  tracking_id: string
  created_at: string
}

export interface DashboardStats {
  total_campaigns: number
  total_sent: number
  total_opened: number
  total_failed: number
  open_rate: number
  recent_campaigns: Campaign[]
}
