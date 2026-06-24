export const siteMeta = {
  title: 'Hiroto Sato',
  description: 'Portfolio site of Hiroto Sato.',
  favicon: '/favicon.ico',
};

export const profile = {
  displayName: 'HO BINH',
  role: 'Product Developer',
  profileLabels: ['HO BINH', 'PRODUCT DEVELOPER'],
};

export const contactLinks = {
  email: 'hello@hirotos.com',
  linkedin: 'https://www.linkedin.com/in/hiroto-sato-2414b23b7',
};

export const homeContent = {
  ariaLabel: 'Signal Pole',
  meta: [
    { label: 'Base', value: 'Tokyo, Japan' },
    { label: 'Focus', value: 'Creative development / Motion / 3D modeling' },
    { label: 'Index', value: 'Portfolio 2026' },
  ],
};

export const aboutLanguages = ['en', 'ja'] as const;

export type AboutLanguage = (typeof aboutLanguages)[number];

export const aboutContent = {
  en: {
    eyebrow: 'About',
    heading: 'Creative developer building interactive web experiences.',
    body: 'I design and implement digital experiences that naturally connect motion, WebGL, 3D modeling, and interface behavior. I specialize in interactive front-end development that brings visual expression and a tactile sense of interaction together.',
    meta: [
      { label: 'Name', value: 'Hiroto Sato' },
      { label: 'Role', value: 'Creative Developer' },
    ],
    contactLabel: 'Contact',
  },
  ja: {
    eyebrow: 'About',
    heading: 'インタラクティブなWeb体験をつくるクリエイティブデベロッパー。',
    body: 'モーション、WebGL、3Dモデリング、インターフェースを組み合わせ、自然に連動するデジタル体験を設計・実装しています。視覚表現と操作感をつなぐ、インタラクティブなフロントエンド制作を得意としています。',
    meta: [
      { label: '名前', value: '佐藤ヒロト' },
      { label: '職業', value: 'クリエイティブデベロッパー' },
    ],
    contactLabel: 'コンタクト',
  },
} satisfies Record<
  AboutLanguage,
  {
    eyebrow: string;
    heading: string;
    body: string;
    meta: Array<{ label: string; value: string }>;
    contactLabel: string;
  }
>;

export const contactContent = {
  eyebrow: 'Contact',
  heading: 'Get in touch.',
};

export const webglText = {
  contactLabels: ['コンタクト', 'CONTACT'],
  projectsMarquee: 'PROJECTS ARCHIVE / PROJECTS ARCHIVE / PROJECTS ARCHIVE / ',
};
