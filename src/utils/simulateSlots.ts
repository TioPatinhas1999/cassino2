import { SymbolType, SlotsEngine, REELS } from '../engine/slotsEngine';

export function runSimulation(iterations: number = 1000000) {
  let totalBet = 0;
  let totalWin = 0;
  const betPerLine = 1;
  const totalBetPerSpin = betPerLine * 20;

  console.log(`Starting simulation of ${iterations} spins...`);

  for (let i = 0; i < iterations; i++) {
    const grid: SymbolType[][] = [];
    for (let col = 0; col < 5; col++) {
      const reel: SymbolType[] = [];
      for (let row = 0; row < 3; row++) {
        const randomIndex = Math.floor(Math.random() * REELS[col].length);
        reel.push(REELS[col][randomIndex]);
      }
      grid.push(reel);
    }

    totalBet += totalBetPerSpin;
    const { totalWin: spinWin } = SlotsEngine.calculateWin(grid, betPerLine);
    totalWin += spinWin;

    if (i > 0 && i % 1000000 === 0) {
      console.log(`Progress: ${i} spins. Current RTP: ${(totalWin / totalBet * 100).toFixed(2)}%`);
    }
  }

  const rtp = (totalWin / totalBet) * 100;
  console.log('--- Simulation Results ---');
  console.log(`Total Spins: ${iterations}`);
  console.log(`Total Bet: ${totalBet}`);
  console.log(`Total Win: ${totalWin}`);
  console.log(`Final RTP: ${rtp.toFixed(2)}%`);
  
  return rtp;
}

// If running directly via node/tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimulation(10000000);
}
