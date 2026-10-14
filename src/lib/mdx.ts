import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

/*
 * `SerializeOptions` is not reachable through the package's `exports` map
 * (importing "next-mdx-remote/dist/types" fails to resolve), so the options
 * type is derived from the public `compileMDX` signature instead.
 */
type CompileOptions = NonNullable<Parameters<typeof compileMDX>[0]["options"]>;

/**
 * The MDX plugin set.
 *
 * Deliberately short — every plugin is upgrade surface, and the MDX ecosystem
 * churns. This is the whole list:
 *
 *   remark-gfm                  tables, strikethrough, task lists, autolinks
 *   rehype-slug                 `id` on headings so they can be linked
 *   rehype-autolink-headings    the anchor link next to each heading
 *
 * These must be static `import`s, not `require()`: they are ESM-only packages
 * and Next's webpack build rejects `require` for them
 * ("ESM packages (rehype-slug) need to be imported").
 *
 * Syntax highlighting is intentionally NOT here yet. `rehype-pretty-code` +
 * `shiki` is the right choice once there are code blocks worth highlighting,
 * but it pulls a large dependency and a theme. Adding it later is a two-line
 * change to this file.
 *
 * The `as CompileOptions` assertion is load-bearing. remark-gfm, rehype-slug
 * and rehype-autolink-headings each vend their own structural opinion of the
 * hast/unified node types, and TypeScript cannot reconcile them into one
 * `PluggableList`. The conflict is purely in the type layer — the pipeline is
 * verified to compile and run. `satisfies` cannot be used here: it would
 * re-validate the same unsatisfiable intersection.
 */
export const mdxOptions = {
  // Frontmatter is parsed separately (see lib/content.ts) so the index page can
  // list posts without compiling every body.
  parseFrontmatter: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "Link to this section",
          },
          content: {
            type: "text",
            value: "#",
          },
        },
      ],
    ],
  },
} as CompileOptions;
