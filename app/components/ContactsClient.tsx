'use client'

import { useState, useMemo } from 'react'

type Tag = { tag: string }

export type Contact = {
  id: string
  name: string
  company: string | null
  line_of_business: string | null
  title: string | null
  rel_type: string | null
  linkedin: string | null
  last_contacted: string | null
  tags: Tag[]
}

const TAG_COLORS: Record<string, string> = {
  buyer:       'bg-blue-100 text-blue-700',
  influential: 'bg-violet-100 text-violet-700',
  influencer:  'bg-violet-100 text-violet-700',
  exec:        'bg-amber-100 text-amber-700',
  partner:     'bg-emerald-100 text-emerald-700',
  worker:      'bg-zinc-100 text-zinc-600',
  HSBC:        'bg-red-100 text-red-700',
}

const COMPANY_COLORS: Record<string, string> = {
  HSBC:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  Capco: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
}

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? 'bg-zinc-100 text-zinc-600'
}

function companyClass(company: string | null) {
  return company && COMPANY_COLORS[company]
    ? COMPANY_COLORS[company]
    : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200'
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-zinc-900 text-white'
          : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400'
      }`}
    >
      {label}
    </button>
  )
}

export default function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const [company, setCompany]   = useState<string | null>(null)
  const [lob, setLob]           = useState<string | null>(null)
  const [tag, setTag]           = useState<string | null>(null)

  const companies = useMemo(
    () => [...new Set(contacts.map(c => c.company).filter(Boolean))] as string[],
    [contacts]
  )

  const lobs = useMemo(() => {
    const source = company ? contacts.filter(c => c.company === company) : contacts
    return [...new Set(source.map(c => c.line_of_business).filter(Boolean))] as string[]
  }, [contacts, company])

  const allTags = useMemo(
    () => [...new Set(contacts.flatMap(c => c.tags.map(t => t.tag)))].sort(),
    [contacts]
  )

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (company && c.company !== company) return false
      if (lob && c.line_of_business !== lob) return false
      if (tag && !c.tags.some(t => t.tag === tag)) return false
      return true
    })
  }, [contacts, company, lob, tag])

  function handleCompany(val: string) {
    if (company === val) {
      setCompany(null)
    } else {
      setCompany(val)
      setLob(null)
    }
  }

  function handleTag(val: string) {
    setTag(tag === val ? null : val)
  }

  const activeCount = [company, lob, tag].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-zinc-200 px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Filters</span>
          {activeCount > 0 && (
            <button
              onClick={() => { setCompany(null); setLob(null); setTag(null) }}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Company */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 w-24 shrink-0">Company</span>
          <div className="flex gap-2 flex-wrap">
            {companies.map(c => (
              <FilterPill key={c} label={c} active={company === c} onClick={() => handleCompany(c)} />
            ))}
          </div>
        </div>

        {/* Line of business — only show when options exist */}
        {lobs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 w-24 shrink-0">Line of business</span>
            <div className="flex gap-2 flex-wrap">
              {lobs.map(l => (
                <FilterPill key={l} label={l} active={lob === l} onClick={() => setLob(lob === l ? null : l)} />
              ))}
            </div>
          </div>
        )}

        {/* Tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 w-24 shrink-0">Tag</span>
          <div className="flex gap-2 flex-wrap">
            {allTags.map(t => (
              <FilterPill key={t} label={t} active={tag === t} onClick={() => handleTag(t)} />
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-400 px-1">
        {filtered.length} of {contacts.length} contacts
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Company</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Tags</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Last Contact</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-400 text-sm">
                  No contacts match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-zinc-900 whitespace-nowrap">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${companyClass(c.company)}`}>
                      {c.company}
                    </span>
                    {c.line_of_business && (
                      <span className="block text-xs text-zinc-400 mt-0.5">{c.line_of_business}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 max-w-[240px] leading-snug">{c.title}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map(({ tag: t }) => (
                        <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagClass(t)}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-xs whitespace-nowrap">
                    {c.last_contacted ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.linkedin && (
                      <a
                        href={c.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
