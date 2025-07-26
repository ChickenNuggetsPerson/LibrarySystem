import CreateUserForm from "@/components/auth/CreateUserForm";





export const dynamic = 'force-dynamic';

export default async function NewUserPage({ params }: { params: Promise<{ code: string }> }) {

    const { code } = await params

    return (
        <CreateUserForm code={code} />
    )
}