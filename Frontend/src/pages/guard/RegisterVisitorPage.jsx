import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createVisitor } from '../../services/storage';
import { DEPARTMENTS, VISIT_PURPOSES, ID_TYPES } from '../../config/company';
import { Card, Button, Input, Select, Textarea, Alert } from '../../components/ui';

const INITIAL_FORM = {
  visitorName: '',
  mobile: '',
  companyName: '',
  companyAddress: '',
  personToMeet: '',
  department: '',
  visitPurpose: '',
  vehicleNumber: '',
  numCompanions: 0,
  idType: '',
  idLastChars: '',
  visitDate: new Date().toISOString().slice(0, 10),
  visitTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  notes: '',
  photoDataUrl: '',
};

export default function RegisterVisitorPage() {
  const { currentUser, refresh } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image file.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setForm((prev) => ({ ...prev, photoDataUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoPreview('');
    setForm((prev) => ({ ...prev, photoDataUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate() {
    const errs = {};
    if (!form.visitorName.trim()) errs.visitorName = 'Visitor name is required.';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.companyName.trim()) errs.companyName = 'Company / Organization name is required.';
    if (!form.companyAddress.trim()) errs.companyAddress = 'Address is required.';
    if (!form.personToMeet.trim()) errs.personToMeet = 'Person to meet is required.';
    if (!form.department) errs.department = 'Department is required.';
    if (!form.visitPurpose) errs.visitPurpose = 'Visit purpose is required.';
    if (!form.visitDate) errs.visitDate = 'Visit date is required.';
    if (!form.visitTime) errs.visitTime = 'Visit time is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      const visitor = createVisitor(form, currentUser);
      refresh();
      setSuccessInfo({ token: visitor.token, name: visitor.visitorName });
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to register visitor. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewRegistration() {
    setForm(INITIAL_FORM);
    setErrors({});
    setPhotoPreview('');
    setSuccessInfo(null);
  }

  if (successInfo) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Visitor Registered Successfully</h2>
          <p className="text-slate-600 mb-4">{successInfo.name} has been registered and the request is pending approval.</p>
          <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-500 mb-1">Visitor Token</p>
            <p className="text-2xl font-bold font-mono text-[#1e3a5f]">{successInfo.token}</p>
            <p className="text-xs text-slate-500 mt-1">Status: Pending Approval</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/guard')}>
              Dashboard
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleNewRegistration}>
              Register Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/guard')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Register New Visitor</h1>
          <p className="text-sm text-slate-500">All required fields must be filled before submission.</p>
        </div>
      </div>

      {errors.submit && <Alert type="error" onClose={() => setErrors((p) => ({ ...p, submit: '' }))}>{errors.submit}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Visitor Info */}
        <Card>
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Visitor Information</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Visitor Photograph <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200" />
                    <button type="button" onClick={removePhoto} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4" /> Upload Photo
                  </Button>
                  {errors.photo && <p className="text-xs text-red-600 mt-1">{errors.photo}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Full Name" name="visitorName" value={form.visitorName} onChange={handleChange} error={errors.visitorName} placeholder="Enter visitor's full name" required />
              </div>
              <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="10-digit mobile number" required maxLength={10} />
              <Input label="Company / Organization" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} placeholder="Visitor's company name" required />
              <div className="sm:col-span-2">
                <Input label="Address" name="companyAddress" value={form.companyAddress} onChange={handleChange} error={errors.companyAddress} placeholder="Full address" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="ID Type" name="idType" value={form.idType} onChange={handleChange}>
                <option value="">Select ID type</option>
                {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Input label="Last few ID characters" name="idLastChars" value={form.idLastChars} onChange={handleChange} placeholder="e.g. 4521" maxLength={6} />
            </div>
          </div>
        </Card>

        {/* Visit Details */}
        <Card>
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Visit Details</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Person to Meet" name="personToMeet" value={form.personToMeet} onChange={handleChange} error={errors.personToMeet} placeholder="Name of person to visit" required />
              <Select label="Department" name="department" value={form.department} onChange={handleChange} error={errors.department} required>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <div className="sm:col-span-2">
                <Select label="Purpose of Visit" name="visitPurpose" value={form.visitPurpose} onChange={handleChange} error={errors.visitPurpose} required>
                  <option value="">Select visit purpose</option>
                  {VISIT_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <Input label="Expected Visit Date" name="visitDate" type="date" value={form.visitDate} onChange={handleChange} error={errors.visitDate} required />
              <Input label="Expected Visit Time" name="visitTime" type="time" value={form.visitTime} onChange={handleChange} error={errors.visitTime} required />
              <Input label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. RJ-19-AB-1234 (optional)" />
              <Input
                label="No. of Accompanying Visitors"
                name="numCompanions"
                type="number"
                min={0}
                max={20}
                value={form.numCompanions}
                onChange={handleChange}
              />
            </div>
            <Textarea label="Additional Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional information..." />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/guard')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Visitor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
