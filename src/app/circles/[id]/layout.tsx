import AppLayout from "@/components/app-layout";

export default function CircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
