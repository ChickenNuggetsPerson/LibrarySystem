import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
    title: "Library System",
    description: "",
    icons: {
        icon: '/favicon.png', // /public path
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en" style={{ scrollbarWidth: "none" }}>

            <body className={`antialiased text-text bg-background`}>
                {children}
            </body>
        </html>
    );
}
