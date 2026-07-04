export type Project = {
  title: string;
  year: string;
  type: string;
  image: string;
  href: string;
  categories: string[];
};

export const projects: Project[] = [
  {
    title: 'Temphu',
    year: '2025',
    type: 'UXUI Lead',
    image: '/projects/temphu.png',
    href: 'https://temphu.com',
    categories: ['UX/UI', 'Design System', 'Prototyping'],
  },
  {
    title: 'Ichiban',
    year: '2025',
    type: 'UXUI Leader',
    image: '/projects/ichiban.png',
    href: 'https://ichibanco.vn',
    categories: ['UX/UI', 'B2B', 'eCommerce', 'Design System'],
  },
  {
    title: 'SuZu Studio',
    year: '2025',
    type: 'Project Manager',
    image: '/projects/suzu-studio.png',
    href: 'https://dev-suzustudio.framer.website',
    categories: ['UX/UI', 'Design System', 'Usability Testing'],
  },
  {
    title: 'Chus',
    year: '2025',
    type: 'UXUI Leader',
    image: '/projects/chus.png',
    href: 'https://chus.vn',
    categories: ['UX/UI', 'eCommerce', 'Design System'],
  },
  {
    title: 'Hoc Lieu',
    year: '2025',
    type: 'UX/UI Designer',
    image: '/projects/hoc-lieu.png',
    href: 'https://www.figma.com/proto/USTbxwBllAgm3kO8NgO4d1',
    categories: ['UX/UI', 'Design', 'Prototyping'],
  },
  {
    title: 'Dosi-in',
    year: '2025',
    type: 'UXUI Leader',
    image: '/projects/dosi-in.jpeg',
    href: 'https://dosi-in.com',
    categories: ['UX/UI', 'Design System', 'A/B Testing'],
  },
  {
    title: 'Gentouch',
    year: '2025',
    type: 'UI Designer',
    image: '/projects/gentouch.png',
    href: 'https://gentouchstudios.com',
    categories: ['UI Design', 'Mobile App'],
  },
  {
    title: 'HouseNow',
    year: '2026',
    type: 'Placeholder',
    image: '',
    href: '#',
    categories: ['Coming Soon'],
  },
  {
    title: 'CarNow',
    year: '2026',
    type: 'Placeholder',
    image: '',
    href: '#',
    categories: ['Coming Soon'],
  },
  {
    title: 'Tabo ERP',
    year: '2025',
    type: 'UI Designer',
    image: '/projects/tabo-erp.png',
    href: 'https://gentouchstudios.com',
    categories: ['UI Design', 'ERP'],
  },
  {
    title: 'Tabo POS',
    year: '2025',
    type: 'UI Designer',
    image: '/projects/tabo-pos.png',
    href: 'https://gentouchstudios.com',
    categories: ['UI Design', 'Wholesale POS'],
  },
];
