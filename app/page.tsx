import { createClient } from '@/lib/supabase/server'
import ContactsClient, { type Contact, type Folder } from './components/ContactsClient'

function StatCard({ label, value, sub, accent = 'indigo' }: { label: string; value: number; sub?: string; accent?: 'indigo' | 'red' | 'sky' | 'violet' }) {
  const border = { indigo: 'border-l-indigo-500', red: 'border-l-red-500',   sky: 'border-l-sky-500',    violet: 'border-l-violet-500' }[accent]
  const text   = { indigo: 'text-indigo-400',     red: 'text-red-400',        sky: 'text-sky-400',        violet: 'text-violet-400'     }[accent]
  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 border-l-4 ${border} px-5 py-4`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${text}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
    </div>
  )
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const [{ data: contactData, error }, { data: folderData }] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, company, location, title, rel_type, email, phone, linkedin, notes, last_contacted, folder_id, folders(id, name), tags(tag), skill_tags(tag), initiatives(initiative), bd_pursuits(pursuit)')
      .order('company')
      .order('name'),
    supabase.from('folders').select('id, name').order('name'),
  ])

  if (error) {
    return (
      <main className="p-8 text-red-400">
        Failed to load contacts: {error.message}
      </main>
    )
  }

  const contacts = contactData as unknown as Contact[]
  const folders  = (folderData ?? []) as Folder[]

  const total       = contacts.length
  const hsbc        = contacts.filter(c => c.company === 'HSBC').length
  const capco       = contacts.filter(c => c.company === 'Capco').length
  const influential = contacts.filter(c =>
    c.tags.some(t => t.tag === 'influential' || t.tag === 'exec')
  ).length

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Contacts</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} people across your network</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"        value={total}       accent="indigo" />
        <StatCard label="HSBC"         value={hsbc}        accent="red"    sub={`${Math.round(hsbc / total * 100)}% of network`} />
        <StatCard label="Capco"        value={capco}       accent="sky"    sub={`${Math.round(capco / total * 100)}% of network`} />
        <StatCard label="Influential"  value={influential} accent="violet" sub="exec or influential tag" />
      </div>

      <ContactsClient contacts={contacts} folders={folders} />
    </main>
  )
}
