import PDFDocument from 'pdfkit';
import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_ENTRIES } from '../src/app/data/experience.data';
import { EDUCATION_ENTRIES } from '../src/app/data/education.data';
import { TECH_TAGS, AI_TOOLS } from '../src/app/data/skills.data';
import { LANGUAGES } from '../src/app/data/languages.data';
import { CONTACT } from '../src/app/data/contact.data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/assets/Hayk-Baroyan-CV.pdf');
mkdirSync(dirname(outputPath), { recursive: true });

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, '');
// pdfkit's built-in Helvetica has no glyph for "↗" (renders as mojibake) — strip
// the web-only "opens externally" affordance for the PDF's plain-text handles.
const stripArrow = (value: string): string => value.replace(/\s*↗\s*$/, '');

const PAGE_WIDTH = 595.28;
const PAGE_MARGIN = 50;
const LABEL_COL_WIDTH = 130;
const CONTENT_GAP = 20;
const CONTENT_COL_X = PAGE_MARGIN + LABEL_COL_WIDTH + CONTENT_GAP;
const CONTENT_COL_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2 - LABEL_COL_WIDTH - CONTENT_GAP;

const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
doc.pipe(createWriteStream(outputPath));

function ensureRoom(minSpace: number): void {
  if (doc.y > doc.page.height - PAGE_MARGIN - minSpace) {
    doc.addPage();
    doc.x = CONTENT_COL_X;
    doc.y = PAGE_MARGIN;
  }
}

function drawSection(label: string, contentFn: () => void): void {
  const startY = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
  doc.text(label.toUpperCase(), PAGE_MARGIN, startY, { width: LABEL_COL_WIDTH });
  doc.x = CONTENT_COL_X;
  doc.y = startY;
  contentFn();
  doc.x = PAGE_MARGIN;
  doc.moveDown(0.75);
  doc.moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.75);
}

// Header: bold name (left) + italic title (right), same line.
doc.font('Helvetica-Bold').fontSize(24).fillColor('#000000');
doc.text('Hayk Baroyan', PAGE_MARGIN, PAGE_MARGIN, { width: PAGE_WIDTH - PAGE_MARGIN * 2 });
const nameBottomY = doc.y;

doc.font('Times-Italic').fontSize(13).fillColor('#444444');
doc.text('Senior Front-End Engineer', PAGE_MARGIN, PAGE_MARGIN + 6, {
  width: PAGE_WIDTH - PAGE_MARGIN * 2,
  align: 'right',
});

doc.y = Math.max(nameBottomY, doc.y);
doc.moveDown(0.75);
doc.moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_WIDTH - PAGE_MARGIN, doc.y).strokeColor('#cccccc').stroke();
doc.moveDown(1);

// Contact
drawSection('Contact', () => {
  const halfWidth = (CONTENT_COL_WIDTH - CONTENT_GAP) / 2;
  const leftX = CONTENT_COL_X;
  const rightX = CONTENT_COL_X + halfWidth + CONTENT_GAP;
  const topY = doc.y;
  const lineHeight = 16;

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
  doc.text('Phone:', leftX, topY, { width: halfWidth, continued: true });
  doc.font('Helvetica').text(` ${CONTACT.phoneDisplay}`);
  doc.font('Helvetica-Bold').text('Email:', leftX, topY + lineHeight, { width: halfWidth, continued: true });
  doc.font('Helvetica').text(` ${CONTACT.email}`);
  doc.font('Helvetica-Bold').text('Website:', leftX, topY + lineHeight * 2, { width: halfWidth, continued: true });
  doc.font('Helvetica').fillColor('#1a5276').text(` ${stripArrow(CONTACT.websiteHandle)}`, { link: CONTACT.website, underline: true });
  doc.fillColor('#000000');

  doc.font('Helvetica-Bold').text('Location:', rightX, topY, { width: halfWidth, continued: true });
  doc.font('Helvetica').text(` ${CONTACT.location}`);
  doc.font('Helvetica-Bold').text('LinkedIn:', rightX, topY + lineHeight, { width: halfWidth, continued: true });
  doc.font('Helvetica').fillColor('#1a5276').text(` ${stripArrow(CONTACT.linkedinHandle)}`, { link: CONTACT.linkedin, underline: true });
  doc.font('Helvetica-Bold').fillColor('#000000').text('GitHub:', rightX, topY + lineHeight * 2, { width: halfWidth, continued: true });
  doc.font('Helvetica').fillColor('#1a5276').text(` ${stripArrow(CONTACT.githubHandle)}`, { link: CONTACT.github, underline: true });

  doc.x = CONTENT_COL_X;
  doc.y = topY + lineHeight * 3 + 4;
});

// Professional Experience
drawSection('Professional Experience', () => {
  EXPERIENCE_ENTRIES.forEach((entry, index) => {
    if (index > 0) doc.moveDown(1);
    ensureRoom(70);

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
    doc.text(`${entry.role} | ${entry.dateLabel}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.font('Helvetica').fontSize(10).fillColor('#555555');
    doc.text(entry.company, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10).fillColor('#000000');
    doc.text(stripHtml(entry.description), CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
    doc.text('Technologies used', CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.font('Helvetica').fontSize(9).fillColor('#333333');
    for (const tag of entry.tags) {
      doc.text(`•  ${tag}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });
    }

    if (entry.companyLinkHref) {
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(9).fillColor('#1a5276');
      doc.text(`Link ${entry.companyLinkHref}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });
    }
  });
});

// Education and Training
drawSection('Education and Training', () => {
  EDUCATION_ENTRIES.forEach((entry, index) => {
    if (index > 0) doc.moveDown(0.75);
    ensureRoom(50);

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
    doc.text(entry.title, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.font('Helvetica').fontSize(10).fillColor('#555555');
    doc.text(`${entry.institution} — ${entry.dateLabel}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    for (const diploma of entry.diplomas ?? []) {
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(9).fillColor('#1a5276');
      doc.text(diploma.label, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH, link: diploma.url, underline: true });
    }
  });
});

// Programming Languages and Web Technologies
drawSection('Programming Languages and Web Technologies', () => {
  doc.font('Helvetica').fontSize(10).fillColor('#000000');
  for (const tag of TECH_TAGS) {
    ensureRoom(20);
    doc.text(`•  ${tag.label}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });
  }
});

// AI Tools & Workflows
drawSection('AI Tools & Workflows', () => {
  AI_TOOLS.forEach((tool, index) => {
    if (index > 0) doc.moveDown(0.5);
    ensureRoom(40);

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
    doc.text(`${tool.name} — ${tool.level}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });

    doc.font('Helvetica').fontSize(9).fillColor('#555555');
    doc.text(tool.description, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });
  });
});

// Language Skills
drawSection('Language Skills', () => {
  const nativeLang = LANGUAGES.find((l) => l.level === 'Native');
  const otherLangs = LANGUAGES.filter((l) => l.level !== 'Native');

  if (nativeLang) {
    doc.font('Helvetica').fontSize(10).fillColor('#000000');
    doc.text(`Mother tongue: ${nativeLang.name}`, CONTENT_COL_X, doc.y, { width: CONTENT_COL_WIDTH });
    doc.moveDown(0.5);
  }

  const tableColWidth = CONTENT_COL_WIDTH / 2;
  const headerY = doc.y;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
  doc.text('Language', CONTENT_COL_X, headerY, { width: tableColWidth });
  doc.text('Level', CONTENT_COL_X + tableColWidth, headerY, { width: tableColWidth });
  doc.moveDown(0.3);
  doc.moveTo(CONTENT_COL_X, doc.y).lineTo(CONTENT_COL_X + CONTENT_COL_WIDTH, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(10).fillColor('#000000');
  for (const lang of otherLangs) {
    const rowY = doc.y;
    doc.text(lang.name, CONTENT_COL_X, rowY, { width: tableColWidth });
    doc.text(lang.level, CONTENT_COL_X + tableColWidth, rowY, { width: tableColWidth });
    doc.moveDown(0.4);
  }
});

doc.end();
