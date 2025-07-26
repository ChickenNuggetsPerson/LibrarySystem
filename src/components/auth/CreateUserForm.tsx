
import createUser from "@/actions/user/createUser";
import TextInput from "../Forms/TextInput";







interface CreateUserFormProps {
    code: string
}
export default function CreateUserForm({ code } : CreateUserFormProps ) {
    return (
        <form action={createUser} className="card w-md">

            <h5 className="mb-5 text-3xl font-bold tracking-tight text-text ">Create New User:</h5>

            <TextInput id={"name"} label={"Name"} val={""} placeholder={""} disabled={false} />

            <TextInput id={"username"} label={"Username"} val={""} placeholder={""} disabled={false} />
            <TextInput id={"password"} label={"Password"} val={""} placeholder={""} disabled={false} />

            <TextInput id={"code"} label={"Code"} val={code} placeholder={""} disabled={true} />

            <button type="submit" className="primary-button">Submit</button>
        </form>
    )
}