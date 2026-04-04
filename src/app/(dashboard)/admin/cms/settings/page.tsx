'use client';

import { useState, useEffect } from 'react';
import { saveSettings } from '@/app/actions/cms-actions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsCMS() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const res = await fetch('/api/web/settings');
        const data = await res.json();
        setSettings(data.data || {});
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    await saveSettings(data);
    setSaving(false);
    alert('Pengaturan website berhasil disimpan!');
    
    // Refresh settings
    const res = await fetch('/api/web/settings');
    const updatedData = await res.json();
    setSettings(updatedData.data || {});
  }

  const sections = [
    {
      title: "Informasi Sekolah",
      fields: [
        { key: "school_name", label: "Nama Sekolah", placeholder: "MI As-Sa'adah" },
        { key: "school_address", label: "Alamat Lengkap", placeholder: "Jl. ..." },
        { key: "school_phone", label: "Nomor Telepon", placeholder: "08..." },
        { key: "school_email", label: "Email Resmi", placeholder: "admin@..." },
      ]
    },
    {
      title: "Media Sosial",
      fields: [
        { key: "social_facebook", label: "Facebook Link", placeholder: "https://facebook.com/..." },
        { key: "social_instagram", label: "Instagram Link", placeholder: "https://instagram.com/..." },
        { key: "social_youtube", label: "Youtube Link", placeholder: "https://youtube.com/..." },
        { key: "social_tiktok", label: "Tiktok Link", placeholder: "https://tiktok.com/..." },
      ]
    },
    {
      title: "SEO & Branding",
      fields: [
        { key: "web_title", label: "Website Title", placeholder: "Profil MI As-Sa'adah - Modern & Kreatif" },
        { key: "web_description", label: "Meta Description", placeholder: "Portal resmi ..." },
        { key: "web_keywords", label: "Keywords (pisahkan koma)", placeholder: "madrasah, sekolah, ..." },
        { key: "web_logo_url", label: "Link Logo Sekolah", placeholder: "https://..." },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Website</h1>
          <p className="text-slate-500">Kelola identitas, media sosial, dan SEO website profil.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-300 animate-pulse">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          <div className="space-y-6">
            {sections.map((section, si) => (
              <div key={si} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  {section.title}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{f.label}</label>
                      <Input name={f.key} defaultValue={settings[f.key] || ''} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
