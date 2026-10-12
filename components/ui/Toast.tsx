import { Icon } from "./Icon";

type ToastProps = {
  title: string;
  /** Short second line, e.g. "Maya · Thu, Oct 22". */
  detail?: string;
};

/**
 * Confirmation message, e.g. after booking. role="status" so screen readers
 * announce it without moving focus. The page decides where it sits and when
 * it goes away.
 */
export function Toast({ title, detail }: ToastProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-row border border-line bg-white px-4.5 py-3.5 shadow-tab"
    >
      <span className="mt-0.5 text-green-text">
        <Icon name="success" />
      </span>
      <div className="flex flex-col">
        <p className="text-label text-ink">{title}</p>
        {detail && <p className="text-small text-muted">{detail}</p>}
      </div>
    </div>
  );
}
