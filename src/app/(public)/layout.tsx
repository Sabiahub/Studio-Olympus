import PublicLayoutClient from "@/components/layouts/PublicLayoutClient";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicLayoutClient>
      {children}
    </PublicLayoutClient>
  );
}
