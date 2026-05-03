'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Folder } from '@/app/components/ContactsClient'

export async function createFolder(name: string): Promise<Folder | { error: string }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('folders')
    .insert({ name: name.trim() })
    .select('id, name')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/')
  return data
}
