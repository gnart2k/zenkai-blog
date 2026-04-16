import { i18n } from "../../i18n-config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={i18n.defaultLocale}>
      <body>{children}</body>
    </html>
  );
}
