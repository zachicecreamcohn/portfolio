import type { MetadataRoute } from "next";

const BASE_URL = "https://zachwcohn.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* The contact endpoint is a form handler, not a page. */
      disallow: "/contact/api",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
