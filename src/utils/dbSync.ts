import { Employee } from '../types';

export interface DbStatus {
  configured: boolean;
  connected: boolean;
  host: string;
  database: string;
  user: string;
  port: number;
  error?: string;
  lastChecked?: string;
  targetPlatform?: string;
  helpGuide?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
}

export async function fetchDbStatus(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/db-status');
    if (!res.ok) {
      return {
        configured: false,
        connected: false,
        host: '',
        database: '',
        user: '',
        port: 3306,
        error: 'Hostinger MySQL database configuration awaiting credentials. Review the setup guide below to connect gloziyofire.com / gloziyoemp.com.',
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      connected: false,
      host: '',
      database: '',
      user: '',
      port: 3306,
      error: err.message || 'Failed to reach backend API',
    };
  }
}

export async function reconnectDb(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/db-reconnect', { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      connected: false,
      host: '',
      database: '',
      user: '',
      port: 3306,
      error: err.message,
    };
  }
}

export async function fetchRemoteEmployees(): Promise<Employee[] | null> {
  try {
    const res = await fetch('/api/employees');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveRemoteEmployee(employee: Employee): Promise<boolean> {
  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteRemoteEmployee(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function bulkSyncToRemote(employees: Employee[]): Promise<{ success: boolean; synced: number }> {
  try {
    const res = await fetch('/api/employees/bulk-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees }),
    });
    if (!res.ok) return { success: false, synced: 0 };
    return await res.json();
  } catch {
    return { success: false, synced: 0 };
  }
}
