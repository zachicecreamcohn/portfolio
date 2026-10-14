import type { MDXComponents } from "mdx/types";
import Figure from "@/components/Figure/Figure";
import Gallery from "@/components/Gallery/Gallery";
import Split from "@/components/Split/Split";
import Bleed from "@/components/Bleed/Bleed";

/**
 * Components available inside .mdx content, without an import per file.
 *
 * The goal is a small, memorable vocabulary. Each one earns its place by
 * expressing something Markdown cannot: Markdown has no captions, no grids,
 * no side-by-side, and no way to escape the text measure.
 *
 * Keep this list short. Every entry is a thing authors must learn and the
 * site must maintain.
 */
export const mdxComponents: MDXComponents = {
  Figure,
  Gallery,
  Split,
  Bleed,
};

export default mdxComponents;
