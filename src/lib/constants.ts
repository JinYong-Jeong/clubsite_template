export const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
  ob: 'OB',
};

export const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-aing-blue/30 bg-aing-blue/10',
  senior: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  admin: 'text-green-400 border-green-400/30 bg-green-400/10',
  ob: 'text-gray-500 border-gray-300 bg-gray-100',
};

export const STATUS_LABELS: Record<string, string> = {
  busy: '바쁨',
  mid: '프로젝트 관심',
  free: '프로젝트 희망',
};

export const STATUS_COLORS: Record<string, string> = {
  busy: 'text-red-500 border-red-200 bg-red-50',
  mid: 'text-amber-500 border-amber-200 bg-amber-50',
  free: 'text-green-600 border-green-200 bg-green-50',
};

export const CATEGORY_LABELS: Record<string, string> = {
  notice: 'Notice',
  activity: 'Activity',
  study: 'Study',
  project: 'Project',
};

export const CATEGORY_COLORS: Record<string, string> = {
  notice: 'text-red-500 border-red-200 bg-red-50',
  activity: 'text-green-600 border-green-200 bg-green-50',
  study: 'text-aing-blue border-blue-200 bg-blue-50',
  project: 'text-purple-600 border-purple-200 bg-purple-50',
};

export const DEFAULT_INTERESTS: string[] = [
  'CV', 'NLP', 'RL', 'Transformer', 'Agent', 'Optimization',
  'On-Device', 'Federated Learning', 'Generative AI', 'MLOps',
];
