import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import ModalContainer from "@/components/Decorative/Modal/ModalContainer";


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
        <html lang="en" style={{ scrollbarWidth: "none" }} className="dark">
            <body className={`antialiased text-text bg-background`}>
                <ModalContainer>
                    <Toaster
                        toastOptions={{
                            className: 'card',
                            style: {
                                background: "var(--color-card)",
                                color: "var(--color-text)"
                            },
                        }}
                    />
                    <Header />

                    <div className="flex justify-center w-full pt-12">
                        {children}
                    </div>
                </ModalContainer>
            </body>
        </html>
    );
}
