import * as XLSX from 'xlsx';
import { IncentiveRecord, SalesEmployee, IncentiveTypeSummary } from '../types';
import { parseIncentiveAmount } from './numberFormat';

export interface ParseResult {
  sheetName: string;
  availableSheets: string[];
  records: IncentiveRecord[];
  employees: SalesEmployee[];
  totalRows: number;
}

/**
 * Normalizes and converts raw table rows into IncentiveRecord[]
 */
export function processRawRows(rawRows: (string | number | undefined)[][]): IncentiveRecord[] {
  const records: IncentiveRecord[] = [];
  let idCounter = 1;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length < 2) continue;

    const rawNip = String(row[0] ?? '').trim();
    const rawNama = String(row[1] ?? '').trim();
    const rawTipe = String(row[2] ?? '').trim();
    const rawDept = String(row[3] ?? '').trim();
    const rawReceipt = String(row[4] ?? '').trim();
    const rawSku = String(row[5] ?? '').trim();
    const rawJumlah = row[6] !== undefined ? String(row[6]).trim() : '0';

    // Skip header row if detected
    if (!rawNip || rawNip.toUpperCase() === 'NIP' || rawNip.toUpperCase() === 'NIK') {
      continue;
    }

    const jumlahInsentif = parseIncentiveAmount(rawJumlah);
    const tipeInsentif = rawTipe === '' ? '(Tanpa Tipe)' : rawTipe;

    records.push({
      id: `imp-rec-${idCounter++}`,
      nip: rawNip,
      nama: rawNama,
      tipeInsentif,
      departement: rawDept,
      noReceipt: rawReceipt,
      sku: rawSku,
      jumlahInsentif,
      matchingStatus: 'agustus_only',
      isBonusStoreOnly: false,
    });
  }

  return records;
}

/**
 * Parse an Excel ArrayBuffer or binary string into IncentiveRecord[]
 */
export function parseExcelFile(
  data: ArrayBuffer | string,
  preferredSheet?: string
): ParseResult {
  const workbook = XLSX.read(data, {
    type: typeof data === 'string' ? 'binary' : 'array',
    cellDates: false,
    cellText: true,
  });

  const availableSheets = workbook.SheetNames;
  let targetSheetName = availableSheets[0];

  if (preferredSheet && availableSheets.includes(preferredSheet)) {
    targetSheetName = preferredSheet;
  } else {
    const agustusSheet = availableSheets.find((name) =>
      name.toUpperCase().includes('INSENTIF AGUSTUS') || name.toUpperCase().includes('AGUSTUS')
    );
    if (agustusSheet) {
      targetSheetName = agustusSheet;
    } else {
      const commercialSheet = availableSheets.find((name) =>
        name.toUpperCase().includes('INSENTIF COMMERCIAL') || name.toUpperCase().includes('COMMERCIAL')
      );
      if (commercialSheet) {
        targetSheetName = commercialSheet;
      }
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rawRows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: '',
  });

  const records = processRawRows(rawRows);
  const employees = groupRecordsByEmployee(records);

  return {
    sheetName: targetSheetName,
    availableSheets,
    records,
    employees,
    totalRows: records.length,
  };
}

/**
 * Groups an array of IncentiveRecord into SalesEmployee objects with aggregated sums
 */
export function groupRecordsByEmployee(records: IncentiveRecord[]): SalesEmployee[] {
  const map = new Map<string, { nama: string; records: IncentiveRecord[] }>();

  for (const record of records) {
    if (!record.nip) continue;
    const cleanNip = String(record.nip).trim();
    if (!map.has(cleanNip)) {
      map.set(cleanNip, { nama: record.nama, records: [] });
    }
    const current = map.get(cleanNip)!;
    if (!current.nama && record.nama) {
      current.nama = record.nama;
    }
    current.records.push(record);
  }

  const employees: SalesEmployee[] = [];

  for (const [nip, data] of map.entries()) {
    const empRecords = data.records;
    const defaultPassword = nip.length >= 3 ? nip.slice(-3) : nip;

    let totalInsentif = 0;
    let totalPositive = 0;
    let totalNegative = 0;
    let bonusStoreAmount = 0;
    let bonusStoreData: Record<string, any> | undefined = undefined;
    let matchingStatus: 'matched' | 'agustus_only' | 'bonus_only' = 'agustus_only';

    const departmentSet = new Set<string>();
    const typeMap = new Map<string, { total: number; count: number; positive: number; negative: number }>();

    for (const rec of empRecords) {
      totalInsentif += rec.jumlahInsentif;
      if (rec.jumlahInsentif >= 0) {
        totalPositive += rec.jumlahInsentif;
      } else {
        totalNegative += rec.jumlahInsentif;
      }

      if (rec.departement && rec.departement !== '-') {
        departmentSet.add(rec.departement);
      }

      // Bonus Store data attached to record
      if (rec.bonusStoreAmount !== undefined && bonusStoreAmount === 0 && rec.bonusStoreAmount > 0) {
        bonusStoreAmount = rec.bonusStoreAmount;
      }
      if (rec.bonusStoreValues && !bonusStoreData) {
        bonusStoreData = rec.bonusStoreValues;
      }
      if (rec.matchingStatus) {
        matchingStatus = rec.matchingStatus;
      }

      const typeKey = rec.tipeInsentif || '(Tanpa Tipe)';
      if (!typeMap.has(typeKey)) {
        typeMap.set(typeKey, { total: 0, count: 0, positive: 0, negative: 0 });
      }
      const tStat = typeMap.get(typeKey)!;
      tStat.total += rec.jumlahInsentif;
      tStat.count += 1;
      if (rec.jumlahInsentif >= 0) {
        tStat.positive += rec.jumlahInsentif;
      } else {
        tStat.negative += rec.jumlahInsentif;
      }
    }

    const typeSummaries: IncentiveTypeSummary[] = Array.from(typeMap.entries())
      .map(([type, stats]) => ({
        type,
        total: stats.total,
        count: stats.count,
        positiveTotal: stats.positive,
        negativeTotal: stats.negative,
      }))
      .sort((a, b) => b.total - a.total);

    employees.push({
      nip,
      nama: data.nama || `Sales (${nip})`,
      defaultPassword,
      totalInsentif,
      totalPositive,
      totalNegative,
      transactionCount: empRecords.filter((r) => !r.isBonusStoreOnly).length,
      departments: Array.from(departmentSet),
      records: empRecords,
      typeSummaries,
      bonusStoreAmount,
      totalTakeHomePay: totalInsentif + bonusStoreAmount,
      bonusStoreData,
      matchingStatus,
      isBonusStoreOnly: matchingStatus === 'bonus_only',
    });
  }

  return employees.sort((a, b) => a.nama.localeCompare(b.nama));
}
