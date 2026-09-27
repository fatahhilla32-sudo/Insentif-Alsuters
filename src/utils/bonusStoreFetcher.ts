import {
  IncentiveRecord,
  BonusStoreDataPackage,
  ValidationSummary,
} from '../types';
import defaultBonusStoreData from '../data/bonus_store_records.json';

export const DEFAULT_BONUS_STORE_SPREADSHEET_ID = '10TgEJyFSJkD6yfV8t_QgGH9jJJ_NppIXlCUsvVuB6lY';
export const DEFAULT_BONUS_STORE_GID = '1621745252';
export const DEFAULT_BONUS_STORE_SHEET_NAME = 'Bonus Store';
export const DEFAULT_BONUS_STORE_RANGE = "'Bonus Store'!A1:Z";

const STORAGE_KEY_BONUS_STORE = 'sales_portal_bonus_store_data_v1';

/**
 * Parses a standard CSV line with quote escaping
 */
export function parseCSVLine(line: string): string[] {
  const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
  const parts: string[] = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    parts.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    if (regex.lastIndex >= line.length) break;
  }
  return parts;
}

/**
 * Loads stored or default Bonus Store package
 */
export function getActiveBonusStorePackage(): BonusStoreDataPackage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BONUS_STORE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved bonus store data, using pre-bundled data:', e);
  }
  return defaultBonusStoreData as BonusStoreDataPackage;
}

export function saveBonusStorePackage(pkg: BonusStoreDataPackage): void {
  try {
    localStorage.setItem(STORAGE_KEY_BONUS_STORE, JSON.stringify(pkg));
  } catch (e) {
    console.warn('Failed to save bonus store data to localStorage:', e);
  }
}

export function resetBonusStorePackage(): BonusStoreDataPackage {
  try {
    localStorage.removeItem(STORAGE_KEY_BONUS_STORE);
  } catch (e) {
    // ignore
  }
  return defaultBonusStoreData as BonusStoreDataPackage;
}

/**
 * Fetches dynamic Bonus Store data from Google Sheets API / CSV Export with range 'Bonus Store'!A1:Z
 * Reads header dynamically without hardcoding columns.
 */
export async function fetchBonusStoreFromGoogleSheets(options?: {
  spreadsheetId?: string;
  sheetName?: string;
  gid?: string;
  range?: string;
  apiKey?: string;
}): Promise<BonusStoreDataPackage> {
  const cleanId = (options?.spreadsheetId || DEFAULT_BONUS_STORE_SPREADSHEET_ID).trim();
  const cleanGid = (options?.gid || DEFAULT_BONUS_STORE_GID).trim();
  const cleanSheet = (options?.sheetName || DEFAULT_BONUS_STORE_SHEET_NAME).trim();
  const cleanRange = (options?.range || DEFAULT_BONUS_STORE_RANGE).trim();

  // Try 1: Google Sheets API v4 if apiKey is provided
  if (options?.apiKey) {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      cleanRange
    )}?key=${options.apiKey}`;
    try {
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const json = await resp.json();
        if (json.values && json.values.length > 0) {
          const headerRow: string[] = (json.values[0] as string[]).map((h) => String(h || '').trim());
          const rows: Record<string, any>[] = [];
          for (let i = 1; i < json.values.length; i++) {
            const rowArr = json.values[i] as any[];
            const rowObj: Record<string, any> = {};
            let hasContent = false;
            for (let c = 0; c < headerRow.length; c++) {
              const hName = headerRow[c];
              let val = rowArr[c] !== undefined ? rowArr[c] : '';
              if (hName.toLowerCase() === 'nip') {
                val = String(val).trim();
              } else if (
                hName.toLowerCase().includes('bonus') ||
                hName.toLowerCase().includes('jumlah') ||
                hName.toLowerCase().includes('nominal')
              ) {
                const num = parseFloat(String(val).replace(/,/g, ''));
                val = isNaN(num) ? val : Math.round(num);
              }
              if (val !== '') hasContent = true;
              rowObj[hName] = val;
            }
            if (hasContent && rowObj[headerRow[0]]) {
              rows.push(rowObj);
            }
          }
          return {
            spreadsheetId: cleanId,
            sheetName: cleanSheet,
            gid: cleanGid,
            range: cleanRange,
            headers: headerRow,
            totalRows: rows.length,
            rows,
            fetchedAt: new Date().toISOString(),
          };
        }
      }
    } catch (apiErr) {
      console.warn('Sheets API v4 fetch failed, falling back to export/gviz:', apiErr);
    }
  }

  // Try 2: Direct Google Sheets CSV export with GID (cleanest, unlimited lines)
  const exportUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv&gid=${cleanGid}`;
  let csvText = '';
  try {
    const res = await fetch(exportUrl);
    if (res.ok) {
      csvText = await res.text();
    }
  } catch (err) {
    console.warn('Export GID fetch failed, trying GViz URL:', err);
  }

  // Try 3: Fallback to GViz query with range A1:Z and limit 50000
  if (!csvText) {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      cleanSheet
    )}&range=A1:Z&tq=${encodeURIComponent('select * limit 50000')}`;
    const gvizRes = await fetch(gvizUrl);
    if (!gvizRes.ok) {
      throw new Error(`Gagal mengambil sheet "${cleanSheet}" dari Google Sheets (HTTP ${gvizRes.status})`);
    }
    csvText = await gvizRes.text();
  }

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Data sheet Bonus Store kosong atau tidak terbaca.');
  }

  // Read header from line 0 dynamically
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const rowObj: Record<string, any> = {};
    let hasVal = false;

    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      let val: string | number = parts[c] !== undefined ? parts[c] : '';
      if (h.toLowerCase() === 'nip') {
        val = String(val).trim();
      } else if (
        h.toLowerCase().includes('bonus') ||
        h.toLowerCase().includes('jumlah') ||
        h.toLowerCase().includes('nominal')
      ) {
        const num = parseFloat(String(val).replace(/,/g, ''));
        val = isNaN(num) ? val : Math.round(num);
      }
      if (val !== '') hasVal = true;
      rowObj[h] = val;
    }

    if (hasVal && rowObj[headers[0]]) {
      rows.push(rowObj);
    }
  }

  return {
    spreadsheetId: cleanId,
    sheetName: cleanSheet,
    gid: cleanGid,
    range: cleanRange,
    headers,
    totalRows: rows.length,
    rows,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Merges INSENTIF AGUSTUS records with Bonus Store data package based on NIP string equality.
 */
export function mergeAgustusWithBonusStoreData(
  agustusRecords: IncentiveRecord[],
  bonusStorePkg: BonusStoreDataPackage
): {
  mergedRecords: IncentiveRecord[];
  validationSummary: ValidationSummary;
  bonusStoreMap: Map<string, Record<string, any>>;
} {
  // Find column name for NIP and Bonus dynamically
  const nipColName = bonusStorePkg.headers.find((h) => h.toLowerCase() === 'nip') || bonusStorePkg.headers[0] || 'nip';
  const bonusColName =
    bonusStorePkg.headers.find(
      (h) =>
        h.toLowerCase() === 'bonus' ||
        h.toLowerCase().includes('bonus') ||
        h.toLowerCase().includes('jumlah') ||
        h.toLowerCase().includes('nominal')
    ) || 'bonus';
  const nameColName = bonusStorePkg.headers.find((h) => h.toLowerCase().includes('nama')) || 'nama';

  // Build map of Bonus Store by NIP (ensuring string key)
  const bonusStoreMap = new Map<string, Record<string, any>>();
  for (const bRow of bonusStorePkg.rows) {
    const rawNip = bRow[nipColName];
    if (rawNip !== undefined && rawNip !== null) {
      const cleanNip = String(rawNip).trim();
      if (cleanNip) {
        bonusStoreMap.set(cleanNip, bRow);
      }
    }
  }

  // Get distinct NIPs from INSENTIF AGUSTUS
  const agustusNipSet = new Set<string>();
  for (const rec of agustusRecords) {
    if (!rec.isBonusStoreOnly && rec.nip) {
      agustusNipSet.add(String(rec.nip).trim());
    }
  }

  // Track matched and unmatched
  let matchedNipCount = 0;
  const agustusOnlyNips: string[] = [];
  const bonusStoreOnlyNips: string[] = [];

  for (const aNip of agustusNipSet) {
    if (bonusStoreMap.has(aNip)) {
      matchedNipCount++;
    } else {
      agustusOnlyNips.push(aNip);
    }
  }

  for (const [bNip] of bonusStoreMap) {
    if (!agustusNipSet.has(bNip)) {
      bonusStoreOnlyNips.push(bNip);
    }
  }

  // 1. Process all original INSENTIF AGUSTUS records
  const mergedRecords: IncentiveRecord[] = [];

  for (const rec of agustusRecords) {
    // If it's already an injected bonus-only record, skip re-injecting
    if (rec.isBonusStoreOnly) continue;

    const cleanNip = String(rec.nip).trim();
    const bonusData = bonusStoreMap.get(cleanNip);

    if (bonusData) {
      // Matched: add dynamic columns from Bonus Store
      const rawBonus = bonusData[bonusColName];
      const bonusNum = typeof rawBonus === 'number' ? rawBonus : parseFloat(String(rawBonus).replace(/,/g, '')) || 0;

      mergedRecords.push({
        ...rec,
        nip: cleanNip,
        bonusStoreValues: bonusData,
        bonusStoreAmount: bonusNum,
        matchingStatus: 'matched',
        isBonusStoreOnly: false,
      });
    } else {
      // Agustus only: Bonus store columns are 0 / empty
      mergedRecords.push({
        ...rec,
        nip: cleanNip,
        bonusStoreValues: undefined,
        bonusStoreAmount: 0,
        matchingStatus: 'agustus_only',
        isBonusStoreOnly: false,
      });
    }
  }

  // 2. Add records for NIPs in Bonus Store that are NOT in INSENTIF AGUSTUS (Requirement 5)
  let bonusStoreOnlyRecIndex = 1;
  let totalBonusStoreMatched = 0;
  let totalBonusStoreUnmatched = 0;

  // Calculate bonus store totals
  for (const [bNip, bData] of bonusStoreMap) {
    const rawBonus = bData[bonusColName];
    const bonusNum = typeof rawBonus === 'number' ? rawBonus : parseFloat(String(rawBonus).replace(/,/g, '')) || 0;
    if (agustusNipSet.has(bNip)) {
      totalBonusStoreMatched += bonusNum;
    } else {
      totalBonusStoreUnmatched += bonusNum;
    }
  }

  for (const bNip of bonusStoreOnlyNips) {
    const bData = bonusStoreMap.get(bNip)!;
    const rawBonus = bData[bonusColName];
    const bonusNum = typeof rawBonus === 'number' ? rawBonus : parseFloat(String(rawBonus).replace(/,/g, '')) || 0;
    const nama = bData[nameColName] || `Sales ${bNip}`;

    mergedRecords.push({
      id: `rec-bonus-only-${bNip}-${bonusStoreOnlyRecIndex++}`,
      nip: bNip,
      nama: String(nama).trim(),
      tipeInsentif: '(Bonus Store Only)',
      departement: '-',
      noReceipt: '-',
      sku: '-',
      jumlahInsentif: 0, // No Agustus incentive
      bonusStoreValues: bData,
      bonusStoreAmount: bonusNum,
      isBonusStoreOnly: true,
      matchingStatus: 'bonus_only',
    });
  }

  const validationSummary: ValidationSummary = {
    agustusRowCount: agustusRecords.filter((r) => !r.isBonusStoreOnly).length,
    bonusStoreRowCount: bonusStorePkg.rows.length,
    agustusUniqueNipCount: agustusNipSet.size,
    bonusStoreUniqueNipCount: bonusStoreMap.size,
    matchedNipCount,
    agustusOnlyNips,
    bonusStoreOnlyNips,
    bonusStoreHeaders: bonusStorePkg.headers,
    totalBonusStoreMatched,
    totalBonusStoreUnmatched,
    totalBonusStoreAll: totalBonusStoreMatched + totalBonusStoreUnmatched,
  };

  return {
    mergedRecords,
    validationSummary,
    bonusStoreMap,
  };
}
