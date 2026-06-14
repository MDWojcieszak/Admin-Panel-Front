/**
 * Prose ↔ Markdown with the `:color[text]{fg= bg=}` directive — the blog contract forbids HTML in
 * content (backend returns 400) and expresses colour via this token, not `<span style>`. BlockNote's
 * own markdown drops colours and doesn't understand the directive, so we (de)serialise a small subset
 * ourselves: bold / italic / strike / code / link + the colour directive, and heading/quote/list/para.
 */

import { BlogPartialBlock } from '~/routes/Blog/Editor/document/schema';

/** The 10 allowed colour tokens (same set as BlockNote/Notion) — `GET /blog/colors` is the runtime SoT. */
export const BLOG_COLORS = ['default', 'gray', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

type Styles = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
};
type InlineText = { type: 'text'; text: string; styles?: Styles };
type InlineLink = { type: 'link'; href: string; content: InlineText[] };
type Inline = InlineText | InlineLink;

const LIST_TYPES = ['bulletListItem', 'numberedListItem', 'checkListItem'];

// ---- serialise: BlockNote blocks → Markdown -------------------------------

const escapeText = (s: string) => s.replace(/([\\`*_~[\]<>])/g, '\\$1');

const serializeInline = (nodes: unknown): string => {
  if (!Array.isArray(nodes)) return '';
  return (nodes as Inline[])
    .map((n) => {
      if (n.type === 'link') return `[${serializeInline(n.content)}](${n.href})`;
      const st = n.styles ?? {};
      let t = st.code ? '`' + (n.text ?? '') + '`' : escapeText(n.text ?? '');
      if (!st.code) {
        if (st.bold) t = `**${t}**`;
        if (st.italic) t = `*${t}*`;
        if (st.strikethrough) t = `~~${t}~~`;
      }
      const fg = st.textColor && st.textColor !== 'default' ? st.textColor : null;
      const bg = st.backgroundColor && st.backgroundColor !== 'default' ? st.backgroundColor : null;
      if (fg || bg) {
        const attrs = [fg && `fg=${fg}`, bg && `bg=${bg}`].filter(Boolean).join(' ');
        t = `:color[${t}]{${attrs}}`;
      }
      return t;
    })
    .join('');
};

const serializeBlock = (b: { type: string; props?: { level?: number; checked?: boolean }; content?: unknown }): string => {
  const c = serializeInline(b.content);
  switch (b.type) {
    case 'heading':
      return `${'#'.repeat(Math.min(3, Math.max(1, b.props?.level ?? 1)))} ${c}`;
    case 'quote':
      return `> ${c}`;
    case 'bulletListItem':
      return `- ${c}`;
    case 'numberedListItem':
      return `1. ${c}`;
    case 'checkListItem':
      return `- [${b.props?.checked ? 'x' : ' '}] ${c}`;
    default:
      return c;
  }
};

/** Serialise a run of prose blocks to Markdown (consecutive list items stay on adjacent lines). */
export const blocksToMarkdown = (blocks: { type: string }[]): string => {
  const parts: string[] = [];
  let prevList = false;
  for (const b of blocks) {
    const isList = LIST_TYPES.includes(b.type);
    if (parts.length) parts.push(isList && prevList ? '\n' : '\n\n');
    parts.push(serializeBlock(b));
    prevList = isList;
  }
  return parts.join('');
};

/** Serialise a single block's inline content (e.g. a callout body) to one Markdown string. */
export const inlineToMarkdown = (content: unknown): string => serializeInline(content);

// ---- parse: Markdown → BlockNote blocks -----------------------------------

const findMatching = (text: string, start: number, open: string, close: string): number => {
  let depth = 1;
  for (let j = start; j < text.length; j++) {
    if (text[j] === '\\') {
      j++;
      continue;
    }
    if (text[j] === open) depth++;
    else if (text[j] === close && --depth === 0) return j;
  }
  return -1;
};

export const parseInline = (text: string, styles: Styles = {}): Inline[] => {
  const nodes: Inline[] = [];
  let buf = '';
  const flush = () => {
    if (buf) nodes.push({ type: 'text', text: buf, styles: { ...styles } });
    buf = '';
  };
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\' && i + 1 < text.length) {
      buf += text[i + 1];
      i += 2;
      continue;
    }
    if (text.startsWith(':color[', i)) {
      const close = findMatching(text, i + 7, '[', ']');
      if (close !== -1 && text[close + 1] === '{') {
        const attrEnd = text.indexOf('}', close + 1);
        if (attrEnd !== -1) {
          const attrs = text.slice(close + 2, attrEnd);
          const fg = attrs.match(/fg=([a-zA-Z]+)/)?.[1];
          const bg = attrs.match(/bg=([a-zA-Z]+)/)?.[1];
          flush();
          nodes.push(
            ...parseInline(text.slice(i + 7, close), {
              ...styles,
              ...(fg ? { textColor: fg } : {}),
              ...(bg ? { backgroundColor: bg } : {}),
            }),
          );
          i = attrEnd + 1;
          continue;
        }
      }
    }
    if (ch === '[') {
      const close = findMatching(text, i + 1, '[', ']');
      if (close !== -1 && text[close + 1] === '(') {
        const urlEnd = text.indexOf(')', close + 1);
        if (urlEnd !== -1) {
          flush();
          const content = parseInline(text.slice(i + 1, close), styles).filter((n): n is InlineText => n.type === 'text');
          nodes.push({ type: 'link', href: text.slice(close + 2, urlEnd), content });
          i = urlEnd + 1;
          continue;
        }
      }
    }
    if (text.startsWith('**', i)) {
      const close = text.indexOf('**', i + 2);
      if (close !== -1) {
        flush();
        nodes.push(...parseInline(text.slice(i + 2, close), { ...styles, bold: true }));
        i = close + 2;
        continue;
      }
    }
    if (text.startsWith('~~', i)) {
      const close = text.indexOf('~~', i + 2);
      if (close !== -1) {
        flush();
        nodes.push(...parseInline(text.slice(i + 2, close), { ...styles, strikethrough: true }));
        i = close + 2;
        continue;
      }
    }
    if (ch === '*') {
      const close = text.indexOf('*', i + 1);
      if (close !== -1) {
        flush();
        nodes.push(...parseInline(text.slice(i + 1, close), { ...styles, italic: true }));
        i = close + 1;
        continue;
      }
    }
    if (ch === '`') {
      const close = text.indexOf('`', i + 1);
      if (close !== -1) {
        flush();
        nodes.push({ type: 'text', text: text.slice(i + 1, close), styles: { ...styles, code: true } });
        i = close + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return nodes;
};

// ---- column rich-text (contentEditable HTML) ↔ Markdown -------------------
// The column editor is contentEditable, so it speaks HTML. We map its limited formatting to Markdown
// (headings/lists/quote/bold/italic/link). Colours are dropped here — the column editor uses raw hex
// (execCommand), which isn't in the palette; rich colour lives in the main prose.

const inlineHtmlToMarkdown = (node: Node): string => {
  let out = '';
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) out += escapeText(c.textContent || '');
    else if (c.nodeType === 1) {
      const el = c as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const inner = inlineHtmlToMarkdown(el);
      if (tag === 'b' || tag === 'strong') out += `**${inner}**`;
      else if (tag === 'i' || tag === 'em') out += `*${inner}*`;
      else if (tag === 'a') out += `[${inner}](${el.getAttribute('href') || ''})`;
      else if (tag === 'br') out += '\n';
      else out += inner;
    }
  });
  return out;
};

export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const lines: string[] = [];
  doc.body.childNodes.forEach((c) => {
    if (c.nodeType === 3) {
      const t = (c.textContent || '').trim();
      if (t) lines.push(escapeText(t));
      return;
    }
    if (c.nodeType !== 1) return;
    const el = c as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (/^h[1-3]$/.test(tag)) lines.push(`${'#'.repeat(Number(tag[1]))} ${inlineHtmlToMarkdown(el)}`);
    else if (tag === 'blockquote') lines.push(`> ${inlineHtmlToMarkdown(el)}`);
    else if (tag === 'ul') el.querySelectorAll(':scope > li').forEach((li) => lines.push(`- ${inlineHtmlToMarkdown(li)}`));
    else if (tag === 'ol') el.querySelectorAll(':scope > li').forEach((li) => lines.push(`1. ${inlineHtmlToMarkdown(li)}`));
    else lines.push(inlineHtmlToMarkdown(el));
  });
  return lines.filter((l) => l.trim() !== '').join('\n\n');
};

const inlineToHtml = (nodes: Inline[]): string =>
  nodes
    .map((n) => {
      if (n.type === 'link') return `<a href="${n.href}">${inlineToHtml(n.content)}</a>`;
      const st = n.styles ?? {};
      let t = (n.text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (st.code) t = `<code>${t}</code>`;
      if (st.bold) t = `<b>${t}</b>`;
      if (st.italic) t = `<i>${t}</i>`;
      return t;
    })
    .join('');

export const markdownToHtml = (md: string): string =>
  markdownToBlocks(md)
    .map((b) => {
      const inline = inlineToHtml((b.content as Inline[]) ?? []);
      const block = b as { type: string; props?: { level?: number } };
      switch (block.type) {
        case 'heading':
          return `<h${block.props?.level ?? 1}>${inline}</h${block.props?.level ?? 1}>`;
        case 'quote':
          return `<blockquote>${inline}</blockquote>`;
        case 'bulletListItem':
          return `<ul><li>${inline}</li></ul>`;
        case 'numberedListItem':
          return `<ol><li>${inline}</li></ol>`;
        default:
          return `<div>${inline || '<br>'}</div>`;
      }
    })
    .join('');

const isBlockStart = (line: string) => /^(#{1,3}\s|>\s?|[-*]\s|\d+\.\s)/.test(line);

/** Parse a Markdown body (with `:color[]` directives) into BlockNote prose blocks. */
export const markdownToBlocks = (md: string): BlogPartialBlock[] => {
  const lines = (md || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: BlogPartialBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      blocks.push({ type: 'heading', props: { level: m[1].length as 1 | 2 | 3 }, content: parseInline(m[2]) } as BlogPartialBlock);
      i++;
    } else if (line.match(/^>\s?/)) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        parts.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', content: parseInline(parts.join('\n')) } as BlogPartialBlock);
    } else if ((m = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/))) {
      blocks.push({ type: 'checkListItem', props: { checked: m[1].toLowerCase() === 'x' }, content: parseInline(m[2]) } as BlogPartialBlock);
      i++;
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      blocks.push({ type: 'bulletListItem', content: parseInline(m[1]) } as BlogPartialBlock);
      i++;
    } else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
      blocks.push({ type: 'numberedListItem', content: parseInline(m[1]) } as BlogPartialBlock);
      i++;
    } else {
      const parts: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
        parts.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'paragraph', content: parseInline(parts.join('\n')) } as BlogPartialBlock);
    }
  }
  return blocks;
};
