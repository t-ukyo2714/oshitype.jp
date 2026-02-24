'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminResultsPage() {
    const [resultsData, setResultsData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeCode, setActiveCode] = useState<string>('');

    useEffect(() => {
        fetch('/api/cms?type=Results')
            .then(res => res.json())
            .then(res => {
                if (res.ok) {
                    // res.data is [[ "Code", "Title", "Features", "Aruaru", "Strength", "Caution", "ShareText" ], ...]
                    const header = res.data[0];
                    const rows = res.data.slice(1);
                    const map: Record<string, any> = {};
                    rows.forEach((row: any[]) => {
                        if (row[0]) {
                            map[row[0]] = {
                                title: row[1] || '',
                                feature: row[2] ? JSON.parse(row[2]) : [],
                                aruaru: row[3] ? JSON.parse(row[3]) : [],
                                strength: row[4] ? JSON.parse(row[4]) : [],
                                caution: row[5] ? JSON.parse(row[5]) : [],
                                shareText: row[6] || '',
                                imageUrl: row[7] || '',
                                ogpImageUrl: row[8] || ''
                            };
                        }
                    });
                    setResultsData(map);
                    if (Object.keys(map).length > 0) setActiveCode(Object.keys(map)[0]);
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
            const header = ["Code", "Title", "Features", "Aruaru", "Strength", "Caution", "ShareText", "ImageUrl", "OgpImageUrl"];
            const rows = [header, ...Object.entries(resultsData).map(([code, data]) => [
                code,
                data.title,
                JSON.stringify(data.feature),
                JSON.stringify(data.aruaru),
                JSON.stringify(data.strength),
                JSON.stringify(data.caution),
                data.shareText,
                data.imageUrl,
                data.ogpImageUrl
            ])];

            const res = await fetch('/api/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password || '' },
                body: JSON.stringify({ type: 'Results', rows })
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

    const current = resultsData[activeCode] || {};

    return (
        <main className="mx-auto max-w-5xl p-6 lg:p-12 space-y-8">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/admin" className="text-xs font-bold text-purple-600 uppercase tracking-widest hover:underline">← Dashboard</Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Results</h1>
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

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-48 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                    {Object.keys(resultsData).map(code => (
                        <button
                            key={code}
                            onClick={() => setActiveCode(code)}
                            className={`px-4 py-3 text-left rounded-2xl text-sm font-bold transition-all ${activeCode === code ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            {code}
                        </button>
                    ))}
                </aside>

                <section className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Title</label>
                        <input
                            className="w-full text-xl font-bold p-3 border-b-2 border-gray-50 focus:border-purple-200 outline-none"
                            value={current.title}
                            onChange={(e) => setResultsData({ ...resultsData, [activeCode]: { ...current, title: e.target.value } })}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Result Page Image URL</label>
                            <input
                                className="w-full text-sm p-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-200 focus:bg-white outline-none transition-all"
                                placeholder="https://example.com/result.png"
                                value={current.imageUrl || ''}
                                onChange={(e) => setResultsData({ ...resultsData, [activeCode]: { ...current, imageUrl: e.target.value } })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">OGP Image URL</label>
                            <input
                                className="w-full text-sm p-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-200 focus:bg-white outline-none transition-all"
                                placeholder="https://example.com/ogp.png"
                                value={current.ogpImageUrl || ''}
                                onChange={(e) => setResultsData({ ...resultsData, [activeCode]: { ...current, ogpImageUrl: e.target.value } })}
                            />
                        </div>
                    </div>

                    <ArrayField
                        label="Features (特徴)"
                        items={current.feature}
                        onChange={(items) => setResultsData({ ...resultsData, [activeCode]: { ...current, feature: items } })}
                    />
                    <ArrayField
                        label="Aruaru (あるある)"
                        items={current.aruaru}
                        onChange={(items) => setResultsData({ ...resultsData, [activeCode]: { ...current, aruaru: items } })}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                        <ArrayField
                            label="Strength (強み)"
                            items={current.strength}
                            onChange={(items) => setResultsData({ ...resultsData, [activeCode]: { ...current, strength: items } })}
                        />
                        <ArrayField
                            label="Caution (注意点)"
                            items={current.caution}
                            onChange={(items) => setResultsData({ ...resultsData, [activeCode]: { ...current, caution: items } })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Share Text</label>
                        <textarea
                            className="w-full min-h-[100px] p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-100"
                            value={current.shareText}
                            onChange={(e) => setResultsData({ ...resultsData, [activeCode]: { ...current, shareText: e.target.value } })}
                        />
                    </div>
                </section> section
            </div>
        </main>
    );
}

function ArrayField({ label, items = [], onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            className="flex-1 bg-gray-50 p-2 px-4 rounded-xl text-sm outline-none focus:bg-purple-50"
                            value={it}
                            onChange={(e) => {
                                const next = [...items];
                                next[i] = e.target.value;
                                onChange(next);
                            }}
                        />
                        <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-gray-300">×</button>
                    </div>
                ))}
                <button onClick={() => onChange([...items, ''])} className="text-xs font-bold text-purple-400">+ Add line</button>
            </div>
        </div>
    );
}
