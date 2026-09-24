import CaseStudyDocument from "@/components/case-study-document";

export const metadata = { title: "Case studies — Prove-It", robots: { index: false, follow: false } };

export default function CaseStudiesPage() {
  return <CaseStudyDocument slug="overview" />;
}
