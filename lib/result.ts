import { resultCopy } from '@/data/resultCopy';
import { ResultCode } from './types';

export type { ResultCode };

export const resultCodes = Object.keys(resultCopy) as ResultCode[];

export function isResultCode(code: string): code is ResultCode {
  return resultCodes.includes(code as ResultCode);
}

export function buildShareIntentUrl(origin: string, code: ResultCode, shareText: string): string {
  const url = new URL(`/result/${code}`, origin);
  url.searchParams.set('utm_source', 'x');
  url.searchParams.set('utm_medium', 'share');
  url.searchParams.set('utm_campaign', 'oshitype');
  url.searchParams.set('utm_content', code);

  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('text', shareText);
  intent.searchParams.set('url', url.toString());
  return intent.toString();
}
