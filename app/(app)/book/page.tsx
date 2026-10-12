import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/booking/BookingForm";
import { NoChildren } from "@/components/dashboard/NoChildren";
import { Icon } from "@/components/ui/Icon";
import { getCurrentParent } from "@/lib/auth";
import { getBookingData } from "@/lib/booking/data";
import { getDefaultCenter } from "@/lib/data";

export const metadata: Metadata = {
  title: "Book parent training | Bierman Family Portal",
};

/** Book parent training (Figma 06, 07). */
export default async function BookPage() {
  const parent = await getCurrentParent();
  const data = await getBookingData(parent.id);

  if (data.kids.length === 0) {
    return (
      <NoChildren
        firstName={parent.fullName.split(" ")[0] ?? parent.fullName}
        center={await getDefaultCenter()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-1 self-start text-label text-navy underline-offset-4 hover:underline"
      >
        <Icon name="back" size={16} />
        Back to home
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-h1-sm text-navy lg:text-h1">
          Book parent training
        </h1>
        <p className="text-muted">
          Parent training with your child&apos;s BCBA, at a time that works for
          you.
        </p>
      </div>
      <BookingForm {...data} />
    </div>
  );
}
