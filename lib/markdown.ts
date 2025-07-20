/**
 * Simple markdown parser for chat messages
 * Supports basic formatting without external dependencies
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'mention' | 'linebreak' | 'heading';
  content: string;
  url?: string;
  userId?: string;
  level?: number; // For headings (1-6)
}

export const parseMarkdown = (text: string): MarkdownNode[] => {
  const nodes: MarkdownNode[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    // Check for line breaks
    if (text[currentIndex] === '\n') {
      nodes.push({ type: 'linebreak', content: '\n' });
      currentIndex++;
      continue;
    }

    // Check for headings (at start of line or after line break)
    const isStartOfLine = currentIndex === 0 || text[currentIndex - 1] === '\n';
    if (isStartOfLine) {
      const headingMatch = text.slice(currentIndex).match(/^(#{1,6})\s+(.+?)(?=\n|$)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        nodes.push({
          type: 'heading',
          content,
          level
        });
        currentIndex += headingMatch[0].length;
        continue;
      }
    }

    // Check for mentions (@username)
    const mentionMatch = text.slice(currentIndex).match(/^@(\w+)/);
    if (mentionMatch) {
      nodes.push({
        type: 'mention',
        content: mentionMatch[0],
        userId: mentionMatch[1]
      });
      currentIndex += mentionMatch[0].length;
      continue;
    }

    // Check for links (simple URL detection)
    const linkMatch = text.slice(currentIndex).match(/^(https?:\/\/[^\s]+)/);
    if (linkMatch) {
      nodes.push({
        type: 'link',
        content: linkMatch[0],
        url: linkMatch[0]
      });
      currentIndex += linkMatch[0].length;
      continue;
    }

    // Check for inline code (`code`)
    const codeMatch = text.slice(currentIndex).match(/^`([^`]+)`/);
    if (codeMatch) {
      nodes.push({
        type: 'code',
        content: codeMatch[1]
      });
      currentIndex += codeMatch[0].length;
      continue;
    }

    // Check for bold (**text** or __text__)
    const boldMatch = text.slice(currentIndex).match(/^(\*\*|__)([^*_]+)\1/);
    if (boldMatch) {
      nodes.push({
        type: 'bold',
        content: boldMatch[2]
      });
      currentIndex += boldMatch[0].length;
      continue;
    }

    // Check for italic (*text* or _text_)
    const italicMatch = text.slice(currentIndex).match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      nodes.push({
        type: 'italic',
        content: italicMatch[2]
      });
      currentIndex += italicMatch[0].length;
      continue;
    }

    // Regular text
    let textContent = '';
    while (currentIndex < text.length) {
      const char = text[currentIndex];
      
      // Stop at markdown characters or line breaks
      if (char === '*' || char === '_' || char === '`' || char === '@' || char === '\n' || char === '#' ||
          text.slice(currentIndex).match(/^https?:\/\//)) {
        break;
      }
      
      textContent += char;
      currentIndex++;
    }

    if (textContent) {
      nodes.push({
        type: 'text',
        content: textContent
      });
    }
  }

  return nodes;
};

export const stripMarkdown = (text: string): string => {
  return text
    .replace(/^(#{1,6})\s+(.+?)$/gm, '$2') // Headings
    .replace(/(\*\*|__)([^*_]+)\1/g, '$2') // Bold
    .replace(/(\*|_)([^*_]+)\1/g, '$2')   // Italic
    .replace(/`([^`]+)`/g, '$1')          // Code
    .replace(/@(\w+)/g, '@$1')           // Mentions (keep as is)
    .replace(/(https?:\/\/[^\s]+)/g, '$1'); // Links (keep as is)
};
