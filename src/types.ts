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

// Initial high-fidelity seed data
export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-101',
    collectorId: 'COL-001',
    collectorName: 'John Smith',
    category: 'Petrol',
    amount: 15.00,
    description: 'Fuel for weekly route coverage across Sector G.',
    date: '2026-05-29',
    status: 'Approved',
  },
  {
    id: 'EXP-102',
    collectorId: 'COL-001',
    collectorName: 'John Smith',
    category: 'Bike Puncture',
    amount: 5.50,
    description: 'Rear tire repair near Main Market.',
    date: '2026-05-31',
    status: 'Approved',
  }
];

export interface UserRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export const INITIAL_COLLECTORS: Collector[] = [
  { id: 'COL-001', name: 'John Smith', phone: '+1 (555) 234-5678', email: 'john.smith@helperngo.org', status: 'Active' },
  { id: 'COL-002', name: 'Naib Khan', phone: '+92 (300) 123-4567', email: 'naib@gmail.com', status: 'Active' },
];

export const INITIAL_BOXES: DonationBox[] = [
  {
    id: 'BOX-0001',
    donorName: 'ABC Grocery Store',
    address: '142 Main Market Road, Sector G',
    city: 'Houston',
    contactNumber: '+1 (555) 890-1234',
    collectorId: 'COL-001',
    installationDate: '2026-01-15',
    status: 'Active',
    notes: 'Placed right next to the entrance register.',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=142+Main+Market+Road+Houston'
  },
  {
    id: 'BOX-0002',
    donorName: 'Starlight Pharmacy',
    address: '405 Broadway Ave, Plaza Suite A',
    city: 'New York',
    contactNumber: '+1 (555) 111-2222',
    collectorId: 'COL-001',
    installationDate: '2026-02-10',
    status: 'Active',
    notes: 'Premium placement on the checkout counter.',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=405+Broadway+Ave+New+York'
  },
  {
    id: 'BOX-0003',
    donorName: 'Downtown Community Center',
    address: '88 Park Plaza Blvd',
    city: 'Dallas',
    contactNumber: '+1 (555) 333-4444',
    collectorId: 'COL-001',
    installationDate: '2026-03-01',
    status: 'Damaged',
    notes: 'Lock is slightly rusty; door gets sticky.',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=88+Park+Plaza+Blvd+Dallas'
  },
  {
    id: 'BOX-0004',
    donorName: 'The Cozy Cup Cafe',
    address: '12 Coffee Lane, Old Town',
    city: 'Austin',
    contactNumber: '+1 (555) 555-6666',
    collectorId: 'COL-001',
    installationDate: '2026-04-18',
    status: 'Active',
    notes: 'High traffic cafe, very popular on weekends.',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=12+Coffee+Lane+Austin'
  },
  {
    id: 'BOX-0005',
    donorName: 'Metro Transit Terminal',
    address: '500 Central Station Concourse',
    city: 'Chicago',
    contactNumber: '+1 (555) 777-8888',
    collectorId: 'COL-001',
    installationDate: '2026-05-02',
    status: 'Missing',
    notes: 'Reporter claims it was not in the usual spot.',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=500+Central+Station+Chicago'
  },
];

export const INITIAL_COLLECTIONS: CollectionRecord[] = [
  {
    id: 'COLLECT-101',
    date: '2026-05-28',
    donorName: 'ABC Grocery Store',
    address: '142 Main Market Road, Sector G',
    boxId: 'BOX-0001',
    collectorName: 'John Smith',
    collectorId: 'COL-001',
    amount: 154.50,
    notes: 'Box was almost full. Standard collection.',
  },
  {
    id: 'COLLECT-102',
    date: '2026-05-29',
    donorName: 'Starlight Pharmacy',
    address: '405 Broadway Ave, Plaza Suite A',
    boxId: 'BOX-0002',
    collectorName: 'Amina Khan',
    collectorId: 'COL-002',
    amount: 210.00,
    notes: 'Amazing turnout because of the pharmacy sale event.',
  },
  {
    id: 'COLLECT-103',
    date: '2026-05-30',
    donorName: 'The Cozy Cup Cafe',
    address: '12 Coffee Lane, Old Town',
    boxId: 'BOX-0004',
    collectorName: 'John Smith',
    collectorId: 'COL-001',
    amount: 85.00,
    notes: 'Collected early morning. Box clean.',
  },
  {
    id: 'COLLECT-104',
    date: '2026-05-31',
    donorName: 'ABC Grocery Store',
    address: '142 Main Market Road, Sector G',
    boxId: 'BOX-0001',
    collectorName: 'John Smith',
    collectorId: 'COL-001',
    amount: 125.00,
    notes: 'Weekend collection loop.',
  },
  {
    id: 'COLLECT-105',
    date: '2026-06-01',
    donorName: 'Starlight Pharmacy',
    address: '405 Broadway Ave, Plaza Suite A',
    boxId: 'BOX-0002',
    collectorName: 'Amina Khan',
    collectorId: 'COL-002',
    amount: 180.00,
    notes: 'Start of the month collection.',
  }
];

export const INITIAL_ISSUES: IssueReport[] = [
  {
    id: 'ISS-001',
    boxId: 'BOX-0003',
    issueType: 'Damaged Box',
    description: 'The front acrylic panel is light scratched and the side hinge feels loose, needs restoration or reinforcement.',
    date: '2026-05-29',
    status: 'Pending',
    collectorName: 'Rashid Ali',
  },
  {
    id: 'ISS-002',
    boxId: 'BOX-0005',
    issueType: 'Missing Box',
    description: 'The transit terminal layout shifted and the box is nowhere to be found at its assigned post. Inquired station manager.',
    date: '2026-05-30',
    status: 'Pending',
    collectorName: 'Jane Doe',
  },
  {
    id: 'ISS-003',
    boxId: 'BOX-0001',
    issueType: 'Full Box',
    description: 'Heavily packed. Collected early to empty it.',
    date: '2026-05-25',
    status: 'Resolved',
    collectorName: 'John Smith',
  }
];

export const INITIAL_DEMANDS: BoxDemand[] = [
  {
    id: 'DEM-001',
    suggestedLocation: 'Metro Gym & Wellness Center',
    address: '77 Fitness Avenue, 2nd Floor Lobby',
    city: 'Austin',
    contactPerson: 'David Miller (Manager)',
    contactNumber: '+1 (555) 909-8765',
    estimatedTraffic: '1,200+ members daily',
    notes: 'Great interest from management to support organic health funding!',
    date: '2026-05-30',
    status: 'Pending',
    collectorName: 'John Smith',
  },
  {
    id: 'DEM-002',
    suggestedLocation: 'Grand Central Bookstore',
    address: '320 Reader Ave',
    city: 'New York',
    contactPerson: 'Sarah Jenkins',
    contactNumber: '+1 (555) 443-2211',
    estimatedTraffic: '500+ book lovers daily',
    notes: 'Bookstore willing to provide dedicated display space on checkout desk.',
    date: '2026-05-31',
    status: 'Approved',
    collectorName: 'Amina Khan',
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOT-001',
    type: 'issue',
    title: 'New Issue: Missing Box',
    description: 'Jane Doe reported BOX-0005 at Metro Transit Terminal is missing.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'NOT-002',
    type: 'demand',
    title: 'New Box Demand Submitted',
    description: 'John Smith suggested a placement at Metro Gym & Wellness Center.',
    time: '4 hours ago',
    read: false,
  },
  {
    id: 'NOT-003',
    type: 'collection',
    title: 'New Collection Recorded',
    description: 'Amina Khan collected $180.00 from Box ID: BOX-0002.',
    time: '6 hours ago',
    read: true,
  }
];
