import { createClient } from '@/lib/supabase/server'
import ContactsClient, { type Contact } from './components/ContactsClient'

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 px-5 py-4">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-zinc-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </div>
  )
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, company, line_of_business, title, rel_type, linkedin, last_contacted, tags(tag)')
    .order('company')
    .order('name')

  if (error) {
    return (
      <main className="p-8 text-red-600">
        Failed to load contacts: {error.message}
      </main>
    )
  }

  const contacts = data as Contact[]
  const total       = contacts.length
  const hsbc        = contacts.filter(c => c.company === 'HSBC').length
  const capco       = contacts.filter(c => c.company === 'Capco').length
  const influential = contacts.filter(c =>
    c.tags.some(t => t.tag === 'influential' || t.tag === 'exec')
  ).length

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Contacts</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{total} people across your network</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"        value={total} />
        <StatCard label="HSBC"         value={hsbc}  sub={`${Math.round(hsbc / total * 100)}% of network`} />
        <StatCard label="Capco"        value={capco} sub={`${Math.round(capco / total * 100)}% of network`} />
        <StatCard label="Influential"  value={influential} sub="exec or influential tag" />
      </div>

      <ContactsClient contacts={contacts} />
    </main>
  )
}
