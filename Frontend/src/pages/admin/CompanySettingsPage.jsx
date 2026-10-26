import React, { useState } from 'react';
import { Save, RefreshCw, Building2 } from 'lucide-react';
import { getCompanySettings, saveCompanySettings, resetDemoData } from '../../services/storage';
import { Card, Button, Input, Textarea, Alert, ConfirmDialog } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { DEFAULT_COMPANY_CONFIG } from '../../config/company';

export default function CompanySettingsPage() {
  const { refresh } = useApp();
  const [form, setForm] = useState(getCompanySettings());
  const [saved, setSaved] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    saveCompanySettings(form);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    resetDemoData();
    refresh();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Company Settings</h1>
        <p className="text-sm text-slate-500">Configure company information displayed throughout the application.</p>
      </div>

      {saved && <Alert type="success">Settings saved successfully.</Alert>}

      <form onSubmit={handleSave} className="space-y-5">
        <Card>
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Company Information</h3>
          </div>
          <div className="p-4 space-y-4">
            <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
            <Input label="Plant Name" name="plantName" value={form.plantName} onChange={handleChange} required />
            <Input label="Company Address" name="companyAddress" value={form.companyAddress} onChange={handleChange} required />
            <Input label="Gate Name" name="gateName" value={form.gateName} onChange={handleChange} required />
            <Input label="Application Name" name="appName" value={form.appName} onChange={handleChange} required />
            <Input label="Company Type" name="companyType" value={form.companyType} onChange={handleChange} />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setForm(DEFAULT_COMPANY_CONFIG)}>
            Reset to Defaults
          </Button>
          <Button type="submit" variant="primary">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </form>

      {/* Demo Users Info */}
      <Card>
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Demo Accounts</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {[
              { role: 'Security Guard', username: 'guard', password: 'Guard@123' },
              { role: 'Plant Head', username: 'planthead', password: 'Plant@123' },
              { role: 'HR / Admin', username: 'admin', password: 'Admin@123' },
            ].map((u) => (
              <div key={u.username} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <span className="font-medium text-slate-700 w-36">{u.role}</span>
                <span className="font-mono text-slate-600">u: <strong>{u.username}</strong></span>
                <span className="font-mono text-slate-600">p: <strong>{u.password}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <div className="p-4 border-b border-red-200 bg-red-50 rounded-t-lg">
          <h3 className="font-semibold text-red-800">Danger Zone</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-800 text-sm">Reset Demo Data</p>
              <p className="text-xs text-slate-500">Clears all visitor records, audit logs, and notifications. Reloads sample data. This action cannot be undone.</p>
            </div>
            <Button variant="danger" onClick={() => setResetDialog(true)}>
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={resetDialog}
        onClose={() => setResetDialog(false)}
        onConfirm={handleReset}
        title="Reset Demo Data"
        message="This will permanently delete all visitor records, audit logs, and notifications, and reload sample demo data. Are you sure?"
        confirmLabel="Yes, Reset Everything"
        danger
      />
    </div>
  );
}
