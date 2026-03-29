import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ShortcodeNodeView } from './ShortcodeNodeView';

export const ShortcodeNode = Node.create({
  name: 'shortcode',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      shortcodeName: { default: '' },
      shortcodeAttrs: { default: '{}' },
      shortcodeContent: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-shortcode]',
        getAttrs(node) {
          const el = node as HTMLElement;
          return {
            shortcodeName: el.getAttribute('data-shortcode') ?? '',
            shortcodeAttrs: el.getAttribute('data-shortcode-attrs') ?? '{}',
            shortcodeContent: el.getAttribute('data-shortcode-content') ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-shortcode': HTMLAttributes.shortcodeName,
        'data-shortcode-attrs': HTMLAttributes.shortcodeAttrs,
        'data-shortcode-content': HTMLAttributes.shortcodeContent,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShortcodeNodeView);
  },
});
