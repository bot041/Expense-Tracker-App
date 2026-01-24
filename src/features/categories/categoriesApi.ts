import { off, onValue, push, ref, remove, set, update } from 'firebase/database'
import { db, ensureSignedIn, isFirebaseConfigured } from '../../firebase'
import type { Category } from '../../types'

function categoriesPath(uid: string) {
  return `users/${uid}/categories`
}

export async function categoriesSubscribe(onData: (cats: Category[]) => void) {
  if (!isFirebaseConfigured() || !db) {
    onData([])
    return () => {}
  }

  const user = await ensureSignedIn()
  if (!user) {
    onData([])
    return () => {}
  }

  const r = ref(db, categoriesPath(user.uid))
  const unsub = onValue(r, (snap) => {
    const val = (snap.val() ?? {}) as Record<string, Omit<Category, 'id'>>
    const list: Category[] = Object.entries(val).map(([id, c]) => ({ id, ...c }))
    onData(list.sort((a, b) => a.name.localeCompare(b.name)))
  })

  return () => {
    off(r)
    unsub()
  }
}

export async function categoryCreate(input: Omit<Category, 'id'>) {
  if (!isFirebaseConfigured() || !db) throw new Error('Firebase not configured')
  const user = await ensureSignedIn()
  if (!user) throw new Error('Not signed in')
  const r = ref(db, categoriesPath(user.uid))
  const key = push(r).key
  if (!key) throw new Error('Failed to create key')
  await set(ref(db, `${categoriesPath(user.uid)}/${key}`), input)
  return key
}

export async function categoryUpdate(id: string, patch: Partial<Omit<Category, 'id'>>) {
  if (!isFirebaseConfigured() || !db) throw new Error('Firebase not configured')
  const user = await ensureSignedIn()
  if (!user) throw new Error('Not signed in')
  await update(ref(db, `${categoriesPath(user.uid)}/${id}`), patch)
}

export async function categoryDelete(id: string) {
  if (!isFirebaseConfigured() || !db) throw new Error('Firebase not configured')
  const user = await ensureSignedIn()
  if (!user) throw new Error('Not signed in')
  await remove(ref(db, `${categoriesPath(user.uid)}/${id}`))
}

