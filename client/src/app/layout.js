import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "iychat",
  description: "A real-time chat app",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ebedf0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
  ],
};

// Runs before React hydrates, so the saved theme is already on <html> by the
// time the first pixel is painted. Without this you get a flash of light mode
// on every reload, which looks broken.
const themeScript = `
  try {
    const saved = localStorage.getItem("iychat-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  } catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
