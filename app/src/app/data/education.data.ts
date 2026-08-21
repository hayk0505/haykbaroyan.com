export interface DiplomaLink {
  label: string;
  url: string;
}

export interface EducationEntry {
  dateLabel: string;
  title: string;
  institution: string;
  diplomas?: DiplomaLink[];
}

export const EDUCATION_ENTRIES: EducationEntry[] = [
  {
    dateLabel: '2024 — 2026',
    title: 'M.Sc. Management & Information Technology',
    institution:
      'West Saxon University of Applied Sciences, Zwickau (Germany) · Armenian State University of Economics — joint program. Thesis: multimodal deepfake detection (EU Deepfake Toolkit).',
    diplomas: [
      { label: 'View WHZ diploma', url: 'https://haykbaroyan.com/assets/Hayk-Baroyan-WHZ-Diploma.pdf' },
      { label: 'View ASUE diploma', url: 'https://haykbaroyan.com/assets/Hayk-Baroyan-ASUE-Diploma.jpg' },
    ],
  },
  {
    dateLabel: '2017 — 2018',
    title: 'Front-End Fundamentals training',
    institution: 'MaSys Information Systems Ltd — HTML, CSS, Bootstrap, JS',
  },
  {
    dateLabel: '2015',
    title: 'Programming Fundamentals for Beginners',
    institution: 'Microsoft Innovation Center Armenia',
  },
];
