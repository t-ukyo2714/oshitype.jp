import { ResultCode, ScoreResult } from './types';

const avg = (nums: number[]) => nums.length === 0 ? 3 : nums.reduce((sum, n) => sum + n, 0) / nums.length;
const pctLeft = (left: number, right: number) => Math.round((left / (left + right)) * 100);

export function calculateScore(answers: number[], questionAxes: string[]): ScoreResult {
  if (answers.length !== questionAxes.length) {
    throw new Error(`Answer count mismatch: ${answers.length} vs ${questionAxes.length}`);
  }

  const getAvgFor = (code: string) => {
    const vals = answers.filter((_, i) => questionAxes[i] === code);
    return avg(vals);
  };

  const L = getAvgFor('L');
  const K = getAvgFor('K');
  const S = getAvgFor('S');
  const G = getAvgFor('G');
  const O = getAvgFor('O');
  const E = getAvgFor('E');
  const N = getAvgFor('N');
  const T = getAvgFor('T');

  const Lpct = pctLeft(L, K);
  const Spct = pctLeft(S, G);
  const Opct = pctLeft(O, E);
  const Npct = pctLeft(N, T);

  const code = `${Lpct >= 50 ? 'L' : 'K'}${Spct >= 50 ? 'S' : 'G'}${Opct >= 50 ? 'O' : 'E'}${Npct >= 50 ? 'N' : 'T'}` as ResultCode;

  return { code, Lpct, Spct, Opct, Npct };
}
