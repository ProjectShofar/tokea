import { UserManageCard } from "../components/UserManageCard";
import { StatusCard } from "../components/StatusCard";


export default function Index() {
    return (
        <div className='grid grid-cols-1 gap-4'>
            <StatusCard />
            <UserManageCard />
        </div>
    )
}