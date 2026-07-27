export interface ProjectEntry {
  badgeLabel: string;
  heading: string;
  description: string;
  tags: string[];
  linkHref: string;
  routerLink: string;
  external: boolean;
  imageSide: 'left' | 'right';
  variant: 'dark' | 'light';
  screenshotCaption: string;
  imageSrc?: string;
}

export const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    badgeLabel: '01 · IN BUILD — EXTERNAL ↗',
    heading: 'Digital Dust Library',
    description:
      'A multi-author blog and magazine platform I designed and built end to end — covering tech, psychology, sociology and management. A real full-stack system: a SvelteKit public blog, a React admin panel with editorial review workflows, and a .NET 10 API behind both.',
    tags: ['SvelteKit', 'React', '.NET 10', 'PostgreSQL'],
    linkHref: '#',
    routerLink: '',
    external: true,
    imageSide: 'left',
    variant: 'dark',
    screenshotCaption: '[ screenshot — DigitalDustLibrary blog + admin ]',
    imageSrc: '/assets/DDL-image.png',
  },
  {
    badgeLabel: '02 · LIVE DEMO — CASE STUDY →',
    heading: 'EU Deepfake Toolkit',
    description:
      'A multimodal deepfake-detection toolkit developed as part of my Master’s thesis — analysing video, audio and image signals together to flag manipulated media. Includes a live, interactive demo you can run in the browser.',
    tags: ['AI/ML', 'Multimodal Detection', 'Research'],
    linkHref: '',
    routerLink: '/projects/eu-deepfake',
    external: false,
    imageSide: 'right',
    variant: 'light',
    screenshotCaption: '[ screenshot — live detection demo ]',
    imageSrc: '/assets/eu-deepfake-detection-image.png',
  },
];
