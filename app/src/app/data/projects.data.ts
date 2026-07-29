export interface ProjectEntry {
  statusLabel: string;
  heading: string;
  description: string;
  tags: string[];
  linkHref: string;
  routerLink: string;
  external: boolean;
  imageSide: 'left' | 'right';
  variant: 'dark' | 'light';
  previewUrl: string;
  ctaLabel: string;
  screenshotCaption: string;
  imageSrc?: string;
}

export const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    statusLabel: 'IN BUILD · EXTERNAL SITE',
    heading: 'Digital Dust Library',
    description:
      'A multi-author blog and magazine platform I designed and built end to end — covering tech, psychology, sociology and management. A real full-stack system: a SvelteKit public blog, a React admin panel with editorial review workflows, and a .NET 10 API behind both.',
    tags: ['SvelteKit', 'React', '.NET 10', 'PostgreSQL'],
    linkHref: 'https://github.com/hayk0505/DigitalDustLibrary',
    routerLink: '',
    external: true,
    imageSide: 'right',
    variant: 'dark',
    previewUrl: 'digitaldustlibrary.com',
    ctaLabel: 'Visit live site',
    screenshotCaption: '[ screenshot — DigitalDustLibrary blog + admin ]',
    imageSrc: '/assets/DDL-image.png',
  },
  {
    statusLabel: 'LIVE DEMO · CASE STUDY',
    heading: 'EU Deepfake Toolkit',
    description:
      'A multimodal deepfake-detection toolkit developed as part of my Master\'s thesis — analysing video, audio and image signals together to flag manipulated media. Includes a live, interactive demo you can run in the browser.',
    tags: ['AI/ML', 'Multimodal Detection', 'Research'],
    linkHref: 'https://github.com/hayk0505/eu-deepfake-toolkit',
    routerLink: '',
    external: true,
    imageSide: 'left',
    variant: 'light',
    previewUrl: 'haykbaroyan.com/projects/eu-deepfake',
    ctaLabel: 'Read case study & run demo',
    screenshotCaption: '[ screenshot — live detection demo ]',
    imageSrc: '/assets/eu-deepfake-detection-image.png',
  },
];
