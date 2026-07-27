export interface ExperienceEntry {
  dateLabel: string;
  badge?: string;
  company: string;
  companyLinkLabel?: string;
  companyLinkHref?: string;
  role: string;
  description: string;
  tags: string[];
}

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    dateLabel: '2021 — Present',
    badge: 'CURRENT',
    company: 'VOLO LLC',
    companyLinkLabel: 'kofile.com ↗',
    companyLinkHref: 'https://kofile.com/',
    role: 'Front-End Developer',
    description:
      'Implemented new features and enhanced UI components across critical government data-management systems. Drove performance work yielding a <strong>30% reduction in page-load times</strong>; ran code reviews for quality and best practices, working in Jira.',
    tags: ['TypeScript', 'React', 'Next.js', 'Knockout.js', 'Angular.js', 'jQuery', 'Tailwind'],
  },
  {
    dateLabel: '2018 — 2021',
    company: 'MERSOFT LLC',
    companyLinkLabel: 'ofoodo.com ↗',
    companyLinkHref: 'https://www.ofoodo.com',
    role: 'Front-End Developer',
    description:
      'Built and maintained the front-end of a business platform for restaurants, cafés and shops — a QR-menu experience uniting menu browsing, table booking and delivery/pick-up ordering in one interface. Focused on UX and streamlining business operations.',
    tags: ['Angular', 'React', 'RxJS', 'Redux', 'Google Maps'],
  },
  {
    dateLabel: '2018',
    badge: 'FIRST ROLE',
    company: '4P1P LLC',
    role: 'Front-End Developer',
    description:
      'First professional steps in web development — website markup, adding interactivity with JavaScript, and adjustments to existing WordPress projects. Practical experience in front-end structure, responsive design and basic CMS workflows.',
    tags: ['JavaScript', 'WordPress', 'HTML5', 'CSS3'],
  },
];
