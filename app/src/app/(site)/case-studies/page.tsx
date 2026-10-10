import CaseStudyDocument from "@/components/case-study-document";

export const metadata = { title: "Case studies | Bubble or Build", robots: { index: false, follow: false } };

export default function CaseStudiesPage() {
  return <CaseStudyDocument slug="overview" />;
}
