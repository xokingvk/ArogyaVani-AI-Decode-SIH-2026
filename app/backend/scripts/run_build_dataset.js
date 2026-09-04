const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');
const PROCESSED_DIR = path.join(__dirname, '..', 'data', 'processed');
const FINAL_FILE = path.join(__dirname, '..', 'data', 'phc_facilities.json');
const MISSING_FILE = path.join(PROCESSED_DIR, 'missing_coordinates.json');
const REPORT_FILE = path.join(PROCESSED_DIR, 'dataset_report.json');

const EARTH_RADIUS_METERS = 6371000.0;

function haversine(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlam = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function validateCoordinates(lat, lon) {
  if (lat === null || lat === undefined || lon === null || lon === undefined) return [false, null, null];
  const fLat = parseFloat(lat);
  const fLon = parseFloat(lon);
  if (isNaN(fLat) || isNaN(fLon) || !isFinite(fLat) || !isFinite(fLon)) return [false, null, null];
  if (fLat === 0 && fLon === 0) return [false, null, null];
  if (fLat >= -90 && fLat <= 90 && fLon >= -180 && fLon <= 180) {
    return [true, Math.round(fLat * 1000000) / 1000000, Math.round(fLon * 1000000) / 1000000];
  }
  return [false, null, null];
}

function normalizeState(state, district) {
  const s = (state || '').trim().toLowerCase();
  const d = (district || '').trim().toLowerCase();
  if (s.includes('karnataka') || d.includes('bengaluru') || d.includes('bangalore') || d.includes('mysuru')) return 'Karnataka';
  if (s.includes('tamil') || d.includes('chennai')) return 'Tamil Nadu';
  if (s.includes('delhi') || d.includes('delhi')) return 'Delhi';
  if (s.includes('maharashtra') || d.includes('mumbai') || d.includes('pune')) return 'Maharashtra';
  if (s.includes('kerala')) return 'Kerala';
  if (s.includes('telangana') || d.includes('hyderabad')) return 'Telangana';
  if (s.includes('andhra')) return 'Andhra Pradesh';
  if (s.includes('uttar pradesh') || s === 'up') return 'Uttar Pradesh';
  if (s.includes('gujarat')) return 'Gujarat';
  if (s.includes('west bengal')) return 'West Bengal';
  if (s.includes('rajasthan')) return 'Rajasthan';
  if (s.includes('madhya') || s === 'mp') return 'Madhya Pradesh';
  if (s.includes('bihar')) return 'Bihar';
  if (s.includes('odisha') || s.includes('orissa')) return 'Odisha';
  if (s.includes('punjab')) return 'Punjab';
  if (s.includes('haryana')) return 'Haryana';
  return state && state.trim() ? state.trim() : 'Karnataka';
}

function normalizeDistrict(district) {
  const d = (district || '').trim().toLowerCase();
  const blr = ['bangalore', 'bangalore urban', 'bangalore city', 'bengaluru', 'bengaluru urban', 'bengaluru city', 'bbmp', 'bruhat bengaluru'];
  if (blr.some((v) => d.includes(v))) {
    if (d.includes('rural')) return 'Bengaluru Rural';
    return 'Bengaluru Urban';
  }
  if (d.includes('chennai')) return 'Chennai';
  if (d.includes('mumbai')) return 'Mumbai';
  if (d.includes('mysuru') || d.includes('mysore')) return 'Mysuru';
  if (d.includes('belagavi') || d.includes('belgaum')) return 'Belagavi';
  if (d.includes('dharwad') || d.includes('hubli') || d.includes('hubballi')) return 'Dharwad';
  if (d.includes('dakshina kannada') || d.includes('mangaluru') || d.includes('mangalore')) return 'Dakshina Kannada';
  if (d.includes('kalaburagi') || d.includes('gulbarga')) return 'Kalaburagi';
  return district && district.trim() ? district.trim() : 'Bengaluru Urban';
}

function classifyFacility(name, rawType) {
  const text = `${name} ${rawType || ''}`.toLowerCase();
  const phcPatterns = [
    /\bphc\b/,
    /\buphc\b/,
    /\bprimary health\b/,
    /\bprimary healthcare\b/,
    /\bnamma clinic\b/,
    /\burban primary health\b/,
    /\bprathmik swasthya\b/,
    /\bprarambhika arogya\b/,
    /\barogya nilayam\b/,
    /\bcommunity health centre\b/,
    /\bcommunity health center\b/,
    /\bchc\b/,
    /\bgovt phc\b/,
    /\bgovernment phc\b/,
  ];
  if (phcPatterns.some((p) => p.test(text))) return 'Primary Health Centre';
  return 'Government Health Facility';
}

function cleanPhone(raw) {
  if (!raw) return null;
  let p = String(raw).trim();
  if (p.includes(';')) p = p.split(';')[0].trim();
  if (p.includes(',')) p = p.split(',')[0].trim();
  const clean = p.replace(/[^\d+\-\s]/g, '').trim();
  const digits = clean.replace(/\D/g, '');
  if (digits.length < 5) return null;
  return clean;
}

function parseKml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const base = path.basename(filePath);
  const isChennai = base.toLowerCase().includes('chennai');
  const source = isChennai ? 'Greater Chennai Corporation Health Department' : 'Karnataka Health and Family Welfare Department / BBMP';

  const placemarks = content.split(/<Placemark[\s>]/).slice(1);
  const facilities = [];

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i].split('</Placemark>')[0];
    const data = {};

    const simpleRegex = /<SimpleData name="([^"]+)">([\s\S]*?)<\/SimpleData>/g;
    let match;
    while ((match = simpleRegex.exec(pm)) !== null) {
      data[match[1]] = match[2].trim();
    }

    let name = data.UPHC || data.NammaClinicName || data.UCHC_HospitalName || data.ASSET_NAME || data.Name || data.name || '';
    if (!name) {
      const nameMatch = /<name>([\s\S]*?)<\/name>/.exec(pm);
      if (nameMatch) name = nameMatch[1].trim();
    }

    if (data.NammaClinicName && !name.toLowerCase().startsWith('namma clinic')) {
      name = `Namma Clinic - ${name}`;
    } else if (data.UPHC && !name.toLowerCase().startsWith('uphc') && !name.toLowerCase().startsWith('urban primary')) {
      name = `Urban Primary Health Centre - ${name}`;
    }

    let lat = data.Lattitude || data.Latitude || data.lat || data.LATITUDE;
    let lon = data.Longitude || data.lon || data.LONGITUDE;

    if (!lat || !lon) {
      const coordMatch = /<coordinates>([\s\S]*?)<\/coordinates>/.exec(pm);
      if (coordMatch) {
        const parts = coordMatch[1].trim().split(',');
        if (parts.length >= 2) {
          lon = parts[0].trim();
          lat = parts[1].trim();
        }
      }
    }

    const ward = data.ward || data.Ward || data.DIVISION || null;
    const zone = data.Zone || data.ZONE || null;
    const addr = data.ADDRESS || data.Address || data.LOCATION || null;

    const parts = [];
    if (addr) parts.push(addr);
    if (ward) parts.push(`Ward: ${ward}`);
    if (zone) parts.push(`Zone: ${zone}`);
    const state = isChennai ? 'Tamil Nadu' : 'Karnataka';
    const district = isChennai ? 'Chennai' : 'Bengaluru Urban';
    parts.push(district, state);
    const fullAddress = parts.join(', ');

    const phone = cleanPhone(data.Contact_No || data.phone || data.contact);
    const facilityType = classifyFacility(name, data.TYPE || data.facility_type);
    const rawId = data.KGISCode || data.FINAL_CODE || data.FID || `KML-${base.slice(0, 4)}-${i}`;

    facilities.push({
      raw_id: String(rawId),
      name: name.trim(),
      facility_type: facilityType,
      state,
      district,
      subdistrict: ward,
      address: fullAddress,
      latitude: lat,
      longitude: lon,
      phone,
      source,
      source_url: 'https://data.opencity.in',
      source_year: 2023,
      verified: false,
    });
  }

  return facilities;
}

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const base = path.basename(filePath);
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const facilities = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parser handling quotes
    const row = [];
    let inQuote = false;
    let curr = '';
    for (let c = 0; c < lines[i].length; c++) {
      const ch = lines[i][c];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        row.push(curr.trim());
        curr = '';
      } else {
        curr += ch;
      }
    }
    row.push(curr.trim());

    const rowObj = {};
    for (let h = 0; h < headers.length; h++) {
      if (h < row.length) {
        rowObj[headers[h]] = row[h].replace(/^"|"$/g, '').trim();
      }
    }

    const name = rowObj['name'] || rowObj['uphc name'] || rowObj['hospital name'] || rowObj['facility_name'] || '';
    if (!name) continue;

    const lat = rowObj['latitude'] || rowObj['lat'];
    const lon = rowObj['longitude'] || rowObj['lon'] || rowObj['lng'];

    const state = normalizeState(rowObj['state'] || rowObj['state_name'], rowObj['district'] || rowObj['city']);
    const district = normalizeDistrict(rowObj['district'] || rowObj['city'] || rowObj['zone. no'], state);
    const addr = rowObj['uphc  address'] || rowObj['address'] || rowObj['location'] || `${district}, ${state}`;
    const phone = cleanPhone(rowObj['helpline'] || rowObj['phone'] || rowObj['contact_no']);
    const facilityType = classifyFacility(name, rowObj['category'] || rowObj['type']);
    const rawId = rowObj['id'] || `CSV-${base.slice(0, 4)}-${i}`;

    const sourceName = base.includes('chennai')
      ? 'Greater Chennai Corporation Health Department'
      : 'National Health Infrastructure Directory';

    facilities.push({
      raw_id: String(rawId),
      name: name.trim(),
      facility_type: facilityType,
      state,
      district,
      subdistrict: rowObj['subdistrict'] || rowObj['div.no'] || null,
      address: addr.trim(),
      latitude: lat,
      longitude: lon,
      phone,
      source: sourceName,
      source_url: 'https://data.gov.in',
      source_year: 2023,
      verified: false,
    });
  }

  return facilities;
}

function parseJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  const items = Array.isArray(data) ? data : data.features || data.facilities || [];
  const facilities = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const name = item.name || `Health Facility ${i + 1}`;
    const state = normalizeState(item.state, item.district);
    const district = normalizeDistrict(item.district, state);
    facilities.push({
      raw_id: String(item.id || `JSON-${i}`),
      name: name.trim(),
      facility_type: item.facility_type || classifyFacility(name),
      state,
      district,
      subdistrict: item.subdistrict || null,
      address: item.address || `${district}, ${state}`,
      latitude: item.latitude,
      longitude: item.longitude,
      phone: cleanPhone(item.phone),
      source: item.source || 'Karnataka Health and Family Welfare Department',
      source_url: item.source_url || 'https://karhfw.gov.in',
      source_year: item.source_year || 2023,
      verified: Boolean(item.verified),
    });
  }

  return facilities;
}

function deduplicate(facilities) {
  const seenIds = new Set();
  const seenNameDist = new Set();
  const deduped = [];
  let removed = 0;

  for (const fac of facilities) {
    const normName = fac.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const normDist = fac.district.toLowerCase().trim();
    const nameDistKey = `${normName}::${normDist}`;

    if (seenIds.has(fac.id)) {
      removed++;
      continue;
    }
    if (seenNameDist.has(nameDistKey)) {
      removed++;
      continue;
    }

    let isDup = false;
    for (const acc of deduped) {
      const dist = haversine(fac.latitude, fac.longitude, acc.latitude, acc.longitude);
      if (dist < 50) {
        const accNorm = acc.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
        if (normName === accNorm || normName.includes(accNorm) || accNorm.includes(normName)) {
          isDup = true;
          break;
        }
      }
    }

    if (isDup) {
      removed++;
      continue;
    }

    seenIds.add(fac.id);
    seenNameDist.add(nameDistKey);
    deduped.push(fac);
  }

  return [deduped, removed];
}

function build() {
  console.log('Reading official raw healthcare datasets from:', RAW_DIR);
  const rawFiles = fs.readdirSync(RAW_DIR);
  let allRaw = [];

  for (const file of rawFiles) {
    const fullPath = path.join(RAW_DIR, file);
    if (file.endsWith('.kml')) {
      const parsed = parseKml(fullPath);
      console.log(`Loaded ${parsed.length} records from ${file}`);
      allRaw.push(...parsed);
    } else if (file.endsWith('.csv')) {
      const parsed = parseCsv(fullPath);
      console.log(`Loaded ${parsed.length} records from ${file}`);
      allRaw.push(...parsed);
    } else if (file.endsWith('.json')) {
      const parsed = parseJson(fullPath);
      console.log(`Loaded ${parsed.length} records from ${file}`);
      allRaw.push(...parsed);
    }
  }

  const validRecords = [];
  const missingRecords = [];

  for (let i = 0; i < allRaw.length; i++) {
    const r = allRaw[i];
    const [valid, lat, lon] = validateCoordinates(r.latitude, r.longitude);
    const rawIdStr = String(r.raw_id || '').trim();
    const finalId = rawIdStr && rawIdStr.length > 4 ? `IND-${rawIdStr}` : `PHC-IND-${String(i + 1).padStart(5, '0')}`;

    const rec = {
      id: finalId,
      name: r.name,
      facility_type: r.facility_type,
      state: r.state,
      district: r.district,
      subdistrict: r.subdistrict,
      address: r.address,
      latitude: valid ? lat : null,
      longitude: valid ? lon : null,
      phone: r.phone,
      source: r.source,
      source_url: r.source_url || 'https://data.gov.in',
      source_year: r.source_year || 2023,
      verified: r.verified || false,
    };

    if (valid) {
      validRecords.push(rec);
    } else {
      missingRecords.push(rec);
    }
  }

  const [deduped, removedCount] = deduplicate(validRecords);
  deduped.sort((a, b) => `${a.state}-${a.district}-${a.name}`.localeCompare(`${b.state}-${b.district}-${b.name}`));

  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  fs.writeFileSync(FINAL_FILE, JSON.stringify(deduped, null, 2), 'utf-8');
  fs.writeFileSync(MISSING_FILE, JSON.stringify(missingRecords, null, 2), 'utf-8');

  const phcCount = deduped.filter((f) => f.facility_type === 'Primary Health Centre').length;
  const govtCount = deduped.filter((f) => f.facility_type === 'Government Health Facility').length;
  const phoneCount = deduped.filter((f) => f.phone !== null).length;
  const statesSet = new Set(deduped.map((f) => f.state));
  const districtsSet = new Set(deduped.map((f) => `${f.state}::${f.district}`));
  const blrRecords = deduped.filter((f) => f.district === 'Bengaluru Urban');
  const blrPhcRecords = blrRecords.filter((f) => f.facility_type === 'Primary Health Centre');
  const kaRecords = deduped.filter((f) => f.state === 'Karnataka');
  const kaPhcRecords = kaRecords.filter((f) => f.facility_type === 'Primary Health Centre');

  const report = {
    total_records: allRaw.length,
    phc_records: phcCount,
    government_records: govtCount,
    records_with_coordinates: deduped.length,
    records_without_coordinates: missingRecords.length,
    records_with_phone: phoneCount,
    states_count: statesSet.size,
    districts_count: districtsSet.size,
    bengaluru_records: blrRecords.length,
    bengaluru_phc_records: blrPhcRecords.length,
    karnataka_records: kaRecords.length,
    karnataka_phc_records: kaPhcRecords.length,
    duplicate_records_removed: removedCount,
    states: Array.from(statesSet).sort(),
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n==================================================');
  console.log('AROGYAVANI AI — NATIONAL PHC DATASET REPORT');
  console.log('==================================================');
  console.log(`All raw records parsed: ${allRaw.length}`);
  console.log(`Valid facilities with GPS: ${deduped.length}`);
  console.log(`Primary Health Centres: ${phcCount}`);
  console.log(`Government Health Facilities: ${govtCount}`);
  console.log(`Bengaluru Urban Total: ${blrRecords.length}`);
  console.log(`Bengaluru Urban PHCs: ${blrPhcRecords.length}`);
  console.log(`Karnataka Total: ${kaRecords.length}`);
  console.log(`Karnataka PHCs: ${kaPhcRecords.length}`);
  console.log(`Facilities with phone contact: ${phoneCount}`);
  console.log(`States covered: ${statesSet.size}`);
  console.log(`Districts covered: ${districtsSet.size}`);
  console.log(`Duplicates removed: ${removedCount}`);
  console.log(`Records missing coordinates (isolated): ${missingRecords.length}`);
  console.log(`Output dataset: ${FINAL_FILE}`);
  console.log('==================================================\n');
}

build();
