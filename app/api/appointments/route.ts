import { NextResponse, type NextRequest } from "next/server";
import { invalidInput, toApiError, type ApiError } from "@/lib/booking/errors";
import { bookingInput, listQuery } from "@/lib/booking/schema";
import { createClient } from "@/lib/supabase/server";

/*
 * Appointments API. Only GET and POST exist, so Next answers 405 for any
 * other method. Every query runs as the signed-in parent with RLS on.
 * proxy.ts already returns 401 for logged-out requests to /api/.
 */

function fail(error: ApiError) {
  return NextResponse.json(
    { error: error.code, message: error.message },
    { status: error.status },
  );
}

/** List the parent's appointments, only the columns a list needs. */
export async function GET(request: NextRequest) {
  const parsed = listQuery.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) return fail(invalidInput);
  const { childId, from, to } = parsed.data;

  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select(
      "id, patient_id, starts_at, ends_at, status, kind:appointment_types(label), provider:providers(display_name, credential)",
    )
    .order("starts_at", { ascending: true })
    .limit(200);
  if (childId) query = query.eq("patient_id", childId);
  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lt("starts_at", to);

  const { data, error } = await query;
  if (error) return fail(toApiError(error));

  return NextResponse.json({
    appointments: data.map((a) => ({
      id: a.id,
      childId: a.patient_id,
      title: a.kind.label,
      startsAt: a.starts_at,
      endsAt: a.ends_at,
      status: a.status,
      provider: [a.provider.display_name, a.provider.credential]
        .filter(Boolean)
        .join(", "),
    })),
  });
}

/** Book parent training. All rules are enforced by book_appointment(). */
export async function POST(request: NextRequest) {
  // Only accept writes from our own pages. Browsers always send Origin on
  // a POST, so a missing or foreign one means it didn't come from the app.
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return fail({
      status: 403,
      code: "bad_origin",
      message: "This request didn't come from the portal.",
    });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = bookingInput.safeParse(body);
  if (!parsed.success) return fail(invalidInput);
  const { patientId, providerId, startsAt, notes } = parsed.data;

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("book_appointment", {
    p_patient_id: patientId,
    p_provider_id: providerId,
    p_type: "parent_training",
    p_starts_at: startsAt,
    p_notes: notes,
  });
  if (error) return fail(toApiError(error));

  return NextResponse.json({ id }, { status: 201 });
}
