import { ResultCode, ScoreResult } from './types';

const avg = (nums: number[]) => nums.reduce((sum, n) => sum + n, 0) / nums.length;

const pctLeft = (left: number, right: number) => Math.round((left / (left + right)) * 100);

export function calculateScore(answers: number[]): ScoreResult {
  if (answers.length !== 20 || answers.some((a) => a < 1 || a > 5)) {
    throw new Error('answers must contain 20 integers in range 1..5');
  }

  const loop = avg([answers[0], answers[1], answers[2]]);
  const keep = avg([answers[3], answers[4]]);
  const solo = avg([answers[5], answers[6]]);
  const group = avg([answers[7], answers[8], answers[9]]);
  const observe = avg([answers[10], answers[11]]);
  const express = avg([answers[12], answers[13], answers[14]]);
  const intuitive = avg([answers[15], answers[16]]);
  const track = avg([answers[17], answers[18], answers[19]]);

  const Lpct = pctLeft(loop, keep);
  const Spct = pctLeft(solo, group);
  const Opct = pctLeft(observe, express);
  const Npct = pctLeft(intuitive, track);

  const code = `${Lpct >= 50 ? 'L' : 'K'}${Spct >= 50 ? 'S' : 'G'}${Opct >= 50 ? 'O' : 'E'}${Npct >= 50 ? 'N' : 'T'}` as ResultCode;

  if (!/^[LK][SG][OE][NT]$/.test(code)) {
    throw new Error('invalid result code');
  }

  return { code, Lpct, Spct, Opct, Npct };
}
