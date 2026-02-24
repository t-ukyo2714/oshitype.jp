'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAxisPage() {
    const [axisData, setAxisData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/cms?type=AxisDefinitions')
            .then(res => res.json())
            .then(res => {
                if (res.ok) {
                    // res.data is [[ "Code", "Label", "Sub", "Desc" ], ...]
                    const rows = res.data.slice(1);
                    const map: Record<string, any> = {};
                    rows.forEach((row: any[]) => {
                        if (row[0]) {
                            map[row[0]] = { label: row[1] || '', sub: row[2] || '', desc: row[3] || '' };
                        }
                    });
                    setAxisData(map);
                } else {
                    setError(res.error);
                }
            })
            .catch(() => setError('Failed to fetch data'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        const password = localStorage.getItem('admin_pass');

        try {
            const header = ["Code", "Label", "Sub", "Desc"];
            const rows = [header, ...Object.entries(axisData).map(([code, data]) => [
                code, data.label, data.sub, data.desc
            ])];

            const res = await fetch('/api/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password || '' },
                body: JSON.stringify({ type: 'AxisDefinitions', rows })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);
            alert('Saved successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <main className="mx-auto max-w-4xl p-6 lg:p-12 space-y-8">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/admin" className="text-xs font-bold text-purple-600 uppercase tracking-widest hover:underline">← Dashboard</Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Axis Definitions</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="premium-gradient px-8 py-3 rounded-full font-bold text-white shadow-lg disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save All'}
                </button>
            </header>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>}

            <div className="space-y-6">
                {Object.entries(axisData).map(([code, data]) => (
                    <div key={code} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm grid sm:grid-cols-4 gap-6 items-start">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Axis</label>
                            <div className="text-2xl font-black text-purple-500">{code}</div>
                        </div>
                        <div className="space-y-4 sm:col-span-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Label</label>
                                    <input
                                        className="w-full p-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-200"
                                        value={data.label}
                                        onChange={(e) => setAxisData({ ...axisData, [code]: { ...data, label: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Sub Label</label>
                                    <input
                                        className="w-full p-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-200"
                                        value={data.sub}
                                        onChange={(e) => setAxisData({ ...axisData, [code]: { ...data, sub: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-200 min-h-[80px]"
                                    value={data.desc}
                                    onChange={(e) => setAxisData({ ...axisData, [code]: { ...data, desc: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
