/**
 * What a Coming soon button says when clicked (#55). role="status" so screen
 * readers announce it without moving focus.
 */
export function ComingSoonNote({
  centerName,
  phone,
}: {
  centerName: string;
  phone: string;
}) {
  return (
    <p
      role="status"
      className="rounded-banner bg-sun-tint px-4 py-3 text-small text-sun-text"
    >
      Changing visits online is coming soon. Call {centerName} at{" "}
      <a
        href={`tel:${phone.replace(/\D/g, "")}`}
        className="font-semibold underline underline-offset-4"
      >
        {phone}
      </a>{" "}
      for now.
    </p>
  );
}
