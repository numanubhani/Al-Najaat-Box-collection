/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DonationBox, Collector, CollectionRecord, IssueReport, BoxDemand, ExpenseRecord, NotificationItem, UserRegistration, Role } from './types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Simple token storage
const getHeaders = () => {
  const token = localStorage.getItem('pwa_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: { email: string; name: string; role: Role; collectorId?: string } }> => {
      const resp = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Authentication failed');
      }
      const data = await resp.json();
      localStorage.setItem('pwa_auth_token', data.token);
      return data;
    },
    
    register: async (name: string, email: string, phone: string, role: string): Promise<UserRegistration> => {
      const resp = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, phone, role }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Registration request failed.');
      }
      return resp.json();
    },

    getRegistrations: async (): Promise<UserRegistration[]> => {
      const resp = await fetch(`${API_BASE_URL}/auth/registrations/`, {
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Failed to load credentials registrations');
      return resp.json();
    },

    approveRegistration: async (id: string): Promise<void> => {
      const resp = await fetch(`${API_BASE_URL}/auth/registrations/${id}/approve/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Approval error');
    },

    rejectRegistration: async (id: string): Promise<void> => {
      const resp = await fetch(`${API_BASE_URL}/auth/registrations/${id}/reject/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Rejection error');
    }
  },

  // Donation Boxes
  boxes: {
    list: async (): Promise<DonationBox[]> => {
      const resp = await fetch(`${API_BASE_URL}/boxes/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to fetch donation boxes');
      return resp.json();
    },
    create: async (box: Omit<DonationBox, 'id'>): Promise<DonationBox> => {
      const resp = await fetch(`${API_BASE_URL}/boxes/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(box),
      });
      if (!resp.ok) throw new Error('Failed to create donation box');
      return resp.json();
    },
    update: async (box: DonationBox): Promise<DonationBox> => {
      const resp = await fetch(`${API_BASE_URL}/boxes/${box.id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(box),
      });
      if (!resp.ok) throw new Error('Failed to update box details');
      return resp.json();
    },
    patchStatus: async (id: string, status: string): Promise<DonationBox> => {
      const resp = await fetch(`${API_BASE_URL}/boxes/${id}/change_status/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error('Status patch collection failed');
      return resp.json();
    },
    delete: async (id: string): Promise<void> => {
      const resp = await fetch(`${API_BASE_URL}/boxes/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Failed to destroy box ledger node');
    }
  },

  // Collectors
  collectors: {
    list: async (): Promise<Collector[]> => {
      const resp = await fetch(`${API_BASE_URL}/collectors/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to fetch collectors');
      return resp.json();
    },
    updateStatus: async (id: string, status: 'Active' | 'Disabled'): Promise<Collector> => {
      const resp = await fetch(`${API_BASE_URL}/collectors/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error('Status update error');
      return resp.json();
    },
    resetPassword: async (id: string, password: string): Promise<{ status: string; message: string }> => {
      const resp = await fetch(`${API_BASE_URL}/collectors/${id}/reset_password/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Password reset failed');
      }
      return resp.json();
    },
  },

  // Collection records
  collections: {
    list: async (): Promise<CollectionRecord[]> => {
      const resp = await fetch(`${API_BASE_URL}/collections/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to pull collection history');
      return resp.json();
    },
    create: async (record: Omit<CollectionRecord, 'id' | 'date'>): Promise<CollectionRecord> => {
      const resp = await fetch(`${API_BASE_URL}/collections/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(record),
      });
      if (!resp.ok) throw new Error('Failed to log collection audit');
      return resp.json();
    }
  },

  // Issue reporting
  issues: {
    list: async (): Promise<IssueReport[]> => {
      const resp = await fetch(`${API_BASE_URL}/issues/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to pull incident issues');
      return resp.json();
    },
    create: async (issue: Omit<IssueReport, 'id' | 'date' | 'status' | 'collectorName'>): Promise<IssueReport> => {
      const resp = await fetch(`${API_BASE_URL}/issues/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(issue),
      });
      if (!resp.ok) throw new Error('Incident register error');
      return resp.json();
    },
    updateStatus: async (id: string, status: 'Pending' | 'Resolved'): Promise<IssueReport> => {
      const resp = await fetch(`${API_BASE_URL}/issues/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error('Incident update error');
      return resp.json();
    }
  },

  // Placement demands
  demands: {
    list: async (): Promise<BoxDemand[]> => {
      const resp = await fetch(`${API_BASE_URL}/demands/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to load location placements');
      return resp.json();
    },
    create: async (demand: Omit<BoxDemand, 'id' | 'date' | 'status' | 'collectorName'>): Promise<BoxDemand> => {
      const resp = await fetch(`${API_BASE_URL}/demands/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(demand),
      });
      if (!resp.ok) throw new Error('Failed to draft location placement');
      return resp.json();
    },
    updateStatus: async (id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<BoxDemand> => {
      const resp = await fetch(`${API_BASE_URL}/demands/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error('Failed to process demand node');
      return resp.json();
    }
  },

  // Expenses records
  expenses: {
    list: async (): Promise<ExpenseRecord[]> => {
      const resp = await fetch(`${API_BASE_URL}/expenses/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to collect dynamic field expenses');
      return resp.json();
    },
    create: async (expense: Omit<ExpenseRecord, 'id' | 'date' | 'status' | 'collectorId' | 'collectorName'>): Promise<ExpenseRecord> => {
      const resp = await fetch(`${API_BASE_URL}/expenses/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expense),
      });
      if (!resp.ok) throw new Error('Failed to document fuel expenditure');
      return resp.json();
    },
    updateStatus: async (id: string, status: 'Approved' | 'Pending' | 'Rejected'): Promise<ExpenseRecord> => {
      const resp = await fetch(`${API_BASE_URL}/expenses/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error('Failed to update receipt clearance');
      return resp.json();
    }
  },

  // Notifications
  notifications: {
    list: async (): Promise<NotificationItem[]> => {
      const resp = await fetch(`${API_BASE_URL}/notifications/`, { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to retrieve system broadcast signals');
      return resp.json();
    },
    markRead: async (id: string): Promise<void> => {
      const resp = await fetch(`${API_BASE_URL}/notifications/${id}/mark_read/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Failed to clear channel light');
    },
    markAllRead: async (): Promise<void> => {
      const resp = await fetch(`${API_BASE_URL}/notifications/mark_all_read/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!resp.ok) throw new Error('Failed to clear alerts network');
    }
  }
};
