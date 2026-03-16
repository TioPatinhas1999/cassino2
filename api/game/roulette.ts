import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientSeed, nonce, serverSeed } = req.body;

  const hmac = crypto.createHmac('sha512', serverSeed);
  hmac.update(`${clientSeed}:${nonce}`);
  const hash = hmac.digest('hex');

  // 0-36 for European Roulette
  const result = parseInt(hash.substring(0, 8), 16) % 37;

  res.status(200).json({ result, hash });
}
