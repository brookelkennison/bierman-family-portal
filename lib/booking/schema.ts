import { z } from "zod";

/**
 * Inputs the appointments API accepts. Zod checks the real request at
 * runtime, since TypeScript types disappear once the app is running.
 * The database checks the business rules again (book_appointment), so these
 * are about shape: right fields, right types, sane lengths.
 */

export const NOTES_MAX = 500;

/** POST /api/appointments. Only parent training can be booked, so no type. */
export const bookingInput = z.object({
  patientId: z.uuid(),
  providerId: z.uuid(),
  /** ISO time with an offset, e.g. "2026-10-22T10:00:00-04:00". */
  startsAt: z.iso.datetime({ offset: true }),
  notes: z
    .string()
    .trim()
    .max(NOTES_MAX)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type BookingInput = z.infer<typeof bookingInput>;

/** GET /api/appointments?childId=&from=&to= */
export const listQuery = z
  .object({
    childId: z.uuid().optional(),
    from: z.iso.datetime({ offset: true }).optional(),
    to: z.iso.datetime({ offset: true }).optional(),
  })
  .refine((q) => !q.from || !q.to || q.from < q.to, {
    message: "from must be before to",
  });

export type ListQuery = z.infer<typeof listQuery>;
