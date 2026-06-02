/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
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
  
  const [donationBoxes, setDonationBoxes] = useState<DonationBox[]>(INITIAL_BOXES);
  const [collectors, setCollectors] = useState<Collector[]>(INITIAL_COLLECTORS);
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>(INITIAL_COLLECTIONS);
  const [issueReports, setIssueReports] = useState<IssueReport[]>(INITIAL_ISSUES);
  const [boxDemands, setBoxDemands] = useState<BoxDemand[]>(INITIAL_DEMANDS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const commissionRate = 0.15; // 15% Commission

  // Recalculate total expenses based on active state lists
  useEffect(() => {
    const sum = expenses.filter(e => e.status !== 'Rejected').reduce((s, item) => s + item.amount, 0);
    setTotalExpenses(sum);
  }, [expenses]);

  // Pull all active lists from backend API endpoints
  const fetchData = async () => {
    try {
      const [
        boxes,
        cols,
        regs,
        colls,
        iss,
        dems,
        exps,
        notifs
      ] = await Promise.all([
        api.boxes.list(),
        api.collectors.list(),
        api.auth.getRegistrations(),
        api.collections.list(),
        api.issues.list(),
        api.demands.list(),
        api.expenses.list(),
        api.notifications.list()
      ]);

      setDonationBoxes(boxes);
      setCollectors(cols);
      setRegistrations(regs);
      setCollections(colls);
      setIssueReports(iss);
      setBoxDemands(dems);
      setExpenses(exps);
      setNotifications(notifs);
    } catch (err) {
      console.warn('API sync warning (server starting or standalone offline mode):', err);
    }
  };

  // Run data synchronization on boot if authenticated
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Authentications
  const login = async (email: string, chosenRole: Role) => {
    try {
      const res = await api.auth.login(email, 'password123');
      setUserEmail(res.user.email);
      setRole(res.user.role);
      setIsLoggedIn(true);
      localStorage.setItem('pwa_auth_token', res.token);
      localStorage.setItem('ngo_logged_in', 'true');
      localStorage.setItem('ngo_role', res.user.role);
      localStorage.setItem('ngo_user_email', res.user.email);
      fetchData();
    } catch (err) {
      console.warn('Offline mock login fallback configured:', err);
      setUserEmail(email);
      setRole(chosenRole);
      setIsLoggedIn(true);
      localStorage.setItem('ngo_logged_in', 'true');
      localStorage.setItem('ngo_role', chosenRole);
      localStorage.setItem('ngo_user_email', email);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('pwa_auth_token');
    localStorage.setItem('ngo_logged_in', 'false');
  };

  const registerUser = async (name: string, email: string, phone: string, chosenRole: Role) => {
    try {
      const result = await api.auth.register(name, email, phone, chosenRole);
      setRegistrations(prev => [result, ...prev]);
      fetchData();
    } catch {
      const tempReg: UserRegistration = {
        id: `REG-${Date.now()}`,
        name,
        email,
        phone,
        role: chosenRole,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setRegistrations(prev => [tempReg, ...prev]);
      addNotification('demand', 'New Account Registration Created', `${name} brand-new registration for ${chosenRole}. Approval required.`);
    }
  };

  const approveRegistration = async (id: string) => {
    try {
      await api.auth.approveRegistration(id);
      fetchData();
    } catch {
      setRegistrations((prev) =>
        prev.map((reg) => {
          if (reg.id === id) {
            if (reg.role === 'Collector') {
              const alreadyExists = collectors.some(c => c.email.toLowerCase() === reg.email.toLowerCase());
              if (!alreadyExists) {
                setCollectors((curr) => [
                  ...curr,
                  {
                    id: `COL-00${collectors.length + 1}`,
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
    }
  };

  const rejectRegistration = async (id: string) => {
    try {
      await api.auth.rejectRegistration(id);
      fetchData();
    } catch {
      setRegistrations((prev) =>
        prev.map((reg) => {
          if (reg.id === id) {
            addNotification('demand', 'Registration Rejected', `Staff ${reg.name} was rejected.`);
            return { ...reg, status: 'Rejected' };
          }
          return reg;
        })
      );
    }
  };

  // Notification Engine
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

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.notifications.markRead(id);
    } catch (err) {
      console.warn(err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (err) {
      console.warn(err);
    }
  };

  // Donation Box Management
  const createDonationBox = (box: Omit<DonationBox, 'id'>) => {
    const tempId = `BOX-TEMP-${Date.now()}`;
    const newBox: DonationBox = {
      id: tempId,
      ...box,
      collectorId: box.collectorId || 'COL-001',
      mapLink: box.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(box.donorName + ' ' + box.address + ' ' + box.city)}`
    };
    
    setDonationBoxes((prev) => [newBox, ...prev]);
    
    api.boxes.create(box)
      .then(() => fetchData())
      .catch((err) => {
        console.warn('Network offline, logging locally only:', err);
        setDonationBoxes((prev) => prev.map(b => b.id === tempId ? { ...b, id: `BOX-00${donationBoxes.length + 1}` } : b));
      });

    return newBox;
  };

  const updateDonationBox = async (updatedBox: DonationBox) => {
    setDonationBoxes((prev) => prev.map((box) => (box.id === updatedBox.id ? updatedBox : box)));
    try {
      await api.boxes.update(updatedBox);
      fetchData();
    } catch (err) {
      console.warn(err);
    }
  };

  const deleteDonationBox = async (id: string) => {
    setDonationBoxes((prev) => prev.filter((box) => box.id !== id));
    try {
      await api.boxes.delete(id);
    } catch (err) {
      console.warn(err);
    }
  };

  // Collector Management
  const updateCollectorStatus = async (id: string, status: 'Active' | 'Disabled') => {
    setCollectors((prev) => prev.map((col) => (col.id === id ? { ...col, status } : col)));
    try {
      await api.collectors.updateStatus(id, status);
    } catch (err) {
      console.warn(err);
    }
  };

  // Collection History
  const addCollection = (record: Omit<CollectionRecord, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `COLL-TEMP-${Date.now()}`;
    
    const newRecord: CollectionRecord = {
      id: tempId,
      date: today,
      ...record,
    };
    
    setCollections((prev) => [newRecord, ...prev]);
    
    api.collections.create(record)
      .then(() => fetchData())
      .catch((err) => {
        console.warn('Network offline, adding local collection:', err);
        setCollections((prev) => prev.map(c => c.id === tempId ? { ...c, id: `COLLECT-${100 + collections.length + 1}` } : c));
      });
    
    return newRecord;
  };

  // Issue Tracking
  const addIssueReport = (issue: Omit<IssueReport, 'id' | 'date' | 'status' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `ISS-TEMP-${Date.now()}`;
    const loggedInName = userEmail.split('@')[0];
    
    const newIssue: IssueReport = {
      id: tempId,
      date: today,
      status: 'Pending',
      collectorName: loggedInName,
      ...issue,
    };
    
    setIssueReports((prev) => [newIssue, ...prev]);
    
    api.issues.create(issue)
      .then(() => fetchData())
      .catch((err) => {
        console.warn('Offline report:', err);
        setIssueReports((prev) => prev.map(i => i.id === tempId ? { ...i, id: `ISS-${100 + issueReports.length + 1}` } : i));
      });
    
    return newIssue;
  };

  const updateIssueStatus = async (id: string, status: 'Pending' | 'Resolved') => {
    setIssueReports((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
    try {
      await api.issues.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.warn(err);
    }
  };

  // Box Placement Demands
  const addBoxDemand = (demand: Omit<BoxDemand, 'id' | 'date' | 'status' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `DEM-TEMP-${Date.now()}`;
    const loggedInName = userEmail.split('@')[0];
    
    const newDemand: BoxDemand = {
      id: tempId,
      date: today,
      status: 'Pending',
      collectorName: loggedInName,
      ...demand,
    };
    
    setBoxDemands((prev) => [newDemand, ...prev]);
    
    api.demands.create(demand)
      .then(() => fetchData())
      .catch((err) => {
        console.warn('Offline demand:', err);
        setBoxDemands(prev => prev.map(d => d.id === tempId ? { ...d, id: `DEM-${100 + boxDemands.length + 1}` } : d));
      });
    
    return newDemand;
  };

  const updateDemandStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    setBoxDemands((prev) => prev.map((demand) => (demand.id === id ? { ...demand, status } : demand)));
    try {
      await api.demands.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.warn(err);
    }
  };

  // Travelling Claims & Fuel Expenses
  const addExpense = (expense: Omit<ExpenseRecord, 'id' | 'date' | 'status' | 'collectorId' | 'collectorName'>) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `EXP-TEMP-${Date.now()}`;
    const loggedInName = userEmail.split('@')[0];
    
    const newRecord: ExpenseRecord = {
      id: tempId,
      date: today,
      status: 'Pending',
      collectorId: 'COL-001',
      collectorName: loggedInName,
      ...expense,
    };
    
    setExpenses((prev) => [newRecord, ...prev]);
    
    api.expenses.create(expense)
      .then(() => fetchData())
      .catch((err) => {
        console.warn('Offline fuel claims:', err);
        setExpenses((prev) => prev.map(e => e.id === tempId ? { ...e, id: `EXP-${100 + expenses.length + 1}` } : e));
      });
    
    return newRecord;
  };

  const updateExpenseStatus = async (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      await api.expenses.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.warn(err);
    }
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
