export interface IncentiveRecord {
  id: string;
  nip: string; // Compared strictly as string
  nama: string;
  tipeInsentif: string;
  departement: string;
  noReceipt: string;
  sku: string;
  jumlahInsentif: number;

  // New columns from "Bonus Store" sheet (joined by NIP)
  bonusStoreValues?: Record<string, any>; // Dynamic columns detected from Bonus Store header
  bonusStoreAmount?: number; // Numeric value of bonus from Bonus Store
  isBonusStoreOnly?: boolean; // True if NIP only exists in Bonus Store
  matchingStatus: 'matched' | 'agustus_only' | 'bonus_only';
}

export interface IncentiveTypeSummary {
  type: string;
  total: number;
  count: number;
  positiveTotal: number;
  negativeTotal: number;
}

export interface DepartmentSummary {
  department: string;
  total: number;
  count: number;
  employeeCount: number;
}

export interface BonusStoreDataPackage {
  spreadsheetId: string;
  sheetName: string;
  gid: string;
  range: string;
  headers: string[]; // Dynamically detected header columns
  totalRows: number;
  rows: Record<string, any>[];
  fetchedAt: string;
}

export interface ValidationSummary {
  agustusRowCount: number; // e.g. 11067
  bonusStoreRowCount: number; // e.g. 219
  agustusUniqueNipCount: number; // e.g. 122
  bonusStoreUniqueNipCount: number; // e.g. 219
  matchedNipCount: number; // e.g. 120
  agustusOnlyNips: string[]; // e.g. ['179589', '105326'] (2 NIP)
  bonusStoreOnlyNips: string[]; // e.g. 99 NIP
  bonusStoreHeaders: string[]; // e.g. ['nip', 'nama', 'bonus']
  totalBonusStoreMatched: number; // Total bonus for matched sales
  totalBonusStoreUnmatched: number; // Total bonus for bonus-only sales
  totalBonusStoreAll: number; // Total bonus for all 219 store sales
}

export interface OverallIncentiveSummary {
  totalInsentif: number; // Insentif penjualan Agustus
  totalPositive: number;
  totalNegative: number;
  totalTransactions: number;
  totalEmployees: number; // All active sales
  typeSummaries: IncentiveTypeSummary[];
  departmentSummaries: DepartmentSummary[];

  // Bonus store overall statistics
  totalBonusStore: number;
  totalTakeHomePay: number; // totalInsentif + totalBonusStore
  validationSummary: ValidationSummary;
}

export interface SalesEmployee {
  nip: string;
  nama: string;
  defaultPassword: string; // last 3 digits of NIP
  totalInsentif: number; // Insentif penjualan Agustus
  totalPositive: number;
  totalNegative: number;
  transactionCount: number;
  departments: string[];
  records: IncentiveRecord[];
  typeSummaries: IncentiveTypeSummary[];

  // Bonus Store fields for this employee
  bonusStoreAmount: number; // Bonus from Bonus Store (0 if not in Bonus Store)
  totalTakeHomePay: number; // totalInsentif + bonusStoreAmount
  bonusStoreData?: Record<string, any>;
  matchingStatus: 'matched' | 'agustus_only' | 'bonus_only';
  isBonusStoreOnly?: boolean;
}
