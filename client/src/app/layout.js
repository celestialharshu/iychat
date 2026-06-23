import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "iychat",
  description: "A simple real-time chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
