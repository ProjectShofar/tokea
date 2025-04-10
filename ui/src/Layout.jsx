import { useEffect } from "react"
import { useGetConfigs } from "./apis/config"
import { useNavigate } from "react-router-dom"
import { IoSettings } from "react-icons/io5"
import { Modal } from "./components/Modal"

export default function Layout({ children }) {
    const { data: configs, loaded } = useGetConfigs()
    const navigate = useNavigate()
    useEffect(() => {
        if (!loaded) return
        if (!configs?.inited) navigate('/start')
    }, [configs, loaded])
    return (
        <div className='px-2'>
            <div className='py-4 max-w-4xl mx-auto flex items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                    <div className='text-2xl'>
                        <div>Tokea</div>
                    </div>
                </div>
                <div className='flex items-center gap-4 text-sm'>
                    <Modal
                        title={'系统设置'}
                    >
                        <div className='cursor-pointer p-2 border rounded-full text-xl'><IoSettings /></div>
                    </Modal>
                </div>
            </div>
            <div className='max-w-4xl mx-auto'>
                {children}
            </div>
        </div>
    )
}