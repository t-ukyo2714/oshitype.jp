import { NextRequest, NextResponse } from 'next/server';
import { calculateScore } from '@/lib/scoring';
import { AgeBand, MemberMode, QuizPayload } from '@/lib/types';

const ageBands: AgeBand[] = ['u18', '18_24', '25_34', '35_44', '45_54', '55_plus'];
const memberModes: MemberMode[] = ['named', 'hakoshi', 'undecided', 'empty'];

function validatePayload(input: unknown): QuizPayload {
  if (!input || typeof input !== 'object') throw new Error('invalid payload');
  const data = input as Record<string, unknown>;

  const oshiGroup = typeof data.oshi_group === 'string' ? data.oshi_group.trim() : '';
  if (!oshiGroup || oshiGroup.length > 50) throw new Error('oshi_group is required (1-50)');

  const memberMode = data.member_mode;
  if (!memberModes.includes(memberMode as MemberMode)) throw new Error('invalid member_mode');

  const member = typeof data.oshi_member === 'string' ? data.oshi_member.trim() : '';
  if (memberMode === 'named' && (!member || member.length > 50)) throw new Error('oshi_member is required for named mode');

  const ageBand = data.age_band;
  if (!ageBands.includes(ageBand as AgeBand)) throw new Error('age_band is required');

  const answers = data.answers;
  if (!Array.isArray(answers) || answers.length !== 20) throw new Error('answers must be 20 items');
  const parsedAnswers = answers.map((a) => Number(a));
  if (parsedAnswers.some((a) => !Number.isInteger(a) || a < 1 || a > 5)) throw new Error('answers must be integer 1..5');

  return {
    oshi_group: oshiGroup,
    member_mode: memberMode as MemberMode,
    oshi_member: member,
    age_band: ageBand as AgeBand,
    answers: parsedAnswers
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = validatePayload(await req.json());
    const score = calculateScore(payload.answers);

    const gasUrl = process.env.GAS_WEBAPP_URL;
    const token = process.env.LOG_TOKEN;

    let logOk = false;
    let logError = '';

    if (gasUrl && token) {
      try {
        const gasRes = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            created_at: new Date().toISOString(),
            oshi_group: payload.oshi_group,
            member_mode: payload.member_mode,
            oshi_member: payload.oshi_member ?? '',
            age_band: payload.age_band,
            code: score.code,
            Lpct: score.Lpct,
            Spct: score.Spct,
            Opct: score.Opct,
            Npct: score.Npct,
            answers_json: JSON.stringify(payload.answers),
            user_agent: req.headers.get('user-agent') ?? ''
          })
        });

        const gasJson = await gasRes.json();
        logOk = Boolean(gasRes.ok && gasJson?.ok === true);
        if (!logOk) logError = gasJson?.error ?? 'failed to append';
      } catch (error) {
        logError = error instanceof Error ? error.message : 'gas request failed';
      }
    } else {
      logError = 'missing GAS_WEBAPP_URL or LOG_TOKEN';
    }

    return NextResponse.json({ ok: true, score, log: { ok: logOk, error: logError || undefined } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unexpected error' }, { status: 400 });
  }
}
