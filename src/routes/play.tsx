import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/play")({
  component: () => <Navigate to="/explore" replace />,
});
