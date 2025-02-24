import Layout from "@/components/layouts/Layout";
import "./globals.css";

export const metadata = {
  title: "Teacher Schedule Check Web App",
  description: "Check Teacher schedule and make your life easier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
