export const siteMeta = {
  title: 'HO BINH',
  description:
    'Portfolio site focused on product development, motion, and interactive 3D experiences.',
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
    heading: 'Product developer building interactive web experiences.',
    body: 'I design and implement digital experiences that connect motion, WebGL, 3D modeling, and interface behavior. My work focuses on turning visual systems into tactile, interactive products.',
    meta: [
      { label: 'Name', value: 'HO BINH' },
      { label: 'Role', value: 'Product Developer' },
    ],
    contactLabel: 'Contact',
  },
  ja: {
    eyebrow: 'About',
    heading: 'インタラクティブなWeb体験をつくるプロダクトデベロッパー。',
    body: 'モーション、WebGL、3Dモデリング、インターフェースを組み合わせ、自然に連動するデジタル体験を設計・実装しています。視覚的なシステムを、手触りのあるプロダクト体験へ変換することを重視しています。',
    meta: [
      { label: '名前', value: 'HO BINH' },
      { label: '職業', value: 'プロダクトデベロッパー' },
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
