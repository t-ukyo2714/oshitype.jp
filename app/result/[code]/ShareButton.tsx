'use client';

import { useState, useEffect } from 'react';
import { buildShareIntentUrl, ResultCode } from '@/lib/result';

export function ShareButton({ code, shareText }: { code: string; shareText: string }) {
    const [url, setUrl] = useState('#');

    useEffect(() => {
        setUrl(buildShareIntentUrl(window.location.origin, code as ResultCode, shareText));
    }, [code, shareText]);

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#1DA1F2] py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.25h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            結果をXでシェアする
        </a>
    );
}
