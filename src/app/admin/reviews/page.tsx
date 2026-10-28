import { redirect } from "next/navigation";

/** Reviews are managed via Google / seed — no admin UI. */
export default function AdminReviewsRemovedPage() {
  redirect("/admin");
}
