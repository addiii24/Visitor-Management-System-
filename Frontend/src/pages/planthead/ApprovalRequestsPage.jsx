import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, PauseCircle, User, ChevronLeft, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { approveVisitor, rejectVisitor, holdVisitor, formatDisplayDateTime } from '../../services/storage';
import { Card, Button, StatusBadge, Modal, Textarea, Alert, EmptyState } from '../../components/ui';

const TABS = ['All', 'Pending', 'Approved', 'Rejected', 'On Hold'];

export default function ApprovalRequestsPage() {
  const { visitors, currentUser, refresh } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || null);
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject'|'hold' }
  const [remarks, setRemarks] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const selected = visitors.find((v) => v.id === selectedId) || null;

  useEffect(() => {
    if (searchParams.get('id')) {
      setSelectedId(searchParams.get('id'));
      setActiveTab('All');
    }
  }, []);

  const filtered = visitors.filter((v) => {
    if (activeTab === 'All') return true;
    return v.approvalStatus === activeTab;
  }).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  function handleAction(type) {
    setRemarks('');
    setActionError('');
    setActionModal(type);
  }

  function submitAction() {
    if (!selected) return;
    if ((actionModal === 'reject' || actionModal === 'hold') && !remarks.trim()) {
      setActionError(actionModal === 'reject' ? 'Rejection reason is required.' : 'Hold remarks are required.');
      return;
    }
    let result;
    if (actionModal === 'approve') result = approveVisitor(selected.id, currentUser, remarks);
    if (actionModal === 'reject') result = rejectVisitor(selected.id, currentUser, remarks);
    if (actionModal === 'hold') result = holdVisitor(selected.id, currentUser, remarks);

    refresh();
    setActionModal(null);
    setActionSuccess(`Visitor ${actionModal === 'approve' ? 'approved' : actionModal === 'reject' ? 'rejected' : 'put on hold'} successfully.`);
    setTimeout(() => setActionSuccess(''), 4000);
  }

  const actionTitles = { approve: 'Approve Visitor', reject: 'Reject Visitor', hold: 'Put On Hold' };
  const actionVariants = { approve: 'success', reject: 'danger', hold: 'warning' };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visitor Requests</h1>
        <p className="text-sm text-slate-500">Review and process incoming visitor requests.</p>
      </div>

      {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
        {TABS.map((tab) => {
          const count = tab === 'All' ? visitors.length : visitors.filter((v) => v.approvalStatus === tab).length;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedId(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <Card className="lg:col-span-2 overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No requests" description={`No ${activeTab.toLowerCase()} requests found.`} />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
              {filtered.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedId === v.id ? 'bg-blue-50 border-l-4 border-[#1e3a5f]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {v.photoDataUrl ? (
                      <img src={v.photoDataUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-slate-500">{v.visitorName?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">{v.visitorName}</p>
                        <StatusBadge status={v.approvalStatus} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{v.companyName}</p>
                      <p className="text-xs text-[#1e3a5f] font-mono font-medium">{v.token}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Detail panel */}
        <Card className="lg:col-span-3">
          {!selected ? (
            <EmptyState icon={User} title="Select a request" description="Click a request from the list to view details." />
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{selected.visitorName}</h3>
                  <p className="text-xs font-mono text-[#1e3a5f] font-semibold">{selected.token}</p>
                </div>
                <StatusBadge status={selected.approvalStatus} />
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* Photo */}
                {selected.photoDataUrl && (
                  <img src={selected.photoDataUrl} alt={selected.visitorName} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200" />
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Mobile', selected.mobile],
                    ['Company', selected.companyName],
                    ['Address', selected.companyAddress],
                    ['Person to Meet', selected.personToMeet],
                    ['Department', selected.department],
                    ['Visit Purpose', selected.visitPurpose],
                    ['Vehicle No.', selected.vehicleNumber || '—'],
                    ['Companions', selected.numCompanions],
                    ['ID Type', selected.idType ? `${selected.idType} (…${selected.idLastChars})` : '—'],
                    ['Visit Date', selected.visitDate],
                    ['Visit Time', selected.visitTime],
                    ['Registered By', selected.registeredBy],
                    ['Registered At', formatDisplayDateTime(selected.registeredAt)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-slate-800 font-medium">{val ?? '—'}</p>
                    </div>
                  ))}
                </div>

                {selected.notes && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-0.5">Notes</p>
                    <p className="text-sm text-slate-700">{selected.notes}</p>
                  </div>
                )}

                {/* Previous decision */}
                {selected.approvalStatus !== 'Pending' && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Decision Record</p>
                    <p className="text-sm text-slate-700"><span className="font-medium">Decided by:</span> {selected.approvedBy}</p>
                    <p className="text-sm text-slate-700"><span className="font-medium">At:</span> {formatDisplayDateTime(selected.approvedAt)}</p>
                    {selected.approvalRemarks && <p className="text-sm text-slate-700"><span className="font-medium">Remarks:</span> {selected.approvalRemarks}</p>}
                    {selected.rejectionReason && <p className="text-sm text-red-700"><span className="font-medium">Reason:</span> {selected.rejectionReason}</p>}
                    {selected.holdRemarks && <p className="text-sm text-orange-700"><span className="font-medium">Hold Remarks:</span> {selected.holdRemarks}</p>}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {selected.approvalStatus === 'Pending' && (
                <div className="p-4 border-t border-slate-200 flex gap-2 flex-wrap">
                  <Button variant="success" onClick={() => handleAction('approve')} className="flex-1">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button variant="warning" onClick={() => handleAction('hold')} className="flex-1">
                    <PauseCircle className="w-4 h-4" /> Hold
                  </Button>
                  <Button variant="danger" onClick={() => handleAction('reject')} className="flex-1">
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              )}
              {selected.approvalStatus === 'On Hold' && (
                <div className="p-4 border-t border-slate-200 flex gap-2">
                  <Button variant="success" onClick={() => handleAction('approve')} className="flex-1">
                    <CheckCircle className="w-4 h-4" /> Approve (Re-review)
                  </Button>
                  <Button variant="danger" onClick={() => handleAction('reject')} className="flex-1">
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionTitles[actionModal] || ''}
        size="sm"
      >
        {actionModal === 'approve' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">You are approving <strong>{selected?.visitorName}</strong>. A gate pass will be made available.</p>
            <Textarea
              label="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any approval remarks..."
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={submitAction}>Confirm Approval</Button>
            </div>
          </div>
        )}
        {(actionModal === 'reject' || actionModal === 'hold') && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {actionModal === 'reject'
                ? `You are rejecting the request from ${selected?.visitorName}. A reason is required.`
                : `You are placing ${selected?.visitorName}'s request on hold. Please provide remarks.`}
            </p>
            <Textarea
              label={actionModal === 'reject' ? 'Rejection Reason *' : 'Hold Remarks *'}
              value={remarks}
              onChange={(e) => { setRemarks(e.target.value); setActionError(''); }}
              error={actionError}
              placeholder={actionModal === 'reject' ? 'Provide a clear reason for rejection...' : 'Provide hold remarks...'}
              required
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button variant={actionVariants[actionModal]} className="flex-1" onClick={submitAction}>
                Confirm {actionModal === 'reject' ? 'Rejection' : 'Hold'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
