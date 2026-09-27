import { redirect } from "next/navigation";

/** CODE is the default Context view; existing links keep their destinations. */
export default function MetricsPage() {
  redirect("/code");
}
