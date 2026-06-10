'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Bell, Shield, Globe, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const sections = [
    {
      icon: Globe,
      title: 'Store Settings',
      fields: [
        { label: 'Store Name', value: 'ShopHub', type: 'text' },
        { label: 'Store Email', value: 'support@shophub.com', type: 'email' },
        { label: 'Store URL', value: 'https://shophub.com', type: 'url' },
        { label: 'Currency', value: 'INR', type: 'text' },
      ],
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      fields: [
        { label: 'Order Notifications', value: 'true', type: 'checkbox' },
        { label: 'New User Alerts', value: 'true', type: 'checkbox' },
        { label: 'Low Stock Alerts', value: 'true', type: 'checkbox' },
      ],
    },
    {
      icon: Shield,
      title: 'Security Settings',
      fields: [
        { label: 'Two-Factor Auth', value: 'false', type: 'checkbox' },
        { label: 'Session Timeout (minutes)', value: '60', type: 'number' },
      ],
    },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Settings saved!');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : <Settings className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Admin Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Admin Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{session?.user?.name}</p>
            <p className="text-gray-400 text-sm">{session?.user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded-full">Administrator</span>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <section.icon className="h-4 w-4 text-orange-400" />
            </div>
            <h2 className="text-base font-semibold text-white">{section.title}</h2>
          </div>

          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.label} className="flex items-center justify-between">
                <label className="text-sm text-gray-300">{field.label}</label>
                {field.type === 'checkbox' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={field.value === 'true'} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                ) : (
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-48 h-9 px-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
