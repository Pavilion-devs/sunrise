import fs from 'node:fs';
import path from 'node:path';

function main() {
  const root = process.cwd();
  const dir = path.join(root, 'data', 'cache', 'coingecko');
  const keep = new Set(['markets_snapshot_v1.json', 'tier1_listings_snapshot_v1.json']);

  if (!fs.existsSync(dir)) {
    console.log('No coingecko cache directory found.');
    return;
  }

  const removed = [];
  const kept = [];

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    if (!fs.statSync(filePath).isFile()) {
      continue;
    }

    if (keep.has(file)) {
      kept.push(file);
      continue;
    }

    fs.unlinkSync(filePath);
    removed.push(file);
  }

  console.log(`Removed ${removed.length} file(s).`);
  if (removed.length) {
    console.log(`Removed: ${removed.join(', ')}`);
  }
  console.log(`Kept ${kept.length} file(s): ${kept.join(', ') || 'none'}`);
}

main();
