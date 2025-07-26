import WelcomeCard, { WelcomeCard_Loading } from "@/components/WelcomeCard";
import { Suspense } from "react";





export default function MainPage() {

    return (
        <Suspense fallback={<WelcomeCard_Loading />}>
            <WelcomeCard />
        </Suspense>
        
    )
}
