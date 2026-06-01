'use client'

import Login from "@/auth/actions/Login";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";




export default function LoginForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(Login, { error: null, loggedIn: false });

    useEffect(() => {
        if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    useEffect(() => {
        if (state.loggedIn) {
            router.replace("/");
        }
    }, [router, state.loggedIn])

    return (
        <form action={formAction}>
            <Card className="w-sm">
                <CardContent className="flex flex-col gap-4">
                    <div className="text-muted-foreground text-center text-2xl font-semibold">
                        Login:
                    </div>

                    <Field>
                        <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
                        <Input id={"username"} placeholder={"Username"} name="username" autoComplete="username" required />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="input-field-password">Password</FieldLabel>
                        <Input id={"password"} placeholder={"Password"} name="password" autoComplete="password" type="password" required/>
                    </Field>
                
                    <Button className="w-full" type="submit">
                        Login
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}