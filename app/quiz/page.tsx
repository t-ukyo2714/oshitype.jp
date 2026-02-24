'use client';

import { questions } from '@/data/questions';
import { AgeBand, MemberMode } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useEffect } from 'react';

const ageBands: { value: AgeBand; label: string }[] = [
  { value: 'u18', label: '18歳未満' },
  { value: '18_24', label: '18-24歳' },
  { value: '25_34', label: '25-34歳' },
  { value: '35_44', label: '35-44歳' },
  { value: '45_54', label: '45-54歳' },
  { value: '55_plus', label: '55歳以上' }
];

type Step = 'profile' | 'quiz' | 'age';

import { questions as staticQuestions } from '@/data/questions';

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [questions, setQuestions] = useState<string[]>(Array.from(staticQuestions));
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [oshiGroup, setOshiGroup] = useState('');
  const [memberMode, setMemberMode] = useState<MemberMode>('empty');
  const [oshiMember, setOshiMember] = useState('');
  const [answers, setAnswers] = useState<number[]>([]);
  const [ageBand, setAgeBand] = useState<AgeBand | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/cms?type=Questions')
      .then(res => res.json())
      .then(res => {
        if (res.ok && res.data && res.data.length > 0) {
          const list = res.data.map((row: any[]) => row[0]).filter(Boolean);
          if (list.length > 0) {
            setQuestions(list);
            setAnswers(new Array(list.length).fill(0));
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (answers.length === 0 && questions.length > 0) {
      setAnswers(new Array(questions.length).fill(0));
    }
  }, [questions, answers.length]);

  const progress = useMemo(() => {
    if (step === 'profile') return 5;
    if (step === 'age') return 95;
    return Math.floor(10 + (currentQuizIdx / questions.length) * 85);
  }, [step, currentQuizIdx]);

  const canGoToQuiz = useMemo(() => {
    return oshiGroup.trim().length > 0 && (memberMode !== 'named' || oshiMember.trim().length > 0);
  }, [oshiGroup, memberMode, oshiMember]);

  const updateAnswer = (value: number) => {
    if (isAdvancing) return;
    setSelectedId(value);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuizIdx] = value;
      return next;
    });
  };

  const handleNext = () => {
    if (selectedId === null || isAdvancing) return;
    setIsAdvancing(true);

    if (currentQuizIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuizIdx(idx => idx + 1);
        setSelectedId(null);
        setIsAdvancing(false);
      }, 300);
    } else {
      setTimeout(() => {
        setStep('age');
        setSelectedId(null);
        setIsAdvancing(false);
      }, 400);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ageBand) {
      setError('年代を選択してください');
      return;
    }

    // Check if all answers are filled
    if (answers.some(a => a === 0)) {
      setError('すべての質問に回答してください');
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
      if (!res.ok) throw new Error(data?.error ?? '診断結果の取得に失敗しました');

      const { score } = data;
      const params = new URLSearchParams({
        lpct: String(score.Lpct), spct: String(score.Spct),
        opct: String(score.Opct), npct: String(score.Npct)
      });
      router.push(`/result/${score.code}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-6 pt-12">
      {/* Progress Bar */}
      <div className="mb-12 space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="premium-gradient h-full transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative flex-1">
        {step === 'profile' && (
          <div className="animate-fade-in space-y-8">
            <header className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">推しについて教えてください</h1>
              <p className="text-sm text-gray-500">あなたの推し活スタイルに合わせて分析します。</p>
            </header>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">推しグループ名 *</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-focus focus:border-purple-300 focus:outline-none focus:ring focus:ring-purple-100 focus:ring-opacity-50"
                  placeholder="例: SEVENTEEN, NewJeans"
                  value={oshiGroup}
                  onChange={(e) => setOshiGroup(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">推しメン（任意）</label>
                <select
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white p-4 shadow-sm focus:border-purple-300 focus:outline-none"
                  value={memberMode}
                  onChange={(e) => setMemberMode(e.target.value as MemberMode)}
                >
                  <option value="empty">未入力</option>
                  <option value="named">特定メンバーあり</option>
                  <option value="hakoshi">箱推し</option>
                  <option value="undecided">まだ決まっていない</option>
                </select>
              </div>
              {memberMode === 'named' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">メンバー名 *</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-focus focus:border-purple-300 focus:outline-none"
                    placeholder="例: スングァン, ハニ"
                    value={oshiMember}
                    onChange={(e) => setOshiMember(e.target.value)}
                    maxLength={50}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (canGoToQuiz) {
                  setError('');
                  setStep('quiz');
                } else {
                  setError('グループ名を入力してください（メンバー名を選択した場合はメンバー名も必須です）');
                }
              }}
              className="premium-gradient w-full rounded-full py-4 font-bold text-white shadow-lg transition-opacity hover:opacity-90 active:scale-95"
            >
              診断をスタート
            </button>
            {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
          </div>
        )}

        {step === 'quiz' && (
          <div key={currentQuizIdx} className="animate-slide-up space-y-12">
            <header className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-purple-500 uppercase">Question {currentQuizIdx + 1} / {questions.length}</div>
              <h2 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                {questions[currentQuizIdx] || 'Loading...'}
              </h2>
            </header>

            <div className="space-y-4">
              {[
                { v: 5, l: 'とても当てはまる' },
                { v: 4, l: 'やや当てはまる' },
                { v: 3, l: 'どちらともいえない' },
                { v: 2, l: 'あまり当てはまらない' },
                { v: 1, l: 'まったく当てはまらない' }
              ].map((choice) => (
                <button
                  key={`${currentQuizIdx}-${choice.v}`}
                  onClick={() => updateAnswer(choice.v)}
                  className={`w-full rounded-2xl border-2 p-5 text-left transition-all hover:bg-purple-50 active:scale-[0.98] ${selectedId === choice.v ? 'border-purple-500 bg-purple-50 font-bold text-purple-700 scale-[1.02] shadow-md' : 'border-gray-100 bg-white text-gray-600'
                    }`}
                >
                  {choice.l}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                disabled={selectedId === null || isAdvancing}
                onClick={handleNext}
                className="premium-gradient w-full rounded-full py-4 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {currentQuizIdx < questions.length - 1 ? '次へ' : '年代の選択へ'}
              </button>

              <button
                onClick={() => currentQuizIdx === 0 ? setStep('profile') : setCurrentQuizIdx(i => i - 1)}
                className="mx-auto w-fit text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                ← 前に戻る
              </button>
            </div>
          </div>
        )}

        {step === 'age' && (
          <form className="space-y-8" onSubmit={onSubmit}>
            <header className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">最後に、年代を教えてください</h2>
              <p className="text-sm text-gray-500">あと一歩で診断結果が出ます。</p>
            </header>
            <div className="grid grid-cols-2 gap-3">
              {ageBands.map((band) => (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => setAgeBand(band.value)}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${ageBand === band.value ? 'border-purple-500 bg-purple-50 font-bold text-purple-700' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                >
                  {band.label}
                </button>
              ))}
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <button
              disabled={loading || !ageBand}
              type="submit"
              className="premium-gradient w-full rounded-full py-4 font-bold text-white shadow-lg transition-opacity disabled:opacity-30"
            >
              {loading ? '解析中...' : '診断結果を見る'}
            </button>
            <button
              type="button"
              onClick={() => setStep('quiz')}
              className="block w-full text-center text-sm font-medium text-gray-400 hover:text-gray-600"
            >
              ← 質問に戻る
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
