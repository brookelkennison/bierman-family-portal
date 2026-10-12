import { notFound } from "next/navigation";

/**
 * Catches any URL no other page matches, so the 404 renders inside the app
 * shell (header and nav) instead of on a bare page.
 */
export default function Missing() {
  notFound();
}
