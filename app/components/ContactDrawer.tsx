'use client'

import { useState, useTransition } from 'react'
import { createContact, updateContact } from '@/app/actions/contacts'
import { createFolder } from '@/app/actions/folders'
import type { Contact, Folder } from './ContactsClient'

const inputCls = 'w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}

export default function ContactDrawer({
  contact,
  folders,
  onClose,
}: {
  contact?: Contact
  folders: Folder[]
  onClose: () => void
}) {
  const isEdit = !!contact
  const [initiatives, setInitiatives] = useState<string[]>(contact?.initiatives.map(i => i.initiative) ?? [])
  const [initiativeInput, setInitiativeInput] = useState('')
  const [tags, setTags] = useState<string[]>(contact?.tags.map(t => t.tag) ?? [])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [localFolders, setLocalFolders] = useState<Folder[]>(folders)
  const [selectedFolderId, setSelectedFolderId] = useState<string>(contact?.folder_id ?? '')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, startFolderTransition] = useTransition()

  function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    startFolderTransition(async () => {
      const result = await createFolder(name)
      if ('error' in result) { setError(result.error); return }
      setLocalFolders(prev => [...prev, result].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedFolderId(result.id)
      setShowNewFolder(false)
      setNewFolderName('')
    })
  }

  function commitInitiative() {
    const val = initiativeInput.trim().toLowerCase()
    if (val && !initiatives.includes(val)) setInitiatives(prev => [...prev, val])
    setInitiativeInput('')
  }

  function handleInitiativeKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitInitiative()
    }
  }

  function commitTag() {
    const val = tagInput.trim().toLowerCase()
    if (val && !tags.includes(val)) setTags(prev => [...prev, val])
    setTagInput('')
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    }
  }

  function handleAction(formData: FormData) {
    formData.set('initiatives', initiatives.join(','))
    formData.set('tags', tags.join(','))
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateContact(contact.id, formData)
        : await createContact(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-sm font-semibold text-slate-100">
            {isEdit ? 'Edit contact' : 'Add contact'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form body */}
        <form action={handleAction} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Name *">
            <input
              name="name"
              defaultValue={contact?.name}
              required
              className={inputCls}
              placeholder="Jane Smith"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input name="company" defaultValue={contact?.company ?? ''} className={inputCls} placeholder="Acme Corp" />
            </Field>
            <Field label="Line of business">
              <input name="line_of_business" defaultValue={contact?.line_of_business ?? ''} className={inputCls} placeholder="Sales" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input name="title" defaultValue={contact?.title ?? ''} className={inputCls} placeholder="VP Engineering" />
            </Field>
            <Field label="Scope">
              <input name="rel_type" defaultValue={contact?.rel_type ?? ''} className={inputCls} placeholder="e.g. Global, APAC, Enterprise" />
            </Field>
          </div>

          <Field label="Folder">
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  name="folder_id"
                  value={selectedFolderId}
                  onChange={e => setSelectedFolderId(e.target.value)}
                  className={`${inputCls} flex-1`}
                >
                  <option value="">— No folder —</option>
                  {localFolders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {!showNewFolder && (
                  <button
                    type="button"
                    onClick={() => setShowNewFolder(true)}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs whitespace-nowrap transition-colors cursor-pointer"
                  >
                    + New
                  </button>
                )}
              </div>
              {showNewFolder && (
                <div className="flex gap-2">
                  <input
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateFolder() } }}
                    className={`${inputCls} flex-1`}
                    placeholder="Folder name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || isCreatingFolder}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingFolder ? '…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewFolder(false); setNewFolderName('') }}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Field>

          <Field label="LinkedIn URL">
            <input name="linkedin" defaultValue={contact?.linkedin ?? ''} className={inputCls} placeholder="https://linkedin.com/in/..." />
          </Field>

          <Field label="Initiatives">
            <div className="space-y-2">
              {initiatives.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {initiatives.map(i => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-900/60 text-teal-300 border border-teal-800"
                    >
                      {i}
                      <button
                        type="button"
                        onClick={() => setInitiatives(initiatives.filter(x => x !== i))}
                        className="text-teal-500 hover:text-teal-200 leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={initiativeInput}
                onChange={e => setInitiativeInput(e.target.value)}
                onKeyDown={handleInitiativeKey}
                onBlur={commitInitiative}
                className={inputCls}
                placeholder="Type an initiative and press Enter"
              />
            </div>
          </Field>

          <Field label="Tags">
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter(x => x !== t))}
                        className="text-slate-500 hover:text-slate-200 leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={commitTag}
                className={inputCls}
                placeholder="Type a tag and press Enter"
              />
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              name="notes"
              defaultValue={contact?.notes ?? ''}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Any notes…"
            />
          </Field>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
