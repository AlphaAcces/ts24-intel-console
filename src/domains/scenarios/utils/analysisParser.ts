/**
 * Utility helpers for parsing AI generated scenario analysis markdown.
 */

export interface ParsedSection {
  id: string;
  heading: string;
  bullets: string[];
  paragraphs: string[];
}

const SECTION_LABELS_IN_ORDER = [
  '1. Konsekvenser',
  '2. Kritiske Handlinger',
  '3. Mini-Playbook (Næste 30 dage)',
];

const SECTION_REGEX = /##\s*(\d\.\s*[^\n]+)\s*\n?([\s\S]*?)(?=\n##\s*\d\.|$)/g;

const stripMarkdown = (line: string) => line.replace(/\*\*(.*?)\*\*/g, '$1').trim();

const normaliseBullet = (line: string) => stripMarkdown(line.replace(/^[-*•]\s*/, ''));

export const parseAnalysisSections = (analysis: string): ParsedSection[] => {
  if (!analysis) return [];

  const normalised = analysis.replace(/\r\n/g, '\n');
  const parsedMap = new Map<string, ParsedSection>();

  let match: RegExpExecArray | null;
  while ((match = SECTION_REGEX.exec(normalised)) !== null) {
    const sectionId = match[1].trim();
    const body = (match[2] ?? '').trim();
    const lines = body
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const bullets: string[] = [];
    const paragraphs: string[] = [];

    lines.forEach(line => {
      if (/^[-*•]/.test(line)) {
        bullets.push(normaliseBullet(line));
      } else {
        paragraphs.push(stripMarkdown(line));
      }
    });

    parsedMap.set(sectionId, {
      id: sectionId,
      heading: sectionId,
      bullets,
      paragraphs,
    });
  }

  const orderedSections = SECTION_LABELS_IN_ORDER.map(label => parsedMap.get(label)).filter(Boolean) as ParsedSection[];

  if (orderedSections.length > 0) {
    return orderedSections;
  }

  return Array.from(parsedMap.values());
};
