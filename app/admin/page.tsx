'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we'd verify this against the server. 
        // For this simple version, we'll try a dummy fetch to see if it works with this password.
        if (password) {
            localStorage.setItem('admin_pass', password);
            setIsAuth(true);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('admin_pass');
        if (saved) setIsAuth(true);
    }, []);

    if (!isAuth) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
                <div className="w-full max-w-sm space-y-8 rounded-3xl bg-white p-10 shadow-xl">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                        <p className="text-sm text-gray-500">管理画面にログインします</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full rounded-xl border border-gray-200 p-4 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="premium-gradient w-full rounded-full py-4 font-bold text-white shadow-lg">
                            Login
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl p-6 lg:p-12 space-y-12">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500">診断コンテンツの管理</p>
                </div>
                <button
                    onClick={() => { localStorage.removeItem('admin_pass'); setIsAuth(false); }}
                    className="text-sm font-medium text-red-500 hover:underline"
                >
                    Logout
                </button>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <MenuCard
                    title="Questions"
                    desc="診断の設問文を編集します"
                    href="/admin/questions"
                    icon="📝"
                />
                <MenuCard
                    title="Results"
                    desc="タイプごとの診断結果・テキストを編集します"
                    href="/admin/results"
                    icon="✨"
                />
                <MenuCard
                    title="Axis"
                    desc="診断軸（L/K/S/G...）の定義を編集します"
                    href="/admin/axis"
                    icon="📊"
                />
            </div>

            <div className="rounded-3xl bg-purple-50 p-8 border border-purple-100">
                <h2 className="text-lg font-bold text-purple-900 mb-2">Notice</h2>
                <p className="text-sm text-purple-700 leading-relaxed">
                    ここでの変更はスプレッドシートに直接書き込まれます。
                    変更が反映されない場合は、GAS（Google Apps Script）のデプロイURLが正しいか確認してください。
                </p>
            </div>

            <Link href="/" className="block text-center text-sm font-medium text-gray-400 hover:text-gray-600">
                ← 公開サイトへ戻る
            </Link>
        </main>
    );
}

function MenuCard({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
    return (
        <Link
            href={href}
            className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-purple-200"
        >
            <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </Link>
    );
}
