import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractVariables(htmlContent: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const vars = new Set<string>()
  let match
  while ((match = regex.exec(htmlContent)) !== null) {
    vars.add(match[1])
  }
  return Array.from(vars)
}

export function replaceVariables(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`)
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function generateTrackingId(): string {
  return crypto.randomUUID()
}

export function buildTrackingPixelUrl(trackingId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_TRACKING_URL || process.env.NEXT_PUBLIC_APP_URL
  return `${baseUrl}/api/track/${trackingId}/open`
}

export function injectTrackingPixel(html: string, trackingId: string): string {
  const pixel = `<img src="${buildTrackingPixelUrl(trackingId)}" width="1" height="1" style="display:none;" alt="" />`
  return html.replace(/<\/body>/i, `${pixel}</body>`) || html + pixel
}
