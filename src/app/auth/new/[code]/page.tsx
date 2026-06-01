



export const dynamic = 'force-dynamic';

export default async function NewUserPage({ params }: { params: Promise<{ code: string }> }) {

    const { code } = await params

    return (
        <div>
            {code}
        </div>
    )
}