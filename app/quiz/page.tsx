'use client';

import { questions } from '@/data/questions';
import { AgeBand, MemberMode } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

const ageBands: { value: AgeBand; label: string }[] = [
  { value: 'u18', label: '18歳未満' },
  { value: '18_24', label: '18-24歳' },
  { value: '25_34', label: '25-34歳' },
  { value: '35_44', label: '35-44歳' },
  { value: '45_54', label: '45-54歳' },
  { value: '55_plus', label: '55歳以上' }
];

export default function QuizPage() {
  const router = useRouter();
  const [oshiGroup, setOshiGroup] = useState('');
  const [memberMode, setMemberMode] = useState<MemberMode>('empty');
  const [oshiMember, setOshiMember] = useState('');
  const [answers, setAnswers] = useState<number[]>(Array.from({ length: 20 }, () => 3));
  const [ageBand, setAgeBand] = useState<AgeBand | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const validGroup = oshiGroup.trim().length > 0 && oshiGroup.trim().length <= 50;
    const validMember = memberMode !== 'named' || (oshiMember.trim().length > 0 && oshiMember.trim().length <= 50);
    return validGroup && validMember && ageBand !== '';
  }, [oshiGroup, memberMode, oshiMember, ageBand]);

  const updateAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('必須項目を入力してください。年代は必須です。');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        oshi_group: oshiGroup.trim(),
        member_mode: memberMode,
        oshi_member: memberMode === 'named' ? oshiMember.trim() : '',
        age_band: ageBand,
        answers
      };

      const res = await fetch('/api/log-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data?.score?.code) {
        throw new Error(data?.error ?? '診断結果の取得に失敗しました');
      }

      const score = data.score;
      const params = new URLSearchParams({
        lpct: String(score.Lpct),
        spct: String(score.Spct),
        opct: String(score.Opct),
        npct: String(score.Npct)
      });
      router.push(`/result/${score.code}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">推しタイプ診断</h1>
      <form className="space-y-8" onSubmit={onSubmit}>
        <section className="space-y-4 rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">プロフィール</h2>
          <label className="block">
            <span className="mb-1 block text-sm">推しグループ（必須）</span>
            <input className="w-full rounded border p-2" value={oshiGroup} onChange={(e) => setOshiGroup(e.target.value)} maxLength={50} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm">推しメン状態（任意）</span>
            <select className="w-full rounded border p-2" value={memberMode} onChange={(e) => setMemberMode(e.target.value as MemberMode)}>
              <option value="empty">未入力</option>
              <option value="named">特定メンバーあり</option>
              <option value="hakoshi">箱推し</option>
              <option value="undecided">未確定</option>
            </select>
          </label>
          {memberMode === 'named' && (
            <label className="block">
              <span className="mb-1 block text-sm">推しメン名</span>
              <input className="w-full rounded border p-2" value={oshiMember} onChange={(e) => setOshiMember(e.target.value)} maxLength={50} required />
            </label>
          )}
        </section>

        <section className="space-y-4 rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">Q1〜Q20（1:まったく当てはまらない〜5:とても当てはまる）</h2>
          {questions.map((question, index) => (
            <div key={question} className="rounded border p-3">
              <p className="mb-2 text-sm font-medium">Q{index + 1}. {question}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((choice) => (
                  <label key={choice} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`q-${index + 1}`}
                      checked={answers[index] === choice}
                      onChange={() => updateAnswer(index, choice)}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4 rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">年代（必須）</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ageBands.map((band) => (
              <label key={band.value} className="flex items-center gap-2 rounded border p-2">
                <input
                  type="radio"
                  name="age_band"
                  value={band.value}
                  checked={ageBand === band.value}
                  onChange={() => setAgeBand(band.value)}
                  required
                />
                {band.label}
              </label>
            ))}
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={loading || !canSubmit} className="rounded bg-black px-6 py-3 text-white disabled:opacity-40" type="submit">
          {loading ? '判定中...' : '結果を見る'}
        </button>
      </form>
    </main>
  );
}
