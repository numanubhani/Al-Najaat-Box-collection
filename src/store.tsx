/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  DonationBox,
  Collector,
  CollectionRecord,
  IssueReport,
  BoxDemand,
  NotificationItem,
  ExpenseRecord,
  UserRegistration,
  INITIAL_COLLECTORS,
  INITIAL_BOXES,
  INITIAL_COLLECTIONS,
  INITIAL_ISSUES,
  INITIAL_DEMANDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPENSES,
} from './types';

interface NGOContextType {
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  userEmail: string;
  login: (email: string, role: Role) => void;
  logout: () => void;
  
  registrations: UserRegistration[];
  registerUser: (name: string, email: string, phone: string, role: Role) => void;
  approveRegistration: (id: string) => void;
  rejectRegistration: (id: string) => void;
  
  donationBoxes: DonationBox[];
  createDonationBox: (box: Omit<DonationBox, 'id'>) => DonationBox;
  updateDonationBox: (box: DonationBox) => void;
  deleteDonationBox: (id: string) => void;
  
  collectors: Collector[];
  updateCollectorStatus: (id: string, status: 'Active' | 'Disabled') => void;
  
  collections: CollectionRecord[];
  addCollection: (record: Omit<CollectionRecord, 'id' | 'date'>) => CollectionRecord;
  
  issueReports: IssueReport[];
  addIssueReport: (issue: Omit<IssueReport, 'id' | 'date' | 'status' | 'collectorName'>) => IssueReport;
  updateIssueStatus: (id: string, status: 'Pending' | 'Resolved') => void;
  
  boxDemands: BoxDemand[];
  addBoxDemand: (demand: Omit<BoxDemand, 'id' | 'date' | 'status' | 'collectorName'>) => BoxDemand;
  updateDemandStatus: (id: string, status: 'Pending' | 'Approved' | 'Rejected') => void;

  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'date' | 'status' | 'collectorId' | 'collectorName'>) => ExpenseRecord;
  updateExpenseStatus: (id: string, status: 'Approved' | 'Pending' | 'Rejected') => void;
  
  notifications: NotificationItem[];
  addNotification: (type: 'collection' | 'issue' | 'demand', title: string, description: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  totalExpenses: number;
  setTotalExpenses: (val: number) => void;
  commissionRate: number; // 0.15 for 15%

  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export const NGOStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('ngo_role') as Role) || 'Admin');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('ngo_logged_in') === 'true');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('ngo_user_email') || 'Admin@gmail.com');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('ngo_theme');
    return (cached === 'dark' || cached === 'light') ? cached : 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('ngo_theme', theme);
  }, [theme]);
  
  const [donationBoxes, setDonationBoxes] = useState<DonationBox[]>(() => {
    const cached = localStorage.getItem('ngo_donation_boxes');
    return cached ? JSON.parse(cached) : INITIAL_BOXES;
  });
  
  const [collectors, setCollectors] = useState<Collector[]>(() => {
    const cached = localStorage.getItem('ngo_collectors');
    return cached ? JSON.parse(cached) : INITIAL_COLLECTORS;
  });

  const [registrations, setRegistrations] = useState<UserRegistration[]>(() => {
    const cached = localStorage.getItem('ngo_registrations');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'REG-101',
        name: 'Sajid Khan',
        email: 'sajid@gmail.com',
        phone: '+92 (315) 987-6543',
        role: 'Collector',
        status: 'Pending',
        date: '2026-06-01'
      },
      {
        id: 'REG-102',
        name: 'Arsalan Shah',
        email: 'arsalan@gmail.com',
        phone: '+92 (333) 222-1111',
        role: 'Collector',
        status: 'Pending',
        date: '2026-06-01'
      }
    ];
  });
  
  const [collections, setCollections] = useState<CollectionRecord[]>(() => {
    const cached = localStorage.getItem('ngo_collections');
    return cached ? JSON.parse(cached) : INITIAL_COLLECTIONS;
  });
  
  const [issueReports, setIssueReports] = useState<IssueReport[]>(() => {
    const cached = localStorage.getItem('ngo_issue_reports');
    return cached ? JSON.parse(cached) : INITIAL_ISSUES;
  });
  
  const [boxDemands, setBoxDemands] = useState<BoxDemand[]>(() => {
    const cached = localStorage.getItem('ngo_box_demands');
    return cached ? JSON.parse(cached) : INITIAL_DEMANDS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const cached = localStorage.getItem('ngo_expenses');
    return cached ? JSON.parse(cached) : INITIAL_EXPENSES;
  });
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('ngo_notifications');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  const [totalExpenses, setTotalExpenses] = useState<number>(() => {
    const cachedExpenses = localStorage.getItem('ngo_expenses');
    const list: ExpenseRecord[] = cachedExpenses ? JSON.parse(cachedExpenses) : INITIAL_EXPENSES;
    return list.filter(e => e.status !== 'Rejected').reduce((sum, item) => sum + item.amount, 0);
  });
  const commissionRate = 0.15; // 15% Commission

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ngo_donation_boxes', JSON.stringify(donationBoxes));
  }, [donationBoxes]);
  
  useEffect(() => {
    localStorage.setItem('ngo_collectors', JSON.stringify(collectors));
  }, [collectors]);
  
  useEffect(() => {
    localStorage.setItem('ngo_collections', JSON.stringify(collections));
  }, [collections]);
  
  useEffect(() => {
    localStorage.setItem('ngo_issue_reports', JSON.stringify(issueReports));
  }, [issueReports]);
  
  useEffect(() => {
    localStorage.setItem('ngo_box_demands', JSON.stringify(boxDemands));
  }, [boxDemands]);

  useEffect(() => {
    localStorage.setItem('ngo_expenses', JSON.stringify(expenses));
    // Recompute total expenses
    const sum = expenses.filter(e => e.status !== 'Rejected').reduce((s, item) => s + item.amount, 0);
    setTotalExpenses(sum);
  }, [expenses]);
  
  useEffect(() => {
    localStorage.setItem('ngo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ngo_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Auth simulators
  const login = (email: string, chosenRole: Role) => {
    setUserEmail(email);
    setRole(chosenRole);
    setIsLoggedIn(true);
    localStorage.setItem('ngo_logged_in', 'true');
    localStorage.setItem('ngo_role', chosenRole);
    localStorage.setItem('ngo_user_email', email);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('ngo_logged_in', 'false');
  };

  const registerUser = (name: string, email: string, phone: string, chosenRole: Role) => {
    const newReg: UserRegistration = {
      id: `REG-${100 + registrations.length + 1}`,
      name,
      email,
      phone,
      role: chosenRole,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setRegistrations((prev) => [newReg, ...prev]);
    addNotification('demand', 'New Account Registration Created', `${name} brand-new registration for ${chosenRole}. Approval required.`);
  };

  const approveRegistration = (id: string) => {
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (reg.id === id) {
          if (reg.role === 'Collector') {
            const nextNum = collectors.length + 1;
            const colId = `COL-00${nextNum}`;
            const alreadyExists = collectors.some(c => c.email.toLowerCase() === reg.email.toLowerCase());
            if (!alreadyExists) {
              setCollectors((curr) => [
                ...curr,
                {
                  id: colId,
                  name: reg.name,
                  phone: reg.phone,
                  email: reg.email,
                  status: 'Active'
                }
              ]);
            }
          }
          addNotification('demand', 'Registration Approved', `Staff ${reg.name} was approved for ${reg.role} role.`);
          return { ...reg, status: 'Approved' };
        }
        return reg;
      })
    );
  };

  const rejectRegistration = (id: string) => {
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (reg.id === id) {
          addNotification('demand', 'Registration Rejected', `Staff ${reg.name} was rejected.`);
          return { ...reg, status: 'Rejected' };
        }
        return reg;
      })
    );
  };

  // Notification engine
  const addNotification = (type: 'collection' | 'issue' | 'demand', title: string, description: string) => {
    const newNotif: NotificationItem = {
      id: `NOT-${Date.now()}`,
      type,
      title,
      description,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Donation Box Management
  const createDonationBox = (box: Omit<DonationBox, 'id'>) => {
    const nextNum = donationBoxes.length + 1;
    const padding = nextNum < 10 ? '000' : nextNum < 100 ? '00' : '0';
    const newId = `BOX-${padding}${nextNum}`;
    
    const newBox: DonationBox = {
      id: newId,
      ...box,
      collectorId: 'COL-001', // Auto-assign to the only collector
      mapLink: box.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(box.donorName + ' ' + box.address + ' ' + box.city)}`
    };
    
    setDonationBoxes((prev) => [newBox, ...prev]);
    addNotification('demand', 'New Donation Box Created', `${newBox.donorName} at "${newBox.address}" was successfully added to active tracking.`);
    return newBox;
  };

  const updateDonationBox = (updatedBox: DonationBox) => {
    setDonationBoxes((prev) =>
      prev.map((box) => (box.id === updatedBox.id ? updatedBox : box))
    );
  };

  const deleteDonationBox = (id: string) => {
    setDonationBoxes((prev) => prev.filter((box) => box.id !== id));
  };

  // Collector Management
  const updateCollectorStatus = (id: string, status: 'Active' | 'Disabled') => {
    setCollectors((prev) =>
      prev.map((col) => (col.id === id ? { ...col, status } : col))
    );
  };

  // Collection History Record Adding
  const addCollection = (record: Omit<CollectionRecord, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `COLLECT-${100 + collections.length + 1}`;
    
    const newRecord: CollectionRecord = {
      id: newId,
      date: today,
      ...record,
    };
    
    setCollections((prev) => [newRecord, ...prev]);
    
    // Update total collections statistic in notifications
    addNotification(
      'collection',
      'New Collection Recorded',
      `${newRecord.collectorName} collected $${newRecord.amount.toFixed(2)} from Box ID: ${newRecord.boxId}.`
    );
    
    return newRecord;
  };

  // Issue Tracking
  const addIssueReport = (issue: Omit<IssueReport, 'id' | 'date' | 'status' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `ISS-${100 + issueReports.length + 1}`;
    const loggedInCollectorName = role === 'Collector' ? 'John Smith' : 'Jane Doe';
    
    const newIssue: IssueReport = {
      id: newId,
      date: today,
      status: 'Pending',
      collectorName: loggedInCollectorName,
      ...issue,
    };
    
    setIssueReports((prev) => [newIssue, ...prev]);
    
    // Update box status to match issue type if severe
    if (issue.issueType === 'Damaged Box' || issue.issueType === 'Missing Box') {
      const statusMapping: Record<string, DonationBox['status']> = {
        'Damaged Box': 'Damaged',
        'Missing Box': 'Missing'
      };
      setDonationBoxes((prev) =>
        prev.map((b) =>
          b.id === issue.boxId ? { ...b, status: statusMapping[issue.issueType] } : b
        )
      );
    }

    addNotification(
      'issue',
      'New Issue Incident Filed',
      `Box ${newIssue.boxId} issue reported: "${newIssue.issueType}" by ${loggedInCollectorName}.`
    );
    
    return newIssue;
  };

  const updateIssueStatus = (id: string, status: 'Pending' | 'Resolved') => {
    setIssueReports((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          // If resolved, optionally restore box to active if it matches
          if (status === 'Resolved') {
            setDonationBoxes((boxes) =>
              boxes.map((b) => (b.id === issue.boxId ? { ...b, status: 'Active' } : b))
            );
          }
          return { ...issue, status };
        }
        return issue;
      })
    );
  };

  // Box Placement Demands
  const addBoxDemand = (demand: Omit<BoxDemand, 'id' | 'date' | 'status' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `DEM-${100 + boxDemands.length + 1}`;
    const loggedInCollectorName = role === 'Collector' ? 'John Smith' : 'Jane Doe';
    
    const newDemand: BoxDemand = {
      id: newId,
      date: today,
      status: 'Pending',
      collectorName: loggedInCollectorName,
      ...demand,
    };
    
    setBoxDemands((prev) => [newDemand, ...prev]);
    
    addNotification(
      'demand',
      'New Box Placement Request',
      `Placement proposed at "${newDemand.suggestedLocation}" in ${newDemand.city}.`
    );
    
    return newDemand;
  };

  const updateDemandStatus = (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    setBoxDemands((prev) =>
      prev.map((demand) => {
        if (demand.id === id) {
          // If approved, automatically create a new Donation Box with that location!
          if (status === 'Approved') {
            createDonationBox({
              donorName: demand.suggestedLocation,
              address: demand.address,
              city: demand.city,
              contactNumber: demand.contactNumber,
              collectorId: 'COL-001', // default assigned to first collector
              installationDate: new Date().toISOString().split('T')[0],
              status: 'Active',
              notes: `Auto-created from approved collector request. Foot traffic estimate: ${demand.estimatedTraffic}. notes: ${demand.notes || ''}`
            });
          }
          return { ...demand, status };
        }
        return demand;
      })
    );
  };

  const addExpense = (expense: Omit<ExpenseRecord, 'id' | 'date' | 'status' | 'collectorId' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `EXP-${100 + expenses.length + 1}`;
    const loggedInCollectorName = 'John Smith';
    
    const newRecord: ExpenseRecord = {
      id: newId,
      date: today,
      status: 'Pending',
      collectorId: 'COL-001',
      collectorName: loggedInCollectorName,
      ...expense,
    };
    
    setExpenses((prev) => [newRecord, ...prev]);
    
    addNotification(
      'issue',
      'Field Expense Added',
      `${loggedInCollectorName} added an expense for ${expense.category}: $${expense.amount.toFixed(2)}.`
    );
    
    return newRecord;
  };

  const updateExpenseStatus = (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  return (
    <NGOContext.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        userEmail,
        login,
        logout,
        registrations,
        registerUser,
        approveRegistration,
        rejectRegistration,
        donationBoxes,
        createDonationBox,
        updateDonationBox,
        deleteDonationBox,
        collectors,
        updateCollectorStatus,
        collections,
        addCollection,
        issueReports,
        addIssueReport,
        updateIssueStatus,
        boxDemands,
        addBoxDemand,
        updateDemandStatus,
        expenses,
        addExpense,
        updateExpenseStatus,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        totalExpenses,
        setTotalExpenses,
        commissionRate,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </NGOContext.Provider>
  );
};

export const useNGOStore = () => {
  const context = useContext(NGOContext);
  if (context === undefined) {
    throw new Error('useNGOStore must be used within an NGOStoreProvider');
  }
  return context;
};
