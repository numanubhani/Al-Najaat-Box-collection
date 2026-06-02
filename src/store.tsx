/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { buildSessionDate, type SessionDateInfo } from './lib/sessionDate';

export interface AppToast {
  id: string;
  title: string;
  message?: string;
  variant: 'success' | 'error' | 'info';
}

interface NGOContextType {
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
  registrations: UserRegistration[];
  registerUser: (name: string, email: string, phone: string, role: Role) => Promise<void>;
  approveRegistration: (id: string) => Promise<void>;
  rejectRegistration: (id: string) => Promise<void>;
  
  donationBoxes: DonationBox[];
  createDonationBox: (box: Omit<DonationBox, 'id'>) => DonationBox;
  updateDonationBox: (box: DonationBox) => void;
  deleteDonationBox: (id: string) => void;
  
  collectors: Collector[];
  updateCollectorStatus: (id: string, status: 'Active' | 'Disabled') => void;
  resetCollectorPassword: (id: string, password: string) => Promise<void>;
  
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
  toasts: AppToast[];
  dismissToast: (id: string) => void;

  sessionDate: SessionDateInfo;
  showToast: (title: string, message?: string, variant?: AppToast['variant']) => void;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export const NGOStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const toastTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('ngo_role') as Role) || 'Admin');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const sessionFlag = localStorage.getItem('ngo_logged_in') === 'true';
    const hasToken = !!localStorage.getItem('pwa_auth_token');
    return sessionFlag || hasToken;
  });
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('ngo_user_email') || 'Admin@gmail.com');
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('ngo_user_name') || 'User');

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
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const [sessionDate, setSessionDate] = useState<SessionDateInfo>(() => buildSessionDate());

  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const commissionRate = 0.15; // 15% Commission

  const refreshSessionDate = useCallback(() => {
    const next = buildSessionDate();
    setSessionDate(next);
    localStorage.setItem('ngo_session_date_iso', next.iso);
    localStorage.setItem('ngo_session_date_label', next.label);
    localStorage.setItem('ngo_session_day_name', next.dayName);
  }, []);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('pwa_auth_token');
    if (hasToken) {
      localStorage.setItem('ngo_logged_in', 'true');
      refreshSessionDate();
      if (!isLoggedIn) {
        setIsLoggedIn(true);
      }
    }
  }, [isLoggedIn, refreshSessionDate]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
  }, []);

  const pushToast = useCallback((title: string, message: string | undefined, variant: AppToast['variant'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, variant }].slice(-6));
    toastTimersRef.current[id] = setTimeout(() => {
      dismissToast(id);
    }, 3500);
  }, [dismissToast]);

  const pushPwaNotification = useCallback(async (title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (Notification.permission !== 'granted') return;
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, { body, tag: 'collector-scan' });
      } else {
        new Notification(title, { body });
      }
    } catch {
      // Silent fallback: toast is already shown in-app.
    }
  }, []);

  // Recalculate total expenses based on active state lists
  useEffect(() => {
    const sum = expenses.filter(e => e.status !== 'Rejected').reduce((s, item) => s + item.amount, 0);
    setTotalExpenses(sum);
  }, [expenses]);

  // Pull all active lists from backend API endpoints
  const fetchData = useCallback(async () => {
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
      setCollections(
        colls.map((record) => ({
          ...record,
          amount: Number(record.amount) || 0,
        }))
      );
      setIssueReports(iss);
      setBoxDemands(dems);
      setExpenses(
        exps.map((expense) => ({
          ...expense,
          amount: Number(expense.amount) || 0,
        }))
      );
      setNotifications(notifs);
    } catch (err) {
      console.warn('API sync warning (server starting or standalone offline mode):', err);
    }
  }, []);

  // Run data synchronization on boot if authenticated
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/live/';
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'data_updated') {
            fetchData();
          }
        } catch {
          // ignore malformed messages
        }
      };

      socket.onclose = () => {
        if (wsRef.current === socket) {
          wsRef.current = null;
        }
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [isLoggedIn, fetchData]);

  // Authentications
  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setUserEmail(res.user.email);
    setUserName(res.user.name || res.user.email);
    setRole(res.user.role);
    setIsLoggedIn(true);
    localStorage.setItem('pwa_auth_token', res.token);
    localStorage.setItem('ngo_logged_in', 'true');
    localStorage.setItem('ngo_role', res.user.role);
    localStorage.setItem('ngo_user_email', res.user.email);
    localStorage.setItem('ngo_user_name', res.user.name || res.user.email);
    refreshSessionDate();
    fetchData();
    const today = buildSessionDate();
    pushToast('Login successful', `Welcome ${res.user.name || res.user.email} — ${today.dayName}, ${today.label}`, 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('pwa_auth_token');
    localStorage.setItem('ngo_logged_in', 'false');
    localStorage.removeItem('ngo_role');
    localStorage.removeItem('ngo_user_email');
    localStorage.removeItem('ngo_user_name');
    localStorage.removeItem('ngo_session_date_iso');
    localStorage.removeItem('ngo_session_date_label');
    localStorage.removeItem('ngo_session_day_name');
    pushToast('Logged out', 'Session ended successfully', 'info');
  };

  const registerUser = async (name: string, email: string, phone: string, chosenRole: Role) => {
    const result = await api.auth.register(name, email, phone, chosenRole);
    setRegistrations(prev => [result, ...prev]);
    fetchData();
    pushToast('Registration submitted', `${name} added to pending approvals`, 'success');
  };

  const approveRegistration = async (id: string) => {
    await api.auth.approveRegistration(id);
    fetchData();
    pushToast('Registration approved', `Request ${id} approved`, 'success');
  };

  const rejectRegistration = async (id: string) => {
    await api.auth.rejectRegistration(id);
    fetchData();
    pushToast('Registration rejected', `Request ${id} rejected`, 'info');
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
      collectorId: box.collectorId || '',
      mapLink: box.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(box.donorName + ' ' + box.address + ' ' + box.city)}`
    };
    
    setDonationBoxes((prev) => [newBox, ...prev]);
    
    api.boxes.create(box)
      .then(() => {
        fetchData();
        pushToast('Donation box created', `${box.donorName} was onboarded`, 'success');
      })
      .catch((err) => {
        console.warn('Network offline, logging locally only:', err);
        setDonationBoxes((prev) => prev.map(b => b.id === tempId ? { ...b, id: `BOX-00${donationBoxes.length + 1}` } : b));
        pushToast('Create failed', 'Could not sync new donation box to backend', 'error');
      });

    return newBox;
  };

  const updateDonationBox = async (updatedBox: DonationBox) => {
    setDonationBoxes((prev) => prev.map((box) => (box.id === updatedBox.id ? updatedBox : box)));
    try {
      await api.boxes.update(updatedBox);
      fetchData();
      pushToast('Donation box updated', `${updatedBox.id} saved successfully`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Update failed', `Could not update ${updatedBox.id}`, 'error');
    }
  };

  const deleteDonationBox = async (id: string) => {
    setDonationBoxes((prev) => prev.filter((box) => box.id !== id));
    try {
      await api.boxes.delete(id);
      pushToast('Donation box deleted', `${id} removed successfully`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Delete failed', `Could not delete ${id}`, 'error');
    }
  };

  // Collector Management
  const updateCollectorStatus = async (id: string, status: 'Active' | 'Disabled') => {
    setCollectors((prev) => prev.map((col) => (col.id === id ? { ...col, status } : col)));
    try {
      await api.collectors.updateStatus(id, status);
      pushToast('Collector updated', `${id} set to ${status}`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Update failed', `Could not change ${id} status`, 'error');
    }
  };

  const resetCollectorPassword = async (id: string, password: string) => {
    try {
      await api.collectors.resetPassword(id, password);
      pushToast('Password reset', `${id} password updated`, 'success');
    } catch (error) {
      pushToast('Reset failed', error instanceof Error ? error.message : 'Collector password reset failed', 'error');
      throw error;
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
      .then(() => {
        fetchData();
        pushToast('Collection recorded', `${record.boxId} amount $${record.amount.toFixed(2)} saved`, 'success');
        void pushPwaNotification('Collection saved', `Box ${record.boxId}: $${record.amount.toFixed(2)} recorded`);
      })
      .catch((err) => {
        console.warn('Network offline, adding local collection:', err);
        setCollections((prev) => prev.map(c => c.id === tempId ? { ...c, id: `COLLECT-${100 + collections.length + 1}` } : c));
        pushToast('Collection sync failed', 'Saved locally, backend sync failed', 'error');
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
      .then(() => {
        fetchData();
        pushToast('Issue reported', `${issue.boxId} incident submitted`, 'success');
      })
      .catch((err) => {
        console.warn('Offline report:', err);
        setIssueReports((prev) => prev.map(i => i.id === tempId ? { ...i, id: `ISS-${100 + issueReports.length + 1}` } : i));
        pushToast('Issue sync failed', 'Saved locally, backend sync failed', 'error');
      });
    
    return newIssue;
  };

  const updateIssueStatus = async (id: string, status: 'Pending' | 'Resolved') => {
    setIssueReports((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
    try {
      await api.issues.updateStatus(id, status);
      fetchData();
      pushToast('Issue updated', `${id} marked ${status}`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Update failed', `Could not update issue ${id}`, 'error');
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
      .then(() => {
        fetchData();
        pushToast('Demand submitted', `${demand.suggestedLocation} proposal sent`, 'success');
      })
      .catch((err) => {
        console.warn('Offline demand:', err);
        setBoxDemands(prev => prev.map(d => d.id === tempId ? { ...d, id: `DEM-${100 + boxDemands.length + 1}` } : d));
        pushToast('Demand sync failed', 'Saved locally, backend sync failed', 'error');
      });
    
    return newDemand;
  };

  const updateDemandStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    setBoxDemands((prev) => prev.map((demand) => (demand.id === id ? { ...demand, status } : demand)));
    try {
      await api.demands.updateStatus(id, status);
      fetchData();
      pushToast('Demand updated', `${id} marked ${status}`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Update failed', `Could not update demand ${id}`, 'error');
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
      .then(() => {
        fetchData();
        pushToast('Expense submitted', `${expense.category} claim added`, 'success');
      })
      .catch((err) => {
        console.warn('Offline fuel claims:', err);
        setExpenses((prev) => prev.map(e => e.id === tempId ? { ...e, id: `EXP-${100 + expenses.length + 1}` } : e));
        pushToast('Expense sync failed', 'Saved locally, backend sync failed', 'error');
      });
    
    return newRecord;
  };

  const updateExpenseStatus = async (id: string, status: 'Approved' | 'Pending' | 'Rejected') => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      await api.expenses.updateStatus(id, status);
      fetchData();
      pushToast('Expense updated', `${id} marked ${status}`, 'success');
    } catch (err) {
      console.warn(err);
      pushToast('Update failed', `Could not update expense ${id}`, 'error');
    }
  };

  return (
    <NGOContext.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        userEmail,
        userName,
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
        resetCollectorPassword,
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
        toasts,
        dismissToast,
        sessionDate,
        showToast: pushToast,
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
