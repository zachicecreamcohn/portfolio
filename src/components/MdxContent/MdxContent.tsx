import React from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import Prose from "@/components/Prose/Prose";
import { mdxComponents } from "@/mdx-components";
import { mdxOptions } from "@/lib/mdx";

/**
 * Compiles an MDX body and renders it inside <Prose>.
 *
 * Shared by blog posts and prose pages so there is exactly one place that
 * knows how content becomes HTML.
 */
export default async function MdxContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: mdxOptions,
  });

  return <Prose>{content}</Prose>;
}
