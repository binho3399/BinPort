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
    title: 'Showreel',
    year: '2026',
    type: 'Motion / WebGL',
    image: '/projects/showreel.png',
    href: '/videos/hirotos_showreel.mp4',
    categories: ['Motion', 'WebGL'],
  },
  {
    title: 'DBRAIN',
    year: '2025',
    type: 'Interactive installation',
    image: '/projects/dbrain.png',
    href: '#',
    categories: ['Installation', 'Interaction'],
  },
  {
    title: 'Track',
    year: '2025',
    type: '3D interface',
    image: '/projects/track.png',
    href: '#',
    categories: ['Demo Site', 'Design', 'Front-end Development', '3D Modeling'],
  },
  {
    title: 'Tap to meet you',
    year: '2024',
    type: 'Prototype',
    image: '/projects/tap_to_meet_you.png',
    href: '#',
    categories: ['Prototype', 'Interaction'],
  },
  {
    title: 'Portfolio Proto 2026',
    year: '2026',
    type: 'Portfolio system',
    image: '/projects/prtfolio_proto_2026.png',
    href: '#',
    categories: ['Portfolio', 'System Design'],
  },
  {
    title: 'Portfolio 2022',
    year: '2022',
    type: 'Archive',
    image: '/projects/portfolio2022.png',
    href: '#',
    categories: ['Archive', 'Portfolio'],
  },
  {
    title: 'WIRED',
    year: '2024',
    type: 'Editorial interaction',
    image: '/projects/wired.png',
    href: '#',
    categories: ['Editorial', 'Interaction'],
  },
  {
    title: 'Demo 01',
    year: '2024',
    type: 'Experiment',
    image: '/projects/demo01.png',
    href: '#',
    categories: ['Experiment', 'Demo'],
  },
];
