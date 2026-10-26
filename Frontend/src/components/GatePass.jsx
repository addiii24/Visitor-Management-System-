import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft } from 'lucide-react';
import { getCompanySettings, formatDisplayDateTime, formatDisplayDate } from '../services/storage';
import { StatusBadge } from './ui';

export default function GatePass({ visitor, onClose }) {
  const settings = getCompanySettings();
  const printRef = useRef(null);

  function handlePrint() {
    window.print();
  }

  if (!visitor) return null;

  const qrData = JSON.stringify({ token: visitor.token, id: visitor.id });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Gate Pass
        </button>
      </div>

      {/* Gate Pass Card */}
      <div ref={printRef} className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden max-w-2xl mx-auto shadow-xl print:shadow-none print:border print:max-w-full">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
            <span className="text-white font-bold text-lg">ABC</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg leading-tight">{settings.companyName}</h2>
            <p className="text-blue-200 text-xs">{settings.plantName} · {settings.companyAddress}</p>
            <p className="text-blue-300 text-xs mt-0.5">{settings.gateName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-blue-300 text-xs uppercase tracking-wider">Visitor Gate Pass</p>
            <p className="text-white font-bold font-mono text-sm mt-0.5">{visitor.token}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex gap-5">
            {/* Photo */}
            <div className="flex-shrink-0">
              {visitor.photoDataUrl ? (
                <img src={visitor.photoDataUrl} alt={visitor.visitorName} className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-400">{visitor.visitorName?.charAt(0)}</span>
                  <span className="text-xs text-slate-400 mt-1">No Photo</span>
                </div>
              )}
              <div className="mt-3 flex justify-center">
                <QRCodeSVG value={qrData} size={96} level="M" />
              </div>
            </div>

            {/* Visitor Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{visitor.visitorName}</h3>
                <p className="text-sm text-slate-600">{visitor.companyName}</p>
                <div className="mt-1">
                  <StatusBadge status={visitor.approvalStatus} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Person to Meet', visitor.personToMeet],
                  ['Department', visitor.department],
                  ['Purpose', visitor.visitPurpose],
                  ['Vehicle No.', visitor.vehicleNumber || '—'],
                  ['Companions', visitor.numCompanions],
                  ['Mobile', visitor.mobile],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>{label}</p>
                    <p className="text-slate-800 font-semibold">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-300 my-4" />

          {/* Approval & Timestamps */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Approved By</p>
              <p className="text-slate-800 font-semibold">{visitor.approvedBy || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Approval Time</p>
              <p className="text-slate-800 font-semibold">{formatDisplayDateTime(visitor.approvedAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Pass Issued At</p>
              <p className="text-slate-800 font-semibold">{formatDisplayDateTime(visitor.gatePassIssuedAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Visit Date</p>
              <p className="text-slate-800 font-semibold">{visitor.visitDate}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Visit Time</p>
              <p className="text-slate-800 font-semibold">{visitor.visitTime}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Entry Status</p>
              <p className="text-slate-800 font-semibold">{visitor.visitStatus || 'Not Entered Yet'}</p>
            </div>
          </div>

          {visitor.approvalRemarks && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2.5">
              <p className="text-xs text-green-700"><span className="font-semibold">Remarks:</span> {visitor.approvalRemarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <p>This pass is valid for one-time entry on the stated visit date only.</p>
          <p>{settings.gateName}</p>
        </div>
      </div>

      {/* Print styles injected inline */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible !important; }
          .print\\:shadow-none { position: fixed !important; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
