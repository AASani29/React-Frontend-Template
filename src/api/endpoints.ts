import apiClient from './client'

// Types mirror the backend's Pydantic schemas field-for-field (see
// backend/app/schemas/). Kept here next to the functions that return them
// rather than in a separate types file — there is exactly one place either
// is used.

export interface User {
  id: number
  email: string
}

interface Token {
  access_token: string
  token_type: string
}

// --- auth --------------------------------------------------------------

export async function register(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', { email, password })
  return data
}

export async function login(email: string, password: string): Promise<Token> {
  // OAuth2's password grant (which the backend's OAuth2PasswordRequestForm
  // implements) expects form-encoded `username`/`password` fields, not
  // JSON — that field naming is the spec's, not a choice made here.
  const body = new URLSearchParams()
  body.set('username', email)
  body.set('password', password)
  const { data } = await apiClient.post<Token>('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

// --- items ---------------------------------------------------------------

export interface Item {
  id: number
  title: string
  description: string | null
  owner_id: number
  created_at: string
}

export interface ItemPage {
  items: Item[]
  total: number
  limit: number
  offset: number
}

export interface ItemCreate {
  title: string
  description?: string | null
}

export async function listItems(limit: number, offset: number): Promise<ItemPage> {
  const { data } = await apiClient.get<ItemPage>('/items', { params: { limit, offset } })
  return data
}

export async function createItem(payload: ItemCreate): Promise<Item> {
  const { data } = await apiClient.post<Item>('/items', payload)
  return data
}

export async function deleteItem(id: number): Promise<void> {
  await apiClient.delete(`/items/${id}`)
}

// Add your own resource's types + functions here, following the same
// shape as Item above. (The RAG starter this template was extracted from
// adds a --- rag --- block right here, including a file-upload call — see
// its uploadDocument() if you need a worked multipart/FormData example:
// the key detail is NOT setting Content-Type by hand, since axios sets the
// multipart boundary itself from a FormData instance.)
