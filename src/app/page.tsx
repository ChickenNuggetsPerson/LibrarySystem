import WelcomeCard, { WelcomeCard_Loading } from "@/components/WelcomeCard";
import { Suspense } from "react";
import AdminLoginButton from "@/components/admin/AdminLoginButton";




export default function MainPage() {

    return (
        <div>
            <Suspense fallback={<WelcomeCard_Loading />}>
                <WelcomeCard />
            </Suspense>
            <Suspense>
                <AdminLoginButton />
            </Suspense>
        </div>

    )
}
