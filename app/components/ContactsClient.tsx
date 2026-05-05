'use client'

import { useState, useMemo, useTransition } from 'react'
import { deleteContact } from '@/app/actions/contacts'
import ContactDrawer from './ContactDrawer'

type Tag        = { tag: string }
type Initiative = { initiative: string }

export type Folder = { id: string; name: string }

export type Contact = {
  id: string
  name: string
  folder_id: string | null
  folders: { id: string; name: string } | null
  company: string | null
  line_of_business: string | null
  title: string | null
  rel_type: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  notes: string | null
  last_contacted: string | null
  tags: Tag[]
  initiatives: Initiative[]
}

const TAG_COLORS: Record<string, string> = {
  buyer:       'bg-blue-900/60 text-blue-300',
  influential: 'bg-violet-900/60 text-violet-300',
  influencer:  'bg-violet-900/60 text-violet-300',
  exec:        'bg-amber-900/60 text-amber-300',
  partner:     'bg-emerald-900/60 text-emerald-300',
  worker:      'bg-slate-800 text-slate-400',
  HSBC:        'bg-red-900/60 text-red-300',
}

const COMPANY_COLORS: Record<string, string> = {
  HSBC:  'bg-red-900/40 text-red-400 ring-1 ring-red-800',
  Capco: 'bg-sky-900/40 text-sky-400 ring-1 ring-sky-800',
}

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? 'bg-slate-800 text-slate-400'
}

function companyClass(company: string | null) {
  return company && COMPANY_COLORS[company]
    ? COMPANY_COLORS[company]
    : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400'
      }`}
    >
      {label}
    </button>
  )
}

export default function ContactsClient({ contacts, folders }: { contacts: Contact[]; folders: Folder[] }) {
  const [folder, setFolder]         = useState<string | null>(null)
  const [company, setCompany]       = useState<string | null>(null)
  const [lob, setLob]               = useState<string | null>(null)
  const [initiative, setInitiative] = useState<string | null>(null)
  const [tag, setTag]               = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [deletingId, setDeletingId]         = useState<string | null>(null)
  const [deleteError, setDeleteError]       = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const allFolders = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of contacts) {
      if (c.folders) seen.set(c.folders.id, c.folders.name)
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts])

  const companies = useMemo(() => {
    const source = folder ? contacts.filter(c => c.folder_id === folder) : contacts
    return [...new Set(source.map(c => c.company).filter(Boolean))] as string[]
  }, [contacts, folder])

  const lobs = useMemo(() => {
    let source = folder ? contacts.filter(c => c.folder_id === folder) : contacts
    if (company) source = source.filter(c => c.company === company)
    return [...new Set(source.map(c => c.line_of_business).filter(Boolean))] as string[]
  }, [contacts, folder, company])

  const allInitiatives = useMemo(() => {
    let source = folder ? contacts.filter(c => c.folder_id === folder) : contacts
    if (company) source = source.filter(c => c.company === company)
    if (lob) source = source.filter(c => c.line_of_business === lob)
    return [...new Set(source.flatMap(c => c.initiatives.map(i => i.initiative)))].sort()
  }, [contacts, folder, company, lob])

  const allTags = useMemo(() => {
    let source = folder ? contacts.filter(c => c.folder_id === folder) : contacts
    if (company) source = source.filter(c => c.company === company)
    if (lob) source = source.filter(c => c.line_of_business === lob)
    return [...new Set(source.flatMap(c => c.tags.map(t => t.tag)))].sort()
  }, [contacts, folder, company, lob])

  const visibleInitiative = initiative && allInitiatives.includes(initiative) ? initiative : null
  const visibleTag        = tag && allTags.includes(tag) ? tag : null

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (folder && c.folder_id !== folder) return false
      if (company && c.company !== company) return false
      if (lob && c.line_of_business !== lob) return false
      if (visibleInitiative && !c.initiatives.some(i => i.initiative === visibleInitiative)) return false
      if (visibleTag && !c.tags.some(t => t.tag === visibleTag)) return false
      return true
    })
  }, [contacts, folder, company, lob, visibleInitiative, visibleTag])

  function handleFolder(id: string) {
    if (folder === id) { setFolder(null) } else { setFolder(id); setCompany(null); setLob(null); setInitiative(null); setTag(null) }
  }

  function handleCompany(val: string) {
    if (company === val) { setCompany(null) } else { setCompany(val); setLob(null); setInitiative(null); setTag(null) }
  }

  function openAdd() {
    setEditingContact(undefined)
    setDrawerOpen(true)
  }

  function openEdit(c: Contact) {
    setEditingContact(c)
    setDrawerOpen(true)
  }

  function handleDelete(id: string) {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteContact(id)
      if (result?.error) {
        setDeleteError(result.error)
      } else {
        setDeletingId(null)
      }
    })
  }

  const activeCount = [folder, company, lob, visibleInitiative, visibleTag].filter(Boolean).length

  return (
    <>
      {drawerOpen && (
        <ContactDrawer
          contact={editingContact}
          folders={folders}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <div className="space-y-4">
        {/* Filter bar */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filters</span>
            {activeCount > 0 && (
              <button
                onClick={() => { setFolder(null); setCompany(null); setLob(null); setInitiative(null); setTag(null) }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {allFolders.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 w-24 shrink-0">Folder</span>
              <div className="flex gap-2 flex-wrap">
                {allFolders.map(f => (
                  <FilterPill key={f.id} label={f.name} active={folder === f.id} onClick={() => handleFolder(f.id)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 w-24 shrink-0">Company</span>
            <div className="flex gap-2 flex-wrap">
              {companies.map(c => (
                <FilterPill key={c} label={c} active={company === c} onClick={() => handleCompany(c)} />
              ))}
            </div>
          </div>

          {lobs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 w-24 shrink-0">Line of business</span>
              <div className="flex gap-2 flex-wrap">
                {lobs.map(l => (
                  <FilterPill key={l} label={l} active={lob === l} onClick={() => setLob(lob === l ? null : l)} />
                ))}
              </div>
            </div>
          )}

          {allInitiatives.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 w-24 shrink-0">Initiative</span>
              <div className="flex gap-2 flex-wrap">
                {allInitiatives.map(i => (
                  <FilterPill key={i} label={i} active={visibleInitiative === i} onClick={() => setInitiative(initiative === i ? null : i)} />
                ))}
              </div>
            </div>
          )}

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 w-24 shrink-0">Tag</span>
              <div className="flex gap-2 flex-wrap">
                {allTags.map(t => (
                  <FilterPill key={t} label={t} active={visibleTag === t} onClick={() => setTag(tag === t ? null : t)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-600">
            {filtered.length} of {contacts.length} contacts
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            + Add contact
          </button>
        </div>

        {deleteError && (
          <p className="text-red-400 text-xs px-1">{deleteError}</p>
        )}

        {/* Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Folder</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Initiatives / Tags</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Notes</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-600 text-sm">
                    No contacts match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-100 whitespace-nowrap">{c.name}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {c.folders?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${companyClass(c.company)}`}>
                        {c.company}
                      </span>
                      {c.line_of_business && (
                        <span className="block text-xs text-slate-600 mt-0.5">{c.line_of_business}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-[220px] leading-snug">{c.title}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {c.initiatives.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.initiatives.map(({ initiative: i }) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-900/60 text-teal-300">
                                {i}
                              </span>
                            ))}
                          </div>
                        )}
                        {c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.tags.map(({ tag: t }) => (
                              <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagClass(t)}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">
                      {c.notes ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        {c.linkedin && (
                          <a
                            href={c.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(c)}
                          className="text-xs text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {deletingId === c.id ? (
                          <span className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={isDeleting}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeletingId(c.id)}
                            className="text-xs text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
