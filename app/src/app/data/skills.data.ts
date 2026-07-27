export interface SkillTag {
  label: string;
  emphasized: boolean;
}

export interface AiToolSkill {
  name: string;
  level: string;
  description: string;
}

export const TECH_TAGS: SkillTag[] = [
  { label: 'HTML5', emphasized: false },
  { label: 'CSS / SASS / BEM', emphasized: false },
  { label: 'Bootstrap', emphasized: false },
  { label: 'Tailwind', emphasized: false },
  { label: 'JavaScript (ES6+)', emphasized: false },
  { label: 'TypeScript', emphasized: false },
  { label: 'React', emphasized: true },
  { label: 'Angular 2+', emphasized: true },
  { label: 'jQuery', emphasized: false },
  { label: 'Knockout.js', emphasized: false },
  { label: 'RxJS / NgRx / Redux', emphasized: false },
  { label: 'Next.js', emphasized: false },
  { label: 'Nest.js', emphasized: false },
  { label: 'Underscore.js', emphasized: false },
  { label: 'Git', emphasized: false },
  { label: '.NET 10 · C# (learning)', emphasized: true },
];

export const AI_TOOLS: AiToolSkill[] = [
  {
    name: 'Claude / Claude Code',
    level: 'ADVANCED',
    description: 'Daily agentic coding — code review, architecture support, automation of dev tasks.',
  },
  {
    name: 'AI-assisted dev',
    level: 'ADVANCED',
    description:
      'Directing AI agents inside VS Code — prompting, reviewing/correcting output, building automation around it.',
  },
];
