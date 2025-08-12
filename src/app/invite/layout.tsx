import AppLayout from "@/components/app-layout";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
