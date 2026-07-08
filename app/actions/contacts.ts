'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

function parseContact(formData: FormData) {
  return {
    name:             (formData.get('name')             as string)?.trim() || null,
    folder_id:        (formData.get('folder_id')        as string)?.trim() || null,
    company:          (formData.get('company')          as string)?.trim() || null,
    location:         (formData.get('location')         as string)?.trim() || null,
    title:            (formData.get('title')            as string)?.trim() || null,
    rel_type:         (formData.get('rel_type')         as string)?.trim() || null,
    linkedin:         (formData.get('linkedin')         as string)?.trim() || null,
    notes:            (formData.get('notes')            as string)?.trim() || null,
  }
}

function parseTags(formData: FormData): string[] {
  const raw = (formData.get('tags') as string) ?? ''
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}

function parseSkillTags(formData: FormData): string[] {
  const raw = (formData.get('skill_tags') as string) ?? ''
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}

function parseInitiatives(formData: FormData): string[] {
  const raw = (formData.get('initiatives') as string) ?? ''
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}

export async function createContact(formData: FormData): Promise<{ error?: string }> {
  const contact = parseContact(formData)
  if (!contact.name) return { error: 'Name is required' }

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('contacts').insert(contact).select('id').single()
  if (error) return { error: error.message }

  const tags = parseTags(formData)
  if (tags.length > 0) {
    await supabase.from('tags').insert(tags.map(tag => ({ contact_id: data.id, tag })))
  }

  const skillTags = parseSkillTags(formData)
  if (skillTags.length > 0) {
    await supabase.from('skill_tags').insert(skillTags.map(tag => ({ contact_id: data.id, tag })))
  }

  const initiatives = parseInitiatives(formData)
  if (initiatives.length > 0) {
    await supabase.from('initiatives').insert(initiatives.map(initiative => ({ contact_id: data.id, initiative })))
  }

  revalidatePath('/')
  return {}
}

export async function updateContact(id: string, formData: FormData): Promise<{ error?: string }> {
  const contact = parseContact(formData)
  if (!contact.name) return { error: 'Name is required' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('contacts').update(contact).eq('id', id)
  if (error) return { error: error.message }

  await supabase.from('tags').delete().eq('contact_id', id)
  const tags = parseTags(formData)
  if (tags.length > 0) {
    await supabase.from('tags').insert(tags.map(tag => ({ contact_id: id, tag })))
  }

  await supabase.from('skill_tags').delete().eq('contact_id', id)
  const skillTags = parseSkillTags(formData)
  if (skillTags.length > 0) {
    await supabase.from('skill_tags').insert(skillTags.map(tag => ({ contact_id: id, tag })))
  }

  await supabase.from('initiatives').delete().eq('contact_id', id)
  const initiatives = parseInitiatives(formData)
  if (initiatives.length > 0) {
    await supabase.from('initiatives').insert(initiatives.map(initiative => ({ contact_id: id, initiative })))
  }

  revalidatePath('/')
  return {}
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  return {}
}
