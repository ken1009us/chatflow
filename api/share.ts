import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put, list } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET /api/share?id=xxx — read share data
  if (req.method === 'GET') {
    const id = req.query.id as string
    if (!id || !/^[a-z0-9]+$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    try {
      const { blobs } = await list({ prefix: `shares/${id}.json`, limit: 1 })
      if (blobs.length === 0) {
        return res.status(404).json({ error: 'Not found' })
      }

      const response = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      })
      if (!response.ok) {
        return res.status(502).json({ error: 'Blob fetch failed', status: response.status })
      }
      const data = await response.text()

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'public, s-maxage=86400')
      return res.send(data)
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to read share', detail: err?.message ?? String(err) })
    }
  }

  // POST /api/share — create share
  if (req.method === 'POST') {
    try {
      const data = req.body
      if (!data || !data.name) {
        return res.status(400).json({ error: 'Invalid data' })
      }

      const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      await put(`shares/${id}.json`, JSON.stringify(data), {
        contentType: 'application/json',
        access: 'private',
        addRandomSuffix: false,
      })

      return res.json({ id })
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create share', detail: err?.message ?? String(err) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
