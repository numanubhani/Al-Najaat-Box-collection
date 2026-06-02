/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Admin' | 'Collector';

export interface DonationBox {
  id: string; // e.g. "BOX-0001"
  donorName: string;
  address: string;
  city: string;
  contactNumber: string;
  collectorId: string; // assigned collector
  installationDate: string;
  status: 'Active' | 'Inactive' | 'Damaged' | 'Missing';
  notes?: string;
  mapLink?: string; // Interactive Google Maps locator link
}

export interface Collector {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Disabled';
}

export interface CollectionRecord {
  id: string;
  date: string;
  donorName: string;
  address: string;
  boxId: string;
  collectorName: string;
  collectorId: string;
  amount: number;
  notes?: string;
}

export interface IssueReport {
  id: string;
  boxId: string;
  issueType: 'Damaged Box' | 'Missing Box' | 'Locked' | 'Full Box' | 'Relocation Required' | 'Other';
  description: string;
  photoUrl?: string; // data URI or placeholder
  date: string;
  status: 'Pending' | 'Resolved';
  collectorName: string;
}

export interface BoxDemand {
  id: string;
  suggestedLocation: string;
  address: string;
  city: string;
  contactPerson: string;
  contactNumber: string;
  estimatedTraffic: string;
  notes?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  collectorName: string;
}

export interface NotificationItem {
  id: string;
  type: 'collection' | 'issue' | 'demand';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface ExpenseRecord {
  id: string;
  collectorId: string;
  collectorName: string;
  category: 'Petrol' | 'Bike Puncture' | 'Food' | 'Hardware' | 'Other';
  amount: number;
  description: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Start with no pre-seeded data
export const INITIAL_EXPENSES: ExpenseRecord[] = [];

export interface UserRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export const INITIAL_COLLECTORS: Collector[] = [];

export const INITIAL_BOXES: DonationBox[] = [];

export const INITIAL_COLLECTIONS: CollectionRecord[] = [];

export const INITIAL_ISSUES: IssueReport[] = [];

export const INITIAL_DEMANDS: BoxDemand[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
