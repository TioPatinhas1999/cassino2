import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // In a real app, this would fetch from a database (Firestore/Postgres)
  const leaderboard = [
    { user: '0x82...1a2b', profit: 12540.50, wins: 142 },
    { user: '0x34...9f8e', profit: 8420.20, wins: 98 },
    { user: '0x1c...7d6c', profit: 5100.00, wins: 65 },
    { user: '0x9a...4b3a', profit: 3200.15, wins: 45 },
    { user: '0xef...2e1d', profit: 1850.00, wins: 32 },
  ];

  res.status(200).json(leaderboard);
}
