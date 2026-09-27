import {
  IncentiveRecord,
  SalesEmployee,
  OverallIncentiveSummary,
  IncentiveTypeSummary,
  DepartmentSummary,
  ValidationSummary,
} from '../types';
import { groupRecordsByEmployee } from '../utils/excelParser';
import rawRecordsData from './all_records.json';
import {
  getActiveBonusStorePackage,
  mergeAgustusWithBonusStoreData,
} from '../utils/bonusStoreFetcher';

// Convert raw INSENTIF AGUSTUS rows (Cell A1:G11068, 11067 transactions)
const baseAgustusRecords: IncentiveRecord[] = (rawRecordsData as (string | number)[][]).map(
  (row, index) => {
    const nip = String(row[0] ?? '').trim();
    const nama = String(row[1] ?? '').trim();
    const rawTipe = String(row[2] ?? '').trim();
    const departement = String(row[3] ?? '').trim();
    const noReceipt = String(row[4] ?? '').trim();
    const sku = String(row[5] ?? '').trim();
    const jumlahInsentif = Number(row[6] ?? 0);

    let tipeInsentif = rawTipe;
    if (!tipeInsentif || tipeInsentif.trim() === '') {
      tipeInsentif = '(Tanpa Tipe)';
    }

    return {
      id: `rec-sheet-${index + 1}`,
      nip,
      nama,
      tipeInsentif,
      departement,
      noReceipt,
      sku,
      jumlahInsentif,
      matchingStatus: 'agustus_only',
      isBonusStoreOnly: false,
    };
  }
);

// Initial merge with Bonus Store
const initialBonusStorePackage = getActiveBonusStorePackage();
const { mergedRecords: defaultMergedRecords, validationSummary: initialValidationSummary } =
  mergeAgustusWithBonusStoreData(baseAgustusRecords, initialBonusStorePackage);

export const fullSpreadsheetRecords: IncentiveRecord[] = defaultMergedRecords;
export const defaultIncentiveRecords: IncentiveRecord[] = defaultMergedRecords;
export const defaultValidationSummary: ValidationSummary = initialValidationSummary;

const STORAGE_KEY_RECORDS = 'sales_incentive_custom_records_v4';
const STORAGE_KEY_LABEL = 'sales_incentive_custom_label_v4';

/**
 * Retrieves the active record set (either stored custom dataset or built-in default)
 */
export function getActiveRecords(): {
  records: IncentiveRecord[];
  sourceLabel: string;
  isCustom: boolean;
  validationSummary: ValidationSummary;
} {
  const currentBonusPackage = getActiveBonusStorePackage();

  try {
    const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
    const savedLabel = localStorage.getItem(STORAGE_KEY_LABEL);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Re-merge with active bonus store package to ensure dynamic sync
        const { mergedRecords, validationSummary } = mergeAgustusWithBonusStoreData(
          parsed,
          currentBonusPackage
        );
        return {
          records: mergedRecords,
          sourceLabel: savedLabel || 'Google Spreadsheet (Data Unggahan/Sinkronisasi)',
          isCustom: true,
          validationSummary,
        };
      }
    }
  } catch (e) {
    console.warn('Gagal membaca custom records dari localStorage:', e);
  }

  const { mergedRecords, validationSummary } = mergeAgustusWithBonusStoreData(
    baseAgustusRecords,
    currentBonusPackage
  );

  return {
    records: mergedRecords,
    sourceLabel:
      'Google Spreadsheet (ID: 10TgEJyFSJkD6yfV8t_QgGH9jJJ_NppIXlCUsvVuB6lY • Sheets: INSENTIF AGUSTUS & Bonus Store)',
    isCustom: false,
    validationSummary,
  };
}

/**
 * Saves a custom dataset (e.g. from Excel file upload or fresh sync) to localStorage
 */
export function saveCustomRecords(records: IncentiveRecord[], label: string) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEY_LABEL, label);
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
  }
}

/**
 * Resets back to the default dataset
 */
export function clearCustomRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    localStorage.removeItem(STORAGE_KEY_LABEL);
  } catch (e) {
    console.warn('Gagal menghapus custom records:', e);
  }
}

/**
 * Returns grouped SalesEmployee objects based on given records or active records
 */
export function getSalesEmployees(customRecords?: IncentiveRecord[]): SalesEmployee[] {
  const records = customRecords || getActiveRecords().records;
  return groupRecordsByEmployee(records);
}

/**
 * Finds a single sales employee by NIP
 */
export function findSalesByNip(nip: string, customRecords?: IncentiveRecord[]): SalesEmployee | undefined {
  const cleanNip = String(nip).trim();
  const employees = getSalesEmployees(customRecords);
  return employees.find((e) => String(e.nip).trim() === cleanNip);
}

/**
 * Calculates overall incentive summary across all sales employees and all transactions
 */
export function getOverallIncentiveSummary(
  records: IncentiveRecord[],
  employees: SalesEmployee[],
  customValidation?: ValidationSummary
): OverallIncentiveSummary {
  let totalInsentif = 0;
  let totalPositive = 0;
  let totalNegative = 0;
  let totalBonusStore = 0;

  const typeMap = new Map<string, { total: number; count: number; positive: number; negative: number }>();
  const deptMap = new Map<string, { total: number; count: number; employees: Set<string> }>();

  for (const rec of records) {
    // Only accumulate insentif penjualan for regular transactions (not bonus-store-only placeholders)
    if (!rec.isBonusStoreOnly) {
      totalInsentif += rec.jumlahInsentif;
      if (rec.jumlahInsentif >= 0) {
        totalPositive += rec.jumlahInsentif;
      } else {
        totalNegative += rec.jumlahInsentif;
      }

      // Tipe insentif
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

      // Department
      const deptKey = rec.departement || '(Tanpa Dept)';
      if (!deptMap.has(deptKey)) {
        deptMap.set(deptKey, { total: 0, count: 0, employees: new Set<string>() });
      }
      const dStat = deptMap.get(deptKey)!;
      dStat.total += rec.jumlahInsentif;
      dStat.count += 1;
      if (rec.nip) dStat.employees.add(rec.nip);
    }
  }

  // Calculate total bonus store from employees
  for (const emp of employees) {
    totalBonusStore += emp.bonusStoreAmount || 0;
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

  const departmentSummaries: DepartmentSummary[] = Array.from(deptMap.entries())
    .map(([department, stats]) => ({
      department,
      total: stats.total,
      count: stats.count,
      employeeCount: stats.employees.size,
    }))
    .sort((a, b) => b.total - a.total);

  const validationSummary: ValidationSummary = customValidation || getActiveRecords().validationSummary;

  return {
    totalInsentif,
    totalPositive,
    totalNegative,
    totalTransactions: records.filter((r) => !r.isBonusStoreOnly).length,
    totalEmployees: employees.length,
    typeSummaries,
    departmentSummaries,
    totalBonusStore,
    totalTakeHomePay: totalInsentif + totalBonusStore,
    validationSummary,
  };
}
