import { redirect } from "next/navigation";

/** Compare is the default Context view; existing links keep their destinations. */
export default function MetricsPage() {
  redirect("/compare");
}
