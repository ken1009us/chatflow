import type { VercelRequest, VercelResponse } from '@vercel/node'
import { list } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = req.query.id as string
  if (!id || !/^[a-z0-9]+$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const { blobs } = await list({ prefix: `shares/${id}.json`, limit: 1 })
    if (blobs.length === 0) {
      return res.status(404).json({ error: 'Not found' })
    }

    const response = await fetch(blobs[0].downloadUrl)
    const data = await response.text()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, s-maxage=86400')
    return res.send(data)
  } catch {
    return res.status(500).json({ error: 'Failed to read share' })
  }
}
