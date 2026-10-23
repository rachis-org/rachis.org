import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import type { Post } from '~/types';

type Node = DefaultTreeAdapterMap['node'];
const ignoredTags = new Set(['script', 'style', 'template', 'aside', 'blockquote']);
const normalize = (text: string) => text.replace(/\s+/gu, ' ').trim();

function textContent(node: Node): string {
  if ('value' in node) return node.value;
  if ('tagName' in node && ignoredTags.has(node.tagName)) return '';
  if ('tagName' in node && node.tagName === 'br') return ' ';
  return 'childNodes' in node ? node.childNodes.map(textContent).join('') : '';
}

function firstParagraph(node: Node): string {
  if ('tagName' in node) {
    if (ignoredTags.has(node.tagName)) return '';
    if (node.tagName === 'p') return normalize(textContent(node));
  }
  if ('childNodes' in node) {
    for (const child of node.childNodes) {
      const paragraph = firstParagraph(child);
      if (paragraph) return paragraph;
    }
  }
  return '';
}

/** Plain-text previews for lists and RSS; the full post keeps its original content. */
export function getPostExcerpt(post: Pick<Post, 'excerpt' | 'content'>): string {
  if (post.excerpt?.trim()) return post.excerpt.trim();
  const document = parseFragment(post.content || '');
  const text = firstParagraph(document) || normalize(document.childNodes.map(textContent).join(' '));
  const characters = Array.from(text);
  if (characters.length <= 300) return text;
  const prefix = characters.slice(0, 299).join('');
  const boundary = prefix.lastIndexOf(' ');
  return (boundary > 0 ? prefix.slice(0, boundary) : prefix).trimEnd() + '…';
}
