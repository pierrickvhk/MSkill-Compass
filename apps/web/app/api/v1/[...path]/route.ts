/** Same-origin, read-only gateway. The upstream stays runtime-configured and server-only. */
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const allowed = (path.length === 1 && ["graph", "radar"].includes(path[0])) ||
    (path.length === 2 && ["paths", "missions"].includes(path[0]) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path[1] ?? "")) ||
    (path[0] === "nodes" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path[1] ?? "") &&
      (path.length === 2 || (path.length === 3 && path[2] === "connections")));
  if (!allowed) return Response.json({ code: "not_found", message: "Unknown graph route" }, { status: 404 });
  try {
    const base = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
    const upstream = await fetch(`${base.replace(/\/$/, "")}/api/v1/${path.join("/")}`, {
      cache: "no-store", signal: AbortSignal.timeout(10_000), headers: { Accept: "application/json" },
    });
    if (!upstream.ok && upstream.status !== 404) throw new Error("Upstream unavailable");
    return new Response(await upstream.text(), {
      status: upstream.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ code: "upstream_unavailable", message: "The graph service is unavailable. Please retry." }, { status: 502 });
  }
}
