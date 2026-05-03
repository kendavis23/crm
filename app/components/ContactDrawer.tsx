'use client'

import { useState, useTransition } from 'react'
import { createContact, updateContact } from '@/app/actions/contacts'
import type { Contact } from './ContactsClient'

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
  onClose,
}: {
  contact?: Contact
  onClose: () => void
}) {
  const isEdit = !!contact
  const [tags, setTags] = useState<string[]>(contact?.tags.map(t => t.tag) ?? [])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
            <Field label="Relationship">
              <input name="rel_type" defaultValue={contact?.rel_type ?? ''} className={inputCls} placeholder="client" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input name="email" type="email" defaultValue={contact?.email ?? ''} className={inputCls} placeholder="jane@acme.com" />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={contact?.phone ?? ''} className={inputCls} placeholder="+1 555 0100" />
            </Field>
          </div>

          <Field label="LinkedIn URL">
            <input name="linkedin" defaultValue={contact?.linkedin ?? ''} className={inputCls} placeholder="https://linkedin.com/in/..." />
          </Field>

          <Field label="Last contacted">
            <input name="last_contacted" type="date" defaultValue={contact?.last_contacted ?? ''} className={inputCls} />
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
