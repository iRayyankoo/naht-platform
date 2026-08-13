import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function UnitAliasRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  // Exact slug match or exact name match only — no contains or wildcard matching
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: decodedSlug },
        { name: decodedSlug },
      ],
    },
    select: { slug: true },
  });

  if (project?.slug) {
    redirect(`/projects/${project.slug}`);
  }

  // Return HTTP 404 Not Found if project does not exist
  notFound();
}
