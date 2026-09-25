import { UserRole, RolePermissions, UserAccount } from '../types';

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    role: UserRole;
    name: string;
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    description: string;
    permissions: RolePermissions;
  }
> = {
  admin: {
    role: 'admin',
    name: 'Administrator',
    label: 'Admin',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Full administrative access: Add, edit, and delete employee records, manage users and user credentials (password & mobile number), and reset datasets.',
    permissions: {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canResetData: true,
      canManageUsers: true,
      canManageCredentials: true,
      canExport: true,
      canViewDetails: true,
    },
  },
  hr_manager: {
    role: 'hr_manager',
    name: 'HR Manager',
    label: 'HR Manager',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Operational HR access: Create and edit employee records and export reports. Deletion, credential changes, and system resets are restricted.',
    permissions: {
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canResetData: false,
      canManageUsers: false,
      canManageCredentials: false,
      canExport: true,
      canViewDetails: true,
    },
  },
  viewer: {
    role: 'viewer',
    name: 'Viewer / Auditor',
    label: 'Viewer',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    description: 'Read-only access: View employee registers, compliance details, signatures, and export reports. Editing, deletion, and credential changes are restricted.',
    permissions: {
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canResetData: false,
      canManageUsers: false,
      canManageCredentials: false,
      canExport: true,
      canViewDetails: true,
    },
  },
  employee: {
    role: 'employee',
    name: 'Employee',
    label: 'Employee',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    description: 'Add employee details only: Permitted to add new employee records into the master register only. Viewing other employees details, Form C and Form D access, editing existing records, permanent deletion, credential management, and exports are restricted.',
    permissions: {
      canAdd: true,
      canEdit: false,
      canDelete: false,
      canResetData: false,
      canManageUsers: false,
      canManageCredentials: false,
      canExport: false,
      canViewDetails: false,
    },
  },
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin123',
    name: 'Sarah Connor',
    role: 'admin',
    email: 'admin@company.com',
    mobile: '+91 98765 43210',
    createdAt: '2024-01-01',
  },
  {
    id: 'user-2',
    username: 'hrmanager',
    password: 'hr123',
    name: 'Rajesh Sharma',
    role: 'hr_manager',
    email: 'r.sharma@company.com',
    mobile: '+91 98123 45678',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-3',
    username: 'viewer',
    password: 'viewer123',
    name: 'Elena Rostova',
    role: 'viewer',
    email: 'auditor@company.com',
    mobile: '+91 98456 78901',
    createdAt: '2024-02-01',
  },
  {
    id: 'user-4',
    username: 'employee',
    password: 'emp123',
    name: 'Vikram Patel',
    role: 'employee',
    email: 'v.patel@company.com',
    mobile: '+91 98321 65490',
    createdAt: '2024-03-01',
  },
];

export const ACCOUNTS_STORAGE_KEY = 'ems_user_accounts_v1';

export function getStoredAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const accountsList: UserAccount[] = parsed.map((acc: any, idx: number) => ({
          ...acc,
          mobile: acc.mobile || (acc.username === 'admin' ? '+91 98765 43210' : acc.username === 'hrmanager' ? '+91 98123 45678' : `+91 98456 ${10000 + idx}`),
        }));

        // Ensure default employee account is present if not already added
        if (!accountsList.some(a => a.role === 'employee' || a.username === 'employee')) {
          const defaultEmp = INITIAL_USER_ACCOUNTS.find(a => a.role === 'employee');
          if (defaultEmp) {
            accountsList.push(defaultEmp);
          }
        }

        return accountsList;
      }
    }
  } catch (err) {
    console.error('Failed to load accounts from storage', err);
  }
  return INITIAL_USER_ACCOUNTS;
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to storage', err);
  }
}

export function getPermissions(role: UserRole): RolePermissions {
  const def = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.viewer;
  return def.permissions;
}

export function getRoleInfo(role: UserRole) {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.viewer;
}

export const ROLE_TITLES_STORAGE_KEY = 'ems_role_titles_v1';

export const DEFAULT_ROLE_TITLES: Record<UserRole, string> = {
  admin: 'Administrator',
  hr_manager: 'HR Manager',
  viewer: 'Viewer',
  employee: 'Employee',
};

export function getStoredRoleTitles(): Record<UserRole, string> {
  try {
    const data = localStorage.getItem(ROLE_TITLES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          admin: parsed.admin || DEFAULT_ROLE_TITLES.admin,
          hr_manager: parsed.hr_manager || DEFAULT_ROLE_TITLES.hr_manager,
          viewer: parsed.viewer || DEFAULT_ROLE_TITLES.viewer,
          employee: parsed.employee || DEFAULT_ROLE_TITLES.employee,
        };
      }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_ROLE_TITLES };
}

export function saveStoredRoleTitles(titles: Record<UserRole, string>): void {
  try {
    localStorage.setItem(ROLE_TITLES_STORAGE_KEY, JSON.stringify(titles));
  } catch (err) {
    console.error('Failed to save role titles to storage', err);
  }
}
