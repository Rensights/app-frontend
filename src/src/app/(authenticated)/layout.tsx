import AuthenticatedShell from "./AuthenticatedShell";

// Authenticated pages use useSearchParams and must not be statically prerendered.
export const dynamic = "force-dynamic";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
