import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { seo } from "../data/content";

export const metadata = { title: seo.title, description: seo.description };

export const viewport = {
  themeColor: "#f5f0ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
