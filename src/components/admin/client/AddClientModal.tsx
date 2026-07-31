import React, { useState } from 'react';
import type { Client } from '../../../types/salon';
import Button from '../../ui/Button';
interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => void;
  availableStaff?: { id: string; name: string }[];
  availableServices?: string[];
}

const DEFAULT_SERVICES = [
  'Haircut', 'Hair Color', 'Facial', 'Beard Trim',
  'Manicure', 'Pedicure', 'Massage', 'Hair Spa'
];

export default function AddClientModal({
  isOpen,
  onClose,
  onSave,
  availableStaff = [
    { id: '1', name: 'Alex Johnson' },
    { id: '2', name: 'Maria Garcia' },
    { id: '3', name: 'Sam Taylor' }
  ],
  availableServices = DEFAULT_SERVICES
}: AddClientModalProps) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    fullName: '',
    phone: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    preferredServices: [],
    preferredStaffId: '',
    preferredTimeSlot: '',
    notes: '',
    profilePhotoUrl: '',
  });

  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Form Validation: Only Name and Phone are required
  const validate = () => {
    const newErrors: { fullName?: string; phone?: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      profilePhotoUrl: photoPreview || formData.profilePhotoUrl
    });

    onClose();
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const current = prev.preferredServices || [];
      const updated = current.includes(service)
        ? current.filter(s => s !== service)
        : [...current, service];
      return { ...prev, preferredServices: updated };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
            <p className="text-xs text-gray-500 mt-0.5">Quick register new salon client</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 👤 1. CORE FIELDS (REQUIRED MVP) */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
              <span>👤</span> Basic Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                    }`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
                    }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street address, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 💇 2. SALON PREFERENCES */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <span>✂️</span> Salon Preferences
            </h3>

            {/* Preferred Services Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Services</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((service) => {
                  const isSelected = formData.preferredServices?.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{service}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferred Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Stylist / Staff</label>
                <select
                  value={formData.preferredStaffId}
                  onChange={(e) => {
                    const selected = availableStaff.find(s => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      preferredStaffId: e.target.value,
                      preferredStaffName: selected?.name || ''
                    });
                  }}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="">No preference</option>
                  {availableStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Time Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time Slot</label>
                <select
                  value={formData.preferredTimeSlot}
                  onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value as any })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="">Any Time</option>
                  <option value="Morning">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 🧠 3. NOTES & PHOTO */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <span>🧠</span> Notes & Photo
            </h3>

            {/* Client Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Notes / Allergies</label>
              <textarea
                rows={3}
                placeholder="e.g. Prefers short haircut, allergic to ammonia dyes, likes complimentary tea."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl text-gray-400">👤</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}