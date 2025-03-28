import { useEffect, useState } from "react"
import { useGetConfigs } from "../apis/config"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { IoAddCircleOutline, IoCheckmark, IoQrCode, IoTrash, IoTrashBin } from "react-icons/io5"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAddUsers, useDeleteUser } from "../apis/user"
import { PiSpinner } from "react-icons/pi"
import { Form } from "@/components/ui/form"
import { useGetUsers } from "../apis/user"

export function UserManageCard() {
    const { trigger: addUsers, loading: addUsersLoading, error: addUsersError } = useAddUsers()
    const { data: users, loading: usersLoading, loaded: usersLoaded, refresh: refreshUsers } = useGetUsers()
    const [open, setOpen] = useState(false)
    const [preDeleteUser, setPreDeleteUser] = useState(null)
    const { trigger: deleteUser, loading: deleteUsersLoading, error: deleteUsersError } = useDeleteUser({ id: preDeleteUser?.id })
    return (
        <div className='bg-white rounded-lg pt-4 mb-4'>
            <div className='flex items-center justify-between px-4'>
                <div>用户管理</div>
                <div className='flex items-center gap-2'>
                    <Input className='h-8' placeholder='搜索用户' />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size='sm'>添加用户 <IoAddCircleOutline /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>添加新用户</DialogTitle>
                                <DialogDescription>
                                    添加用户并分享给朋友们，让他们也能享受到翻墙的乐趣。
                                </DialogDescription>
                            </DialogHeader>
                            <Form
                                onSubmit={async v => {
                                    await addUsers(v)
                                    refreshUsers()
                                    setOpen(false)
                                }}
                                fields={[
                                    {
                                        name: 'username',
                                        label: '用户名',
                                        component: <Input placeholder="e.g. tokea" name="username" type="text" />,
                                        description: '用户名仅用于方便识别用户'
                                    }
                                ]}
                                submitLoading={addUsersLoading}
                                submitText="添加"
                                errors={addUsersError?.errors}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className='mt-4'>
                <div className='flex items-center gap-4 p-4 py-2 font-bold border-b'>
                    <div className='flex-1 flex items-center gap-2'>
                        用户
                    </div>
                    <div className="flex gap-2">
                        操作
                    </div>
                </div>
                <div className='max-h-96 overflow-y-auto'>
                    {!usersLoaded && <PiSpinner className='text-primary animate-spin text-2xl mx-auto m-5' />}
                    {users?.map(user => (
                        <div key={user.uuid} className='flex items-center gap-4 p-4 border-b last:border-b-0'>
                            <div className='flex-1 flex items-center gap-4'>
                                <img src={`https://avatar.vercel.sh/${user.username}`} className='w-8 h-8 rounded-full' />
                                {user.username}
                            </div>
                            <div className="flex gap-2">
                                <Button size='sm' variant='outline'><IoQrCode /></Button>
                                <Button size='sm' variant='destructive' onClick={() => setPreDeleteUser(user)}><IoTrashBin /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Dialog open={!!preDeleteUser} onOpenChange={() => setPreDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>删除用户</DialogTitle>
                        <DialogDescription>
                            确定要删除 {preDeleteUser?.username} 吗？
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex gap-2 justify-end'>
                        <Button variant='outline' onClick={() => setPreDeleteUser(null)}>取消</Button>
                        <Button variant='destructive' onClick={async () => {
                            await deleteUser()
                            refreshUsers()
                            setPreDeleteUser(null)
                        }}>确定 {deleteUsersLoading && <PiSpinner className='animate-spin' />}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}