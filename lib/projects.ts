export type Project = {
  title: string;
  year: string;
  type: string;
  image: string;
  href: string;
};

export const projects: Project[] = [
  {
    title: 'Showreel',
    year: '2026',
    type: 'Motion / WebGL',
    image: '/projects/showreel.png',
    href: '/videos/hirotos_showreel.mp4',
  },
  {
    title: 'DBRAIN',
    year: '2025',
    type: 'Interactive installation',
    image: '/projects/dbrain.png',
    href: '#',
  },
  {
    title: 'Track',
    year: '2025',
    type: '3D interface',
    image: '/projects/track.png',
    href: '#',
  },
  {
    title: 'Tap to meet you',
    year: '2024',
    type: 'Prototype',
    image: '/projects/tap_to_meet_you.png',
    href: '#',
  },
  {
    title: 'Portfolio Proto 2026',
    year: '2026',
    type: 'Portfolio system',
    image: '/projects/prtfolio_proto_2026.png',
    href: '#',
  },
  {
    title: 'Portfolio 2022',
    year: '2022',
    type: 'Archive',
    image: '/projects/portfolio2022.png',
    href: '#',
  },
  {
    title: 'WIRED',
    year: '2024',
    type: 'Editorial interaction',
    image: '/projects/wired.png',
    href: '#',
  },
  {
    title: 'Demo 01',
    year: '2024',
    type: 'Experiment',
    image: '/projects/demo01.png',
    href: '#',
  },
];
