export interface Employee {
  id: string;
  empCode: string;
  name: string;
  surname: string;
  gender: 'Male' | 'Female' | 'Transgender' | string;
  guardian: string; // Father's/Spouse Name
  dob: string;
  nationality: string;
  education: string;
  doj: string; // Date of Joining
  designation: string;
  category: 'Skilled' | 'Semi-Skilled' | 'Un Skilled' | string;
  employmentType: string;
  mobile: string;
  uan: string;
  pan: string;
  esic: string;
  lwf: string;
  aadhar: string;
  bankAccount: string;
  bank: string;
  ifsc: string;
  presentAddress: string;
  permanentAddress: string;
  serviceBook: string;
  exitDate?: string;
  exitReason?: string;
  identification: string;
  photo?: string;
  signature?: string;
  remarks?: string;
  jobLocation: string;
  createdAt?: string;
}

export type TabType = 'all' | 'skilled' | 'semi-skilled' | 'unskilled' | 'exited';

export type UserRole = 'admin' | 'hr_manager' | 'viewer' | 'employee';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  mobile?: string;
  email?: string;
  lastLogin?: string;
}

export interface UserAccount extends AuthUser {
  password: string;
  mobile: string;
  createdAt: string;
}

export interface RolePermissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canResetData: boolean;
  canManageUsers: boolean;
  canManageCredentials: boolean;
  canExport: boolean;
  canViewDetails: boolean;
}

export type ActiveView = 'employees' | 'form_c' | 'form_d';

export type FormCRecoveryType = 'Damage' | 'Loss' | 'Fine' | 'Advance' | 'Loans';

export interface FormCRecord {
  id: string;
  slNo: number; // SI. No. in Employee register
  empCode: string;
  name: string;
  recoveryType: FormCRecoveryType;
  particulars: string;
  dateOfDamageLoss: string; // Date of Damage/Loss*
  amount: number; // Amount
  whetherShowCauseIssued: string; // Whether Show Cause issued*
  explanationHeardInPresenceOf: string; // Explanation heard in presence of*
  numberOfInstalments: number; // Number of Instalments
  firstMonthYear: string; // First Month /Year
  lastMonthYear: string; // Last Month /Year
  dateOfCompleteRecovery: string; // Date of Complete Recovery
  remarks: string; // Remarks
  createdAt?: string;
}

export type AttendanceStatus = 'P' | 'A' | 'WO' | 'HD' | 'L';

export interface FormDRecord {
  id: string;
  srNo: number; // Sr No.
  empCode: string;
  name: string; // Name
  placeOfWork: string; // Place of work*
  doj: string; // DOJ
  month: string; // e.g. "September"
  year: number; // e.g. 2024
  // Map of day 1..31 to status ('P' | 'A' | 'WO' | 'HD' | 'L' or custom hours)
  dailyAttendance: Record<number, string>;
  dailyHours?: Record<number, number>;
  summaryDays: number; // Summary No. of Days
  remarksNoOfHours: string; // Remarks No. of hours
  registerKeeperSignature?: string; // **Signature of Register Keeper
  updatedAt?: string;
}
