import { notFound } from "next/navigation";
import CaseStudyDocument from "@/components/case-study-document";
import { CASE_STUDY_DOCUMENTS, isCaseStudySlug } from "@/lib/case-studies";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CASE_STUDY_DOCUMENTS).filter((slug) => slug !== "overview").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCaseStudySlug(slug) || slug === "overview") notFound();
  return { title: `${CASE_STUDY_DOCUMENTS[slug].title} | Prove-It`, robots: { index: false, follow: false } };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCaseStudySlug(slug) || slug === "overview") notFound();
  return <CaseStudyDocument slug={slug} />;
}
