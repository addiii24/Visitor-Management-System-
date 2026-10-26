import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { DEFAULT_COMPANY_CONFIG, DEMO_USERS } from '../config/company';

const STORAGE_KEYS = {
  VISITORS: 'vms_visitors',
  AUDIT_LOGS: 'vms_audit_logs',
  COMPANY_SETTINGS: 'vms_company_settings',
  NOTIFICATIONS: 'vms_notifications',
  TOKEN_COUNTER: 'vms_token_counter',
  SESSION: 'vms_session',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed', e);
  }
}

export function nowISO() {
  return new Date().toISOString();
}

export function formatDisplayDate(iso) {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
}

export function formatDisplayTime(iso) {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'hh:mm a');
  } catch {
    return iso;
  }
}

export function formatDisplayDateTime(iso) {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy, hh:mm a');
  } catch {
    return iso;
  }
}

// ─── Token Generation ──────────────────────────────────────────────────────

function nextTokenNumber() {
  const current = read(STORAGE_KEYS.TOKEN_COUNTER, 0);
  const next = current + 1;
  write(STORAGE_KEYS.TOKEN_COUNTER, next);
  return next;
}

export function generateVisitorToken() {
  const year = new Date().getFullYear();
  const num = String(nextTokenNumber()).padStart(5, '0');
  return `VIS-${year}-${num}`;
}

// ─── Company Settings ──────────────────────────────────────────────────────

export function getCompanySettings() {
  return read(STORAGE_KEYS.COMPANY_SETTINGS, DEFAULT_COMPANY_CONFIG);
}

export function saveCompanySettings(settings) {
  write(STORAGE_KEYS.COMPANY_SETTINGS, settings);
  createAuditLog({
    action: 'Company Settings Updated',
    token: null,
    details: 'Company configuration was updated.',
  });
}

// ─── Session ───────────────────────────────────────────────────────────────

export function saveSession(user) {
  write(STORAGE_KEYS.SESSION, user);
}

export function getSession() {
  return read(STORAGE_KEYS.SESSION, null);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function authenticate(username, password) {
  const user = DEMO_USERS.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
}

// ─── Visitors ──────────────────────────────────────────────────────────────

export function getVisitors() {
  return read(STORAGE_KEYS.VISITORS, []);
}

export function getVisitorById(id) {
  return getVisitors().find((v) => v.id === id) || null;
}

export function getVisitorByToken(token) {
  return getVisitors().find((v) => v.token === token) || null;
}

export function createVisitor(data, registeredBy) {
  const visitors = getVisitors();
  const token = generateVisitorToken();
  const now = nowISO();
  const visitor = {
    id: `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    token,
    status: 'Pending',
    approvalStatus: 'Pending',
    visitStatus: null,
    registeredBy: registeredBy?.name || 'Guard',
    registeredById: registeredBy?.id || null,
    registeredAt: now,
    approvedBy: null,
    approvedById: null,
    approvedAt: null,
    approvalRemarks: null,
    rejectionReason: null,
    holdRemarks: null,
    checkedInAt: null,
    checkedInBy: null,
    checkedOutAt: null,
    checkedOutBy: null,
    gatePassIssuedAt: null,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  visitors.push(visitor);
  write(STORAGE_KEYS.VISITORS, visitors);

  createAuditLog({
    action: 'Visitor Registered',
    token,
    details: `${data.visitorName} registered by ${registeredBy?.name || 'Guard'}`,
    userId: registeredBy?.id,
    userName: registeredBy?.name,
    userRole: registeredBy?.roleLabel,
  });

  return visitor;
}

export function updateVisitor(id, updates) {
  const visitors = getVisitors();
  const idx = visitors.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  visitors[idx] = { ...visitors[idx], ...updates, updatedAt: nowISO() };
  write(STORAGE_KEYS.VISITORS, visitors);
  return visitors[idx];
}

export function approveVisitor(id, approver, remarks = '') {
  const now = nowISO();
  const visitor = updateVisitor(id, {
    status: 'Approved',
    approvalStatus: 'Approved',
    approvedBy: approver.name,
    approvedById: approver.id,
    approvedAt: now,
    approvalRemarks: remarks,
    gatePassIssuedAt: now,
  });
  if (visitor) {
    createAuditLog({
      action: 'Visitor Approved',
      token: visitor.token,
      details: `Approved by ${approver.name}. Remarks: ${remarks || 'None'}`,
      userId: approver.id,
      userName: approver.name,
      userRole: approver.roleLabel,
    });
    addNotification({
      type: 'success',
      title: 'Visitor Approved',
      message: `${visitor.visitorName} (${visitor.token}) has been approved.`,
      visitorId: id,
    });
  }
  return visitor;
}

export function rejectVisitor(id, approver, reason) {
  const visitor = updateVisitor(id, {
    status: 'Rejected',
    approvalStatus: 'Rejected',
    rejectionReason: reason,
    approvedBy: approver.name,
    approvedById: approver.id,
    approvedAt: nowISO(),
  });
  if (visitor) {
    createAuditLog({
      action: 'Visitor Rejected',
      token: visitor.token,
      details: `Rejected by ${approver.name}. Reason: ${reason}`,
      userId: approver.id,
      userName: approver.name,
      userRole: approver.roleLabel,
    });
  }
  return visitor;
}

export function holdVisitor(id, approver, remarks) {
  const visitor = updateVisitor(id, {
    status: 'On Hold',
    approvalStatus: 'On Hold',
    holdRemarks: remarks,
    approvedBy: approver.name,
    approvedById: approver.id,
    approvedAt: nowISO(),
  });
  if (visitor) {
    createAuditLog({
      action: 'Visitor Put On Hold',
      token: visitor.token,
      details: `Put on hold by ${approver.name}. Remarks: ${remarks}`,
      userId: approver.id,
      userName: approver.name,
      userRole: approver.roleLabel,
    });
  }
  return visitor;
}

export function checkInVisitor(id, guard) {
  const visitor = getVisitorById(id);
  if (!visitor) return { success: false, message: 'Visitor not found.' };
  if (visitor.approvalStatus !== 'Approved')
    return { success: false, message: 'Visitor is not approved for entry.' };
  if (visitor.visitStatus === 'Checked In')
    return { success: false, message: 'Visitor is already checked in.' };
  if (visitor.visitStatus === 'Checked Out')
    return { success: false, message: 'Visitor has already completed visit.' };

  const updated = updateVisitor(id, {
    status: 'Checked In',
    visitStatus: 'Checked In',
    checkedInAt: nowISO(),
    checkedInBy: guard.name,
    checkedInById: guard.id,
  });
  createAuditLog({
    action: 'Visitor Checked In',
    token: updated.token,
    details: `Checked in by ${guard.name}`,
    userId: guard.id,
    userName: guard.name,
    userRole: guard.roleLabel,
  });
  return { success: true, visitor: updated };
}

export function checkOutVisitor(id, guard) {
  const visitor = getVisitorById(id);
  if (!visitor) return { success: false, message: 'Visitor not found.' };
  if (visitor.visitStatus !== 'Checked In')
    return { success: false, message: 'Visitor is not currently checked in.' };

  const updated = updateVisitor(id, {
    status: 'Checked Out',
    visitStatus: 'Checked Out',
    checkedOutAt: nowISO(),
    checkedOutBy: guard.name,
    checkedOutById: guard.id,
  });
  createAuditLog({
    action: 'Visitor Checked Out',
    token: updated.token,
    details: `Checked out by ${guard.name}`,
    userId: guard.id,
    userName: guard.name,
    userRole: guard.roleLabel,
  });
  return { success: true, visitor: updated };
}

// ─── Audit Logs ────────────────────────────────────────────────────────────

export function getAuditLogs() {
  return read(STORAGE_KEYS.AUDIT_LOGS, []);
}

export function createAuditLog({ action, token, details, userId, userName, userRole }) {
  const logs = getAuditLogs();
  const session = getSession();
  logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    token: token || null,
    details: details || '',
    userId: userId || session?.id || null,
    userName: userName || session?.name || 'System',
    userRole: userRole || session?.roleLabel || null,
    timestamp: nowISO(),
  });
  write(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// ─── Notifications ─────────────────────────────────────────────────────────

export function getNotifications() {
  return read(STORAGE_KEYS.NOTIFICATIONS, []);
}

export function addNotification({ type, title, message, visitorId = null }) {
  const notifs = getNotifications();
  notifs.unshift({
    id: `notif-${Date.now()}`,
    type,
    title,
    message,
    visitorId,
    read: false,
    createdAt: nowISO(),
  });
  write(STORAGE_KEYS.NOTIFICATIONS, notifs.slice(0, 50));
}

export function markNotificationsRead() {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  write(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// ─── CSV Export ────────────────────────────────────────────────────────────

export function exportVisitorRecords(visitors) {
  const settings = getCompanySettings();
  const headers = [
    'Token', 'Visitor Name', 'Mobile', 'Company', 'Person to Meet',
    'Department', 'Visit Purpose', 'Vehicle No', 'Status',
    'Approval Status', 'Registered At', 'Registered By',
    'Approved By', 'Approved At', 'Entry Time', 'Exit Time',
  ];

  function escape(val) {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = visitors.map((v) => [
    v.token, v.visitorName, v.mobile, v.companyName, v.personToMeet,
    v.department, v.visitPurpose, v.vehicleNumber || '',
    v.status, v.approvalStatus,
    formatDisplayDateTime(v.registeredAt), v.registeredBy,
    v.approvedBy || '', formatDisplayDateTime(v.approvedAt),
    formatDisplayDateTime(v.checkedInAt), formatDisplayDateTime(v.checkedOutAt),
  ].map(escape).join(','));

  const reportTime = formatDisplayDateTime(nowISO());
  const content = [
    `# ${settings.companyName} — Visitor Report`,
    `# Generated: ${reportTime}`,
    '',
    headers.join(','),
    ...rows,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visitor-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  createAuditLog({ action: 'CSV Export', token: null, details: `Exported ${visitors.length} records.` });
}

// ─── Statistics ────────────────────────────────────────────────────────────

export function getStats() {
  const visitors = getVisitors();
  const todayVisitors = visitors.filter((v) => isToday(parseISO(v.registeredAt)));
  return {
    totalToday: todayVisitors.length,
    pendingToday: todayVisitors.filter((v) => v.approvalStatus === 'Pending').length,
    approvedToday: todayVisitors.filter((v) => v.approvalStatus === 'Approved').length,
    rejectedToday: todayVisitors.filter((v) => v.approvalStatus === 'Rejected').length,
    onHoldToday: todayVisitors.filter((v) => v.approvalStatus === 'On Hold').length,
    currentlyInside: visitors.filter((v) => v.visitStatus === 'Checked In').length,
    completedToday: todayVisitors.filter((v) => v.visitStatus === 'Checked Out').length,
    totalAll: visitors.length,
    pendingAll: visitors.filter((v) => v.approvalStatus === 'Pending').length,
  };
}

// ─── Reset Demo Data ───────────────────────────────────────────────────────

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEYS.VISITORS);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_COUNTER);
  seedDemoData();
  createAuditLog({ action: 'Demo Data Reset', token: null, details: 'All demo data was reset.' });
}

// ─── Seed Data ─────────────────────────────────────────────────────────────

export function seedDemoData() {
  const existing = getVisitors();
  if (existing.length > 0) return; // Never overwrite existing records

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const makeDate = (offsetHours) => {
    const d = new Date(now);
    d.setHours(d.getHours() - offsetHours);
    return d.toISOString();
  };

  const demoVisitors = [
    {
      id: 'demo-visitor-001',
      token: 'VIS-2026-00001',
      visitorName: 'Rajiv Gupta',
      mobile: '9876543210',
      companyName: 'TechCorp Solutions Pvt. Ltd.',
      companyAddress: 'MG Road, Jaipur, Rajasthan',
      personToMeet: 'Suresh Sharma',
      department: 'Plant Head',
      visitPurpose: 'Business Meeting',
      vehicleNumber: 'RJ-19-AB-1234',
      numCompanions: 1,
      idType: 'Aadhaar Card',
      idLastChars: '4521',
      visitDate: now.toISOString().slice(0, 10),
      visitTime: '10:00',
      notes: 'Scheduled quarterly review meeting.',
      status: 'Approved',
      approvalStatus: 'Approved',
      visitStatus: null,
      registeredBy: 'Ramesh Kumar',
      registeredById: 'user-guard-001',
      registeredAt: makeDate(3),
      approvedBy: 'Suresh Sharma',
      approvedById: 'user-planthead-001',
      approvedAt: makeDate(2),
      approvalRemarks: 'Verified. Proceed.',
      gatePassIssuedAt: makeDate(2),
      checkedInAt: null,
      checkedInBy: null,
      checkedOutAt: null,
      checkedOutBy: null,
      createdAt: makeDate(3),
      updatedAt: makeDate(2),
    },
    {
      id: 'demo-visitor-002',
      token: 'VIS-2026-00002',
      visitorName: 'Anita Verma',
      mobile: '9123456789',
      companyName: 'Government Audit Dept.',
      companyAddress: 'Secretariat, Jodhpur, Rajasthan',
      personToMeet: 'Priya Mehta',
      department: 'HR',
      visitPurpose: 'Audit/Inspection',
      vehicleNumber: '',
      numCompanions: 0,
      idType: 'Government ID',
      idLastChars: '7890',
      visitDate: now.toISOString().slice(0, 10),
      visitTime: '11:30',
      notes: 'Annual compliance audit.',
      status: 'Pending',
      approvalStatus: 'Pending',
      visitStatus: null,
      registeredBy: 'Ramesh Kumar',
      registeredById: 'user-guard-001',
      registeredAt: makeDate(1),
      approvedBy: null,
      approvedById: null,
      approvedAt: null,
      approvalRemarks: null,
      rejectionReason: null,
      holdRemarks: null,
      gatePassIssuedAt: null,
      checkedInAt: null,
      checkedInBy: null,
      checkedOutAt: null,
      checkedOutBy: null,
      createdAt: makeDate(1),
      updatedAt: makeDate(1),
    },
    {
      id: 'demo-visitor-003',
      token: 'VIS-2026-00003',
      visitorName: 'Mohit Joshi',
      mobile: '9988776655',
      companyName: 'Fast Courier Services',
      companyAddress: 'RIICO Area, Jodhpur',
      personToMeet: 'Purchase Manager',
      department: 'Purchase',
      visitPurpose: 'Delivery',
      vehicleNumber: 'RJ-19-CD-5678',
      numCompanions: 0,
      idType: 'Driving License',
      idLastChars: '1122',
      visitDate: now.toISOString().slice(0, 10),
      visitTime: '09:15',
      notes: '',
      status: 'Rejected',
      approvalStatus: 'Rejected',
      visitStatus: null,
      registeredBy: 'Ramesh Kumar',
      registeredById: 'user-guard-001',
      registeredAt: makeDate(4),
      approvedBy: 'Suresh Sharma',
      approvedById: 'user-planthead-001',
      approvedAt: makeDate(3.5),
      rejectionReason: 'Delivery not scheduled. Contact Purchase dept to reschedule.',
      gatePassIssuedAt: null,
      checkedInAt: null,
      checkedInBy: null,
      checkedOutAt: null,
      checkedOutBy: null,
      createdAt: makeDate(4),
      updatedAt: makeDate(3.5),
    },
    {
      id: 'demo-visitor-004',
      token: 'VIS-2026-00004',
      visitorName: 'Deepak Singh',
      mobile: '9871234560',
      companyName: 'Industrial Machinery Co.',
      companyAddress: 'GIDC, Ahmedabad, Gujarat',
      personToMeet: 'Maintenance Head',
      department: 'Maintenance',
      visitPurpose: 'Maintenance/Service',
      vehicleNumber: 'GJ-01-EF-9012',
      numCompanions: 2,
      idType: 'Employee ID',
      idLastChars: '3344',
      visitDate: now.toISOString().slice(0, 10),
      visitTime: '14:00',
      notes: 'Annual machine servicing team.',
      status: 'On Hold',
      approvalStatus: 'On Hold',
      visitStatus: null,
      registeredBy: 'Ramesh Kumar',
      registeredById: 'user-guard-001',
      registeredAt: makeDate(2),
      approvedBy: 'Suresh Sharma',
      approvedById: 'user-planthead-001',
      approvedAt: makeDate(1.5),
      holdRemarks: 'Pending safety clearance documentation from vendor.',
      gatePassIssuedAt: null,
      checkedInAt: null,
      checkedInBy: null,
      checkedOutAt: null,
      checkedOutBy: null,
      createdAt: makeDate(2),
      updatedAt: makeDate(1.5),
    },
    {
      id: 'demo-visitor-005',
      token: 'VIS-2026-00005',
      visitorName: 'Sunita Patel',
      mobile: '9765432180',
      companyName: 'ABC Suppliers Pvt. Ltd.',
      companyAddress: 'Ring Road, Jodhpur',
      personToMeet: 'Rajesh Agarwal',
      department: 'Finance',
      visitPurpose: 'Business Meeting',
      vehicleNumber: 'RJ-19-GH-3456',
      numCompanions: 0,
      idType: 'PAN Card',
      idLastChars: '5566',
      visitDate: yesterday.toISOString().slice(0, 10),
      visitTime: '11:00',
      notes: 'Invoice reconciliation meeting.',
      status: 'Checked Out',
      approvalStatus: 'Approved',
      visitStatus: 'Checked Out',
      registeredBy: 'Ramesh Kumar',
      registeredById: 'user-guard-001',
      registeredAt: makeDate(26),
      approvedBy: 'Suresh Sharma',
      approvedById: 'user-planthead-001',
      approvedAt: makeDate(25),
      approvalRemarks: 'Approved.',
      gatePassIssuedAt: makeDate(25),
      checkedInAt: makeDate(24),
      checkedInBy: 'Ramesh Kumar',
      checkedOutAt: makeDate(22),
      checkedOutBy: 'Ramesh Kumar',
      createdAt: makeDate(26),
      updatedAt: makeDate(22),
    },
  ];

  write(STORAGE_KEYS.VISITORS, demoVisitors);
  write(STORAGE_KEYS.TOKEN_COUNTER, 5);

  // Seed audit logs
  const logs = [
    { id: 'log-seed-001', action: 'Visitor Registered', token: 'VIS-2026-00001', details: 'Rajiv Gupta registered', userName: 'Ramesh Kumar', userRole: 'Security Guard', timestamp: makeDate(3) },
    { id: 'log-seed-002', action: 'Visitor Approved', token: 'VIS-2026-00001', details: 'Approved by Suresh Sharma', userName: 'Suresh Sharma', userRole: 'Plant Head', timestamp: makeDate(2) },
    { id: 'log-seed-003', action: 'Visitor Registered', token: 'VIS-2026-00002', details: 'Anita Verma registered', userName: 'Ramesh Kumar', userRole: 'Security Guard', timestamp: makeDate(1) },
    { id: 'log-seed-004', action: 'Visitor Rejected', token: 'VIS-2026-00003', details: 'Mohit Joshi rejected', userName: 'Suresh Sharma', userRole: 'Plant Head', timestamp: makeDate(3.5) },
    { id: 'log-seed-005', action: 'Visitor Put On Hold', token: 'VIS-2026-00004', details: 'Deepak Singh on hold', userName: 'Suresh Sharma', userRole: 'Plant Head', timestamp: makeDate(1.5) },
    { id: 'log-seed-006', action: 'Visitor Checked In', token: 'VIS-2026-00005', details: 'Sunita Patel checked in', userName: 'Ramesh Kumar', userRole: 'Security Guard', timestamp: makeDate(24) },
    { id: 'log-seed-007', action: 'Visitor Checked Out', token: 'VIS-2026-00005', details: 'Sunita Patel checked out', userName: 'Ramesh Kumar', userRole: 'Security Guard', timestamp: makeDate(22) },
  ];
  write(STORAGE_KEYS.AUDIT_LOGS, logs);
}
