



export default function Divider({
    mb, mt
}: {
    mb?: number,
    mt?: number
}) {
    return (
        <div className="h-1 rounded-2xl bg-card-up" style={{ marginTop: mt, marginBottom: mb }}></div>
    )
}