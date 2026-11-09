import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';
import {
  Lock,
  Mail,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserCheck,
  Briefcase,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AuthPortalProps {
  initialMode?: 'login' | 'register';
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  initialMode = 'login',
  onClose,
  isModal = false,
}) => {
  const { login, register, tenants, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTenantId, setLoginTenantId] = useState('tenant-mkce');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regTenantId, setRegTenantId] = useState('tenant-mkce');
  const [regDepartment, setRegDepartment] = useState('Computer Applications (MCA)');
  const [regStudentId, setRegStudentId] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  // Pre-configured Quick-Fill Demo Personas
  const demoPersonas = [
    {
      role: 'STUDENT' as UserRole,
      name: 'Shree (Roll: 927625MCA050)',
      email: '927625mca050@mkce.ac.in',
      password: 'Shree_159',
      title: 'M Kumarasamy College of Engineering · MCA Scholar',
      tenantId: 'tenant-mkce',
    },
    {
      role: 'INSTITUTION_ADMIN' as UserRole,
      name: 'Prof. Shree V.',
      email: 'shree@mkce.ac.in',
      password: 'Shree_159',
      title: 'M Kumarasamy College of Engineering · HOD / Admin',
      tenantId: 'tenant-mkce',
    },
    {
      role: 'STUDENT' as UserRole,
      name: 'Sarah Chen',
      email: 's.chen@stjude.edu',
      password: 'password123',
      title: 'CS Sophomore',
      tenantId: 'tenant-st-jude',
    },
    {
      role: 'FACULTY' as UserRole,
      name: 'Dr. Marcus Vance',
      email: 'm.vance@stjude.edu',
      password: 'password123',
      title: 'Associate Professor',
      tenantId: 'tenant-st-jude',
    },
    {
      role: 'ACADEMIC_ADVISOR' as UserRole,
      name: 'Elena Rostova, M.Ed.',
      email: 'e.rostova@stjude.edu',
      password: 'password123',
      title: 'Senior Success Specialist',
      tenantId: 'tenant-st-jude',
    },
    {
      role: 'COUNSELLOR' as UserRole,
      name: 'Dr. Rachel Adams, Psy.D.',
      email: 'r.adams@stjude.edu',
      password: 'password123',
      title: 'Clinical Psychologist',
      tenantId: 'tenant-st-jude',
    },
    {
      role: 'INSTITUTION_ADMIN' as UserRole,
      name: 'Dr. Evelyn Reed',
      email: 'e.reed@stjude.edu',
      password: 'password123',
      title: 'Vice Provost',
      tenantId: 'tenant-st-jude',
    },
    {
      role: 'SUPER_ADMIN' as UserRole,
      name: 'Jordan Miller',
      email: 'jordan@campuspulse.ai',
      password: 'password123',
      title: 'Platform SaaS Lead',
      tenantId: 'tenant-st-jude',
    },
  ];

  const handleQuickFill = (persona: typeof demoPersonas[0]) => {
    setMode('login');
    setLoginEmail(persona.email);
    setLoginPassword(persona.password);
    setLoginTenantId(persona.tenantId);
    setErrorMessage('');
    showToast(`Filled credentials for ${persona.name} (${persona.title})`, 'info');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your university email address.');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: loginEmail.trim(),
        password: loginPassword || 'password123',
        tenantId: loginTenantId,
      });
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Full name and university email are required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (!agreePrivacy) {
      setErrorMessage('Please accept the institutional privacy policy to proceed.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        tenantId: regTenantId,
        department: regDepartment,
        studentIdNumber: regRole === 'STUDENT' ? (regStudentId || `SJU-2026-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        title: regTitle || (regRole === 'STUDENT' ? 'Student' : 'Faculty/Staff Specialist'),
      });
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTenant = tenants.find((t) => t.id === (mode === 'login' ? loginTenantId : regTenantId)) || tenants[0];

  return (
    <div className={`min-h-screen flex flex-col justify-center bg-slate-900/50 py-12 sm:px-6 lg:px-8 ${isModal ? 'p-0' : ''}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Wordmark & Crest */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            CP
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              CampusPulse AI
            </span>
            <span className="text-xs text-slate-400 block font-normal">
              Student Success, Early Warning & Intervention Ecosystem
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-bold text-white tracking-tight">
          {mode === 'login' ? 'Institutional Credential Access' : 'Register Institutional Account'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Protected multi-tenant platform adhering to FERPA & institutional access boundaries
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In with Credentials
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                mode === 'register'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              New Account Registration
            </button>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Institution University Tenant
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={loginTenantId}
                    onChange={(e) => setLoginTenantId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-emerald-600"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.domain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. s.chen@stjude.edu or username@institution.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('In demo mode, any password or password123 is accepted.', 'info');
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password (or demo password)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-emerald-600 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  SAML 2.0 / SSO Enabled
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to CampusPulse'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  University Tenant Affiliation
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={regTenantId}
                    onChange={(e) => setRegTenantId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white focus:outline-emerald-600"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.domain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Institutional Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty Instructor</option>
                    <option value="ACADEMIC_ADVISOR">Academic Advisor</option>
                    <option value="COUNSELLOR">Clinical Counsellor</option>
                    <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  University Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder={`e.g. yourname@${selectedTenant?.domain || 'stjude.edu'}`}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Department / College
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {regRole === 'STUDENT' ? 'Student ID Number' : 'Job Title / Position'}
                  </label>
                  <input
                    type="text"
                    placeholder={regRole === 'STUDENT' ? 'e.g. SJU-2026-9041' : 'e.g. Assistant Professor'}
                    value={regRole === 'STUDENT' ? regStudentId : regTitle}
                    onChange={(e) => (regRole === 'STUDENT' ? setRegStudentId(e.target.value) : setRegTitle(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create a secure passphrase"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-slate-600 text-[11px] leading-relaxed">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    I confirm my institutional affiliation and acknowledge FERPA & confidentiality agreements governing academic records and student dignity.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Creating Institutional Account...' : 'Complete Registration'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </form>
          )}

          {/* Quick-Fill Demo Personas Bar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Instant Demo Persona Quick-Fill:</span>
              </span>
              <span className="text-[10px] text-slate-400">1-click test credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {demoPersonas.map((persona) => (
                <button
                  key={persona.email}
                  type="button"
                  onClick={() => handleQuickFill(persona)}
                  className={`p-2 border rounded-lg text-left transition-colors group ${
                    persona.tenantId === 'tenant-mkce'
                      ? 'border-blue-300 bg-blue-50/60 hover:border-blue-500 hover:bg-blue-100/70'
                      : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="font-semibold text-slate-900 text-[11px] truncate group-hover:text-emerald-900">
                    {persona.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {persona.role.replace('_', ' ')} · {persona.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
