import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = req.body
    if (!data || !data.name) {
      return res.status(400).json({ error: 'Invalid data' })
    }

    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
    await put(`shares/${id}.json`, JSON.stringify(data), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    })

    return res.json({ id })
  } catch {
    return res.status(500).json({ error: 'Failed to create share' })
  }
}
