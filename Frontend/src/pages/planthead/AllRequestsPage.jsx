import React from 'react';
import ApprovalRequestsPage from './ApprovalRequestsPage';

// Reuse the full requests page with "All" tab default
export default function AllRequestsPage() {
  return <ApprovalRequestsPage defaultTab="All" />;
}
