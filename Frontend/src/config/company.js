// Centralized company configuration
// All company-specific values must be read from this file or from localStorage (CompanySettings)

export const DEFAULT_COMPANY_CONFIG = {
  companyName: 'ABC Manufacturing Industries Pvt. Ltd.',
  companyAddress: 'Industrial Area, Jodhpur, Rajasthan, India',
  companyType: 'Manufacturing / Industrial Plant',
  plantName: 'Main Manufacturing Plant',
  gateName: 'Main Security Gate',
  appName: 'VMS — Visitor Management System',
  timeZone: 'Asia/Kolkata',
  dateFormat: 'DD MMM YYYY',
  timeFormat: '12h',
  currency: 'INR',
  logoText: 'ABC', // Placeholder until real logo
};

export const DEMO_USERS = [
  {
    id: 'user-guard-001',
    username: 'guard',
    password: 'Guard@123',
    name: 'Ramesh Kumar',
    role: 'guard',
    roleLabel: 'Security Guard',
    email: 'guard@abcmfg.com',
  },
  {
    id: 'user-planthead-001',
    username: 'planthead',
    password: 'Plant@123',
    name: 'Suresh Sharma',
    role: 'planthead',
    roleLabel: 'Plant Head',
    email: 'planthead@abcmfg.com',
  },
  {
    id: 'user-admin-001',
    username: 'admin',
    password: 'Admin@123',
    name: 'Priya Mehta',
    role: 'admin',
    roleLabel: 'HR / Administrator',
    email: 'admin@abcmfg.com',
  },
];

export const DEPARTMENTS = [
  'Plant Head',
  'HR',
  'PPC',
  'Purchase',
  'Production',
  'Maintenance',
  'Finance',
  'Other',
];

export const VISIT_PURPOSES = [
  'Business Meeting',
  'Interview',
  'Vendor/Supplier Visit',
  'Audit/Inspection',
  'Maintenance/Service',
  'Delivery',
  'Personal Visit',
  'Government/Official',
  'Other',
];

export const ID_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Voter ID',
  'Employee ID',
  'Other',
];

export const VISITOR_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  EXPIRED: 'Expired',
};
