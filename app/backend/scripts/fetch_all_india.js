const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'raw', 'healthsites_india.geojson');

async function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const url = `https://healthsites.io/api/v2/facilities/?country=India&page=${page}`;
    const req = https.get(url, { headers: { 'User-Agent': 'ArogyaVaniAI/1.0 (PublicHealthResearch)' }, timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ features: [] });
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(parsed);
        } catch (e) {
          resolve({ features: [] });
        }
      });
    });
    req.on('error', (e) => resolve({ features: [] }));
    req.on('timeout', () => { req.destroy(); resolve({ features: [] }); });
  });
}

async function main() {
  console.log('Downloading India Health Facilities from Healthsites.io...');
  let allFeatures = [];
  for (let p = 1; p <= 30; p++) {
    process.stdout.write(`Fetching page ${p}... `);
    const data = await fetchPage(p);
    const features = data.features || [];
    console.log(`got ${features.length} facilities.`);
    if (features.length === 0) break;
    allFeatures.push(...features);
  }
  console.log(`Total features fetched: ${allFeatures.length}`);
  if (allFeatures.length > 0) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ type: 'FeatureCollection', features: allFeatures }, null, 2));
    console.log(`Saved to ${OUTPUT_PATH}`);
  }
}

main();
