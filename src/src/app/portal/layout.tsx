import PortalShell from "./PortalShell";

// Portal pages use useSearchParams and must not be statically prerendered.
export const dynamic = "force-dynamic";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
