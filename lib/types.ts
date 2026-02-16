export type AgeBand = 'u18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus';

export type MemberMode = 'named' | 'hakoshi' | 'undecided' | 'empty';

export type QuizPayload = {
  oshi_group: string;
  member_mode: MemberMode;
  oshi_member?: string;
  age_band: AgeBand;
  answers: number[];
};

export type ResultCopy = {
  title: string;
  feature: string[];
  aruaru: string[];
  strength: string[];
  caution: string[];
  shareText: string;
};

export type ResultCode = `${'L' | 'K'}${'S' | 'G'}${'O' | 'E'}${'N' | 'T'}`;

export type ScoreResult = {
  code: ResultCode;
  Lpct: number;
  Spct: number;
  Opct: number;
  Npct: number;
};
