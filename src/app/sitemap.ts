import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/chi-sono", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/my-yoga", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ritiri", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/corsi", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/risorse", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contatti", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/registrati", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [retreats, courses, posts] = await Promise.all([
    prisma.retreat.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const retreatEntries: MetadataRoute.Sitemap = retreats.map((r) => ({
    url: `${SITE_URL}/ritiri/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/corsi/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...retreatEntries, ...courseEntries, ...postEntries];
}
