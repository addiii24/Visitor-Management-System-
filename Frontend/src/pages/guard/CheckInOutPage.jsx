import React, { useState } from 'react';
import { Search, CheckCircle, LogOut, AlertCircle, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkInVisitor, checkOutVisitor, getVisitorByToken, formatDisplayDateTime } from '../../services/storage';
import { Card, Button, StatusBadge, Alert } from '../../components/ui';

export default function CheckInOutPage() {
  const { currentUser, refresh } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [found, setFound] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState(null);

  function handleSearch(e) {
    e.preventDefault();
    const token = tokenInput.trim().toUpperCase();
    if (!token) return;
    const visitor = getVisitorByToken(token);
    if (visitor) {
      setFound(visitor);
      setNotFound(false);
      setResult(null);
    } else {
      setFound(null);
      setNotFound(true);
    }
  }

  function handleCheckIn() {
    if (!found) return;
    const res = checkInVisitor(found.id, currentUser);
    setResult(res);
    if (res.success) { setFound(res.visitor); refresh(); }
  }

  function handleCheckOut() {
    if (!found) return;
    const res = checkOutVisitor(found.id, currentUser);
    setResult(res);
    if (res.success) { setFound(res.visitor); refresh(); }
  }

  function reset() {
    setTokenInput('');
    setFound(null);
    setNotFound(false);
    setResult(null);
  }

  const canCheckIn = found && found.approvalStatus === 'Approved' && found.visitStatus !== 'Checked In' && found.visitStatus !== 'Checked Out';
  const canCheckOut = found && found.visitStatus === 'Checked In';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Check In / Check Out</h1>
        <p className="text-sm text-slate-500">Enter visitor token to look up and record entry or exit.</p>
      </div>

      {/* Token Lookup */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Visitor Lookup</h3>
        </div>
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="Enter token e.g. VIS-2026-00001"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
            {found && <Button type="button" variant="secondary" onClick={reset}>Clear</Button>}
          </form>
        </div>
      </Card>

      {notFound && (
        <Alert type="error">No visitor found with token <strong>{tokenInput}</strong>. Please verify the token.</Alert>
      )}

      {result && (
        <Alert type={result.success ? 'success' : 'error'} onClose={() => setResult(null)}>
          {result.success ? (
            <>✓ {result.visitor?.visitStatus === 'Checked In' ? 'Visitor checked in' : 'Visitor checked out'} successfully at {formatDisplayDateTime(result.visitor?.visitStatus === 'Checked In' ? result.visitor.checkedInAt : result.visitor.checkedOutAt)}.</>
          ) : result.message}
        </Alert>
      )}

      {/* Visitor Details */}
      {found && (
        <Card>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Visitor Details</h3>
            <StatusBadge status={found.status} />
          </div>
          <div className="p-4">
            <div className="flex items-start gap-4 mb-4">
              {found.photoDataUrl ? (
                <img src={found.photoDataUrl} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-slate-200 flex-shrink-0">
                  <User className="w-7 h-7 text-slate-400" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-slate-800">{found.visitorName}</h4>
                <p className="text-sm text-slate-600">{found.companyName}</p>
                <p className="font-mono text-xs text-[#1e3a5f] font-semibold mt-1">{found.token}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-xs text-slate-500">Mobile</p>
                <p className="text-slate-800 font-medium">{found.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">To Meet</p>
                <p className="text-slate-800 font-medium">{found.personToMeet}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="text-slate-800 font-medium">{found.department}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Purpose</p>
                <p className="text-slate-800 font-medium">{found.visitPurpose}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Approval Status</p>
                <StatusBadge status={found.approvalStatus} />
              </div>
              {found.approvedBy && (
                <div>
                  <p className="text-xs text-slate-500">Approved By</p>
                  <p className="text-slate-800 font-medium">{found.approvedBy}</p>
                </div>
              )}
              {found.checkedInAt && (
                <div>
                  <p className="text-xs text-slate-500">Checked In</p>
                  <p className="text-slate-800 font-medium">{formatDisplayDateTime(found.checkedInAt)}</p>
                </div>
              )}
              {found.checkedOutAt && (
                <div>
                  <p className="text-xs text-slate-500">Checked Out</p>
                  <p className="text-slate-800 font-medium">{formatDisplayDateTime(found.checkedOutAt)}</p>
                </div>
              )}
            </div>

            {/* Rejection / Hold info */}
            {found.approvalStatus === 'Rejected' && (
              <Alert type="error">
                <strong>Entry Denied:</strong> {found.rejectionReason}
              </Alert>
            )}
            {found.approvalStatus === 'On Hold' && (
              <Alert type="warning">
                <strong>On Hold:</strong> {found.holdRemarks}
              </Alert>
            )}
            {found.visitStatus === 'Checked Out' && (
              <Alert type="info">This visitor has already completed their visit and checked out.</Alert>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              {canCheckIn && (
                <Button variant="success" className="flex-1" onClick={handleCheckIn}>
                  <CheckCircle className="w-4 h-4" /> Record Entry (Check In)
                </Button>
              )}
              {canCheckOut && (
                <Button variant="warning" className="flex-1" onClick={handleCheckOut}>
                  <LogOut className="w-4 h-4" /> Record Exit (Check Out)
                </Button>
              )}
              {!canCheckIn && !canCheckOut && found.approvalStatus === 'Approved' && found.visitStatus === 'Checked Out' && (
                <p className="text-sm text-slate-500">Visit completed.</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
