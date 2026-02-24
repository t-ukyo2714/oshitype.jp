'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminQuestionsPage() {
    const [questionsList, setQuestionsList] = useState<{ text: string; axis: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const AXES = [
        { code: 'L', label: 'Loop (瞬間没入)' },
        { code: 'K', label: 'Keep (積み置き)' },
        { code: 'S', label: 'Solo (自分中心)' },
        { code: 'G', label: 'Group (共鳴・共有)' },
        { code: 'O', label: 'Observe (受容・鑑賞)' },
        { code: 'E', label: 'Express (出力・布教)' },
        { code: 'N', label: 'N (直感・気分)' },
        { code: 'T', label: 'Track (把握・計画)' }
    ];

    useEffect(() => {
        fetch('/api/cms?type=Questions')
            .then(res => res.json())
            .then(res => {
                if (res.ok) {
                    setQuestionsList(res.data.map((row: any[]) => ({ text: row[0], axis: row[1] || 'L' })));
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
            const rows = questionsList.map(q => [q.text, q.axis]);
            const res = await fetch('/api/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password || '' },
                body: JSON.stringify({ type: 'Questions', rows })
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Questions</h1>
                    <p className="text-sm text-gray-500">各設問のテキストと関連する診断軸を設定します</p>
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

            <div className="space-y-4">
                {questionsList.map((q, idx) => (
                    <div key={idx} className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm focus-within:border-purple-200 focus-within:ring-2 focus-within:ring-purple-50 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-300">Q{idx + 1}</span>
                            <div className="flex items-center gap-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Related Axis</label>
                                <select
                                    value={q.axis}
                                    onChange={(e) => {
                                        const newList = [...questionsList];
                                        newList[idx].axis = e.target.value;
                                        setQuestionsList(newList);
                                    }}
                                    className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-1.5 text-purple-600 focus:ring-2 focus:ring-purple-100 outline-none"
                                >
                                    {AXES.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
                                </select>
                                <button
                                    onClick={() => setQuestionsList(questionsList.filter((_, i) => i !== idx))}
                                    className="ml-2 text-gray-300 hover:text-red-400 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full min-h-[60px] text-sm font-medium text-gray-700 bg-transparent outline-none resize-none"
                            placeholder="設問文を入力..."
                            value={q.text}
                            onChange={(e) => {
                                const newList = [...questionsList];
                                newList[idx].text = e.target.value;
                                setQuestionsList(newList);
                            }}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={() => setQuestionsList([...questionsList, { text: '', axis: 'L' }])}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-purple-200 hover:text-purple-400 transition-all"
            >
                + Add Question
            </button>
        </main>
    );
}
