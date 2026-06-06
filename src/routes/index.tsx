import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    if (typeof window !== "undefined") {
      throw redirect({ to: "/login" });
    }
    const { getSessionFn } = await import("@/lib/server-auth");
    const { user } = await getSessionFn();
    if (user) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
});
