import type {CardInfo, Preferences} from './appearance.ts'

/** One policy for list, table, account details and related reminders. */
export function cardInfoFor(prefs: Preferences, mobile: boolean): CardInfo {
 return mobile && prefs.mobileInfoMode === 'custom' ? prefs.mobileCardInfo ?? prefs.cardInfo : prefs.cardInfo
}

export function visibleInfoColumns(columns: string[], info: CardInfo, authed: boolean): string[] {
 const fields: Record<string, keyof CardInfo> = {
  billing:'price', expiry:'expiry', traffic:'traffic', todayTraffic:'traffic',
  remark:'remarks', connections:'connections', uptime:'uptime',
 }
 return columns.filter(column => (!fields[column] || info[fields[column]]) && (column !== 'billing' || authed))
}
