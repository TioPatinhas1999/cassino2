import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientSeed, nonce, serverSeed } = req.body;

  const hmac = crypto.createHmac('sha512', serverSeed);
  hmac.update(`${clientSeed}:${nonce}`);
  const hash = hmac.digest('hex');

  // Generate 5x3 grid
  const result: number[][] = [];
  const REELS_COUNT = 5;
  const ROWS_COUNT = 3;

  for (let col = 0; col < REELS_COUNT; col++) {
    const reel: number[] = [];
    for (let row = 0; row < ROWS_COUNT; row++) {
      const segment = hash.substring((col * ROWS_COUNT + row) * 4, (col * ROWS_COUNT + row) * 4 + 4);
      const val = parseInt(segment, 16) % 10; // 10 symbol types
      reel.push(val);
    }
    result.push(reel);
  }

  // Simple jackpot chance (e.g., 1 in 1000)
  const isJackpot = parseInt(hash.substring(hash.length - 4), 16) % 1000 === 0;

  res.status(200).json({ result, isJackpot, hash });
}
