import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/match/review/$matchId")({ head: () => pageHead("Resultados da pelada", "MVP automático e estatísticas registradas na súmula."), beforeLoad: ({ params }) => { throw redirect({ to: "/match/summary/$matchId", params: { matchId: params.matchId } }); } });
