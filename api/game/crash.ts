import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientSeed, nonce, serverSeed } = req.body;

  // HMAC-SHA512 for provably fair result
  const hmac = crypto.createHmac('sha512', serverSeed);
  hmac.update(`${clientSeed}:${nonce}`);
  const hash = hmac.digest('hex');

  // Convert hash to multiplier
  // We use the first 52 bits of the hash
  const value = parseInt(hash.substring(0, 13), 16);
  const e = Math.pow(2, 52);
  
  // House edge 4% (0.96)
  let multiplier = (0.96 * e) / (e - value);
  multiplier = Math.max(1, Math.floor(multiplier * 100) / 100);

  res.status(200).json({ multiplier, hash });
}
