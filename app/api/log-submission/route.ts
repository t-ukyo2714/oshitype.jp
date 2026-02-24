import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateScore } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Fetch questions to get the dynamic axis mapping
    const questions = await prisma.question.findMany({ orderBy: { order: 'asc' } });
    const questionAxes = questions.map(q => q.axis);

    const score = calculateScore(data.answers, questionAxes);

    await prisma.submissionLog.create({
      data: {
        oshiGroup: data.oshi_group,
        memberMode: data.member_mode,
        oshiMember: data.oshi_member || null,
        ageBand: data.age_band,
        resultCode: score.code,
        lpct: score.Lpct,
        spct: score.Spct,
        opct: score.Opct,
        npct: score.Npct,
        answersJson: data.answers,
        userAgent: req.headers.get('user-agent')
      }
    });

    return NextResponse.json({ ok: true, score });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Submission failed' }, { status: 500 });
  }
}
