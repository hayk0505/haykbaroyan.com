import { EXPERIENCE_ENTRIES } from './experience.data';
import { EDUCATION_ENTRIES } from './education.data';
import { TECH_TAGS, AI_TOOLS } from './skills.data';
import { LANGUAGES } from './languages.data';
import { PROJECT_ENTRIES } from './projects.data';
import { CONTACT } from './contact.data';

describe('data files', () => {
  it('has 3 experience entries, each with required fields and at least one tag', () => {
    expect(EXPERIENCE_ENTRIES.length).toBe(3);
    for (const entry of EXPERIENCE_ENTRIES) {
      expect(entry.dateLabel).toBeTruthy();
      expect(entry.company).toBeTruthy();
      expect(entry.role).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.tags.length).toBeGreaterThan(0);
    }
  });

  it('has 3 education entries, each with required fields', () => {
    expect(EDUCATION_ENTRIES.length).toBe(3);
    for (const entry of EDUCATION_ENTRIES) {
      expect(entry.dateLabel).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(entry.institution).toBeTruthy();
    }
  });

  it('has tech tags and exactly 2 AI tool entries', () => {
    expect(TECH_TAGS.length).toBeGreaterThan(0);
    expect(AI_TOOLS.length).toBe(2);
  });

  it('has 3 languages', () => {
    expect(LANGUAGES.length).toBe(3);
  });

  it('has 2 project entries with required fields', () => {
    expect(PROJECT_ENTRIES.length).toBe(2);
    for (const entry of PROJECT_ENTRIES) {
      expect(entry.heading).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.tags.length).toBeGreaterThan(0);
    }
  });

  it('has contact info', () => {
    expect(CONTACT.email).toBe('haykbaroyan@yahoo.com');
    expect(CONTACT.github).toBe('https://github.com/hayk0505');
    expect(CONTACT.website).toBe('https://haykbaroyan.com');
  });
});
