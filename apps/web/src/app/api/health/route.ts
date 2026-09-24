// 存活检查：只说明进程在运行。依赖（DB、存储）的就绪检查在 W7 Day 4 加入。
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
