import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, UserRole, NotificationItem, AssessmentOutputResult } from '../types/index.ts';
import { api } from '../services/api.ts';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  currentRole: UserRole;
  tenants: Tenant[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;

  // Authentication State & Actions
  isAuthenticated: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (credentials: { email: string; password?: string; tenantId?: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    tenantId?: string;
    department?: string;
    studentIdNumber?: string;
    title?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;

  // Risk Assessment Output State
  currentAssessmentResult: AssessmentOutputResult | null;
  setCurrentAssessmentResult: (result: AssessmentOutputResult | null) => void;
  viewAssessmentResult: (result: AssessmentOutputResult) => void;
}

const defaultInitialTenants: Tenant[] = [
  {
    id: 'tenant-mkce',
    slug: 'mkce',
    name: 'M Kumarasamy College of Engineering',
    domain: 'mkce.ac.in',
    logoText: 'MKCE',
    accentColor: '#2563EB',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    subscriptionTier: 'ENTERPRISE',
    studentCount: 4200,
    facultyCount: 260,
    retentionRate: 96.2,
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    settings: {
      minAttendanceThreshold: 75,
      maxAbsencesBeforeAlert: 3,
      contactEmail: 'shree@mkce.ac.in',
      academicCalendar: 'SEMESTER',
      timezone: 'Asia/Kolkata',
    },
  },
  {
    id: 'tenant-st-jude',
    slug: 'st-jude-university',
    name: 'St. Jude University',
    domain: 'stjude.edu',
    logoText: 'SJU',
    accentColor: '#10B981',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    subscriptionTier: 'ENTERPRISE',
    studentCount: 14250,
    facultyCount: 840,
    retentionRate: 88.4,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
    settings: {
      minAttendanceThreshold: 75,
      maxAbsencesBeforeAlert: 3,
      contactEmail: 'provost@stjude.edu',
      academicCalendar: 'SEMESTER',
      timezone: 'America/New_York',
    },
  },
  {
    id: 'tenant-oakridge',
    slug: 'oakridge-tech',
    name: 'Oakridge Institute of Technology',
    domain: 'oakridge.edu',
    logoText: 'OIT',
    accentColor: '#6366F1',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    subscriptionTier: 'PROFESSIONAL',
    studentCount: 6800,
    facultyCount: 420,
    retentionRate: 91.2,
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
    settings: {
      minAttendanceThreshold: 80,
      maxAbsencesBeforeAlert: 2,
      contactEmail: 'academic-success@oakridge.edu',
      academicCalendar: 'SEMESTER',
      timezone: 'America/Chicago',
    },
  },
  {
    id: 'tenant-pacific-rim',
    slug: 'pacific-rim-college',
    name: 'Pacific Rim College',
    domain: 'pacificrim.edu',
    logoText: 'PRC',
    accentColor: '#F59E0B',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    subscriptionTier: 'STARTER',
    studentCount: 9500,
    facultyCount: 310,
    retentionRate: 76.8,
    createdAt: '2025-06-10T08:00:00Z',
    updatedAt: '2026-10-15T08:00:00Z',
    settings: {
      minAttendanceThreshold: 70,
      maxAbsencesBeforeAlert: 4,
      contactEmail: 'registrar@pacificrim.edu',
      academicCalendar: 'QUARTER',
      timezone: 'America/Los_Angeles',
    },
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(defaultInitialTenants[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [tenants, setTenants] = useState<Tenant[]>(defaultInitialTenants);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('tab') || 'dashboard';
    }
    return 'dashboard';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [currentAssessmentResult, setCurrentAssessmentResult] = useState<AssessmentOutputResult | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Peer Tutoring Check-in',
      message: 'Dr. Marcus Vance recommended a study connection for CS201 Lab 4.',
      type: 'INFO',
      timestamp: '10m ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Upcoming Advising Session',
      message: 'Advising check-in confirmed with Elena Rostova for Wednesday Oct 21.',
      type: 'ACTION',
      timestamp: '1h ago',
      read: false,
    },
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const fetchContext = async () => {
    try {
      setLoading(true);
      const isLoggedOut = localStorage.getItem('campuspulse_logged_out') === 'true';
      if (isLoggedOut) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const data = await api.getAuthContext();
      const p = new URLSearchParams(window.location.search);
      const urlTab = p.get('tab');
      const urlRole = p.get('role') as UserRole;

      setCurrentUser(data.user);
      setCurrentTenant(data.tenant);
      setCurrentRole(urlRole || data.user.role);
      if (urlTab) setActiveTab(urlTab);
      setTenants(data.accessibleTenants);
      setIsAuthenticated(true);
      api.setContext(data.tenant.id, urlRole || data.user.role, data.user.id);
    } catch (err) {
      console.error('Failed to load initial context:', err);
      showToast('Connecting to institutional services...', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  const login = async (credentials: { email: string; password?: string; tenantId?: string }) => {
    try {
      setLoading(true);
      const res = await api.login(credentials);
      api.setContext(res.tenant.id, res.user.role, res.user.id);
      setCurrentUser(res.user);
      setCurrentTenant(res.tenant);
      setCurrentRole(res.user.role);
      setTenants(res.accessibleTenants);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      localStorage.removeItem('campuspulse_logged_out');
      showToast(`Welcome back, ${res.user.name}! Signed in as ${res.user.role.replace('_', ' ')}.`, 'success');
      setActiveTab('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    tenantId?: string;
    department?: string;
    studentIdNumber?: string;
    title?: string;
  }) => {
    try {
      setLoading(true);
      const res = await api.register(payload);
      api.setContext(res.tenant.id, res.user.role, res.user.id);
      setCurrentUser(res.user);
      setCurrentTenant(res.tenant);
      setCurrentRole(res.user.role);
      setTenants(res.accessibleTenants);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      localStorage.removeItem('campuspulse_logged_out');
      showToast(`Account successfully created for ${res.user.name}!`, 'success');
      setActiveTab('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
      localStorage.setItem('campuspulse_logged_out', 'true');
      setIsAuthenticated(false);
      setCurrentUser(null);
      showToast('You have been signed out safely.', 'info');
    } catch (err) {
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      setLoading(true);
      const data = await api.switchRole(newRole, currentTenant?.id);
      setCurrentRole(newRole);
      setCurrentUser(data.user);
      api.setContext(currentTenant?.id || 'tenant-st-jude', newRole, data.user.id);
      setActiveTab('dashboard');
      showToast(`Switched workspace to ${newRole.replace('_', ' ')} view`, 'info');
    } catch (err) {
      console.error('Error switching role:', err);
      showToast('Could not switch role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const target = tenants.find((t) => t.id === tenantId);
      if (target) {
        setCurrentTenant(target);
        api.setContext(tenantId, currentRole, currentUser?.id || 'usr-student-sarah');
        showToast(`Connected to ${target.name}`, 'success');
      }
    } catch (err) {
      console.error('Error switching tenant:', err);
      showToast('Error switching tenant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewAssessmentResult = (result: AssessmentOutputResult) => {
    setCurrentAssessmentResult(result);
    setActiveTab('risk_output');
  };

  const refreshData = async () => {
    await fetchContext();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentTenant,
        currentRole,
        tenants,
        activeTab,
        setActiveTab,
        switchRole,
        switchTenant,
        notifications,
        markNotificationRead,
        toasts,
        showToast,
        dismissToast,
        loading,
        refreshData,
        isAuthenticated,
        showAuthModal,
        setShowAuthModal,
        login,
        register,
        logout,
        currentAssessmentResult,
        setCurrentAssessmentResult,
        viewAssessmentResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
