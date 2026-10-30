import "./globals.css";

export const metadata = {
  title: "Wapi",
  description: "wapi é um sistema de controle de água e vazamentos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
