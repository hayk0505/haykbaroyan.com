import PDFDocument from 'pdfkit';
import { createWriteStream, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_ENTRIES } from '../src/app/data/experience.data';
import { EDUCATION_ENTRIES } from '../src/app/data/education.data';
import { TECH_TAGS } from '../src/app/data/skills.data';
import { LANGUAGES } from '../src/app/data/languages.data';
import { CONTACT } from '../src/app/data/contact.data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/assets/Hayk-Baroyan-CV.pdf');
mkdirSync(dirname(outputPath), { recursive: true });

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, '');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
doc.pipe(createWriteStream(outputPath));

doc.font('Helvetica-Bold').fontSize(24).text('Hayk Baroyan');
doc.font('Helvetica').fontSize(12).fillColor('#444444');
doc.text('Front-end engineer, building full-stack');
doc.text(`${CONTACT.location}  ·  ${CONTACT.email}  ·  ${CONTACT.linkedin}`);
doc.moveDown(1.5);

doc.fillColor('#000000').font('Helvetica-Bold').fontSize(16).text('Experience');
doc.moveDown(0.5);
for (const entry of EXPERIENCE_ENTRIES) {
  doc.font('Helvetica-Bold').fontSize(12).text(`${entry.company} — ${entry.role}`);
  doc.font('Helvetica').fontSize(10).fillColor('#555555').text(entry.dateLabel);
  doc.fillColor('#000000').fontSize(11).text(stripHtml(entry.description));
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666666').text(entry.tags.join(', '));
  doc.moveDown(1);
}

doc.fillColor('#000000').font('Helvetica-Bold').fontSize(16).text('Education');
doc.moveDown(0.5);
for (const entry of EDUCATION_ENTRIES) {
  doc.font('Helvetica-Bold').fontSize(12).text(entry.title);
  doc.font('Helvetica').fontSize(10).fillColor('#555555').text(`${entry.institution} — ${entry.dateLabel}`);
  doc.moveDown(0.75);
}

doc.fillColor('#000000').font('Helvetica-Bold').fontSize(16).text('Skills');
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(11).fillColor('#000000').text(TECH_TAGS.map((t) => t.label).join(', '));
doc.moveDown(1);

doc.font('Helvetica-Bold').fontSize(16).text('Languages');
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(11).text(LANGUAGES.map((l) => `${l.name} (${l.level})`).join(', '));

doc.end();
