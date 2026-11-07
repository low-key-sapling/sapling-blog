import { visit } from 'unist-util-visit';

/** Keep wide content keyboard-scrollable, including when JavaScript is disabled. */
export default function rehypeAccessibleContent() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const isMath = node.properties.className?.includes('katex-display');
      if (node.tagName === 'table' || isMath) {
        node.properties.tabIndex = 0;
        node.properties.ariaLabel = isMath
          ? '数学公式，可横向滚动'
          : '数据表格，可横向滚动';
        if (isMath) node.properties.role = 'group';
      }
    });
  };
}
