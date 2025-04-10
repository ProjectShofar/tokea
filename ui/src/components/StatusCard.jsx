import { IoReload, IoArrowUp, IoArrowDown, IoPerson, IoSpeedometer, IoWifi } from "react-icons/io5";
import { useGetConfigs } from "@/apis/config";
export function StatusCard() {
    const { data: config } = useGetConfigs()
    return (
        <div className='grid grid-cols-3 gap-4'>
            <div className='bg-primary rounded-lg p-4 col-span-3 h-[200px] md:h-full md:col-span-1 relative'>
                <div className="grid grid-cols-2">
                    <div className='absolute bottom-5'>
                        <div className='text-white opacity-50'>状态</div>
                        <div className='text-white text-3xl'>运行中</div>
                    </div>
                    <div className='absolute top-4 right-4'>
                        <button title='重启' className='flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors duration-200 text-white text-md px-3 py-1 rounded-full border border-white/30'>
                            <IoReload /> 重启
                        </button>
                    </div>
                </div>
            </div>
            <div className='bg-blue-500/10 rounded-lg col-span-3 md:col-span-2 p-2'>
                <div className='bg-white rounded-md'>
                    <div className="grid grid-cols-2 border-b border-gray-200 items-center">
                        <div className='border-r last:border-0 border-gray-200 p-4 flex items-start justify-between'>
                            <div>
                                <div className='opacity-50 text-sm'>上行</div>
                                <div className='text-lg'>0 Mbps</div>
                            </div>
                            <div className='text-2xl'>
                                <IoArrowUp className='rotate-45' />
                            </div>
                        </div>
                        <div className='border-r last:border-0 border-gray-200 p-4 flex items-start justify-between'>
                            <div>
                                <div className='opacity-50 text-sm'>下行</div>
                                <div className='text-lg'>0 Mbps</div>
                            </div>
                            <div className='text-2xl'>
                                <IoArrowDown className='rotate-315' />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-gray-200 items-center">
                        <div className='border-r last:border-0 border-gray-200 p-4 flex items-start justify-between'>
                            <div>
                                <div className='opacity-50 text-sm'>服务器IP</div>
                                <div className='text-lg'>{config?.ip}</div>
                            </div>
                            <div className='text-2xl'>
                                <IoWifi />
                            </div>
                        </div>
                        <div className='border-r last:border-0 border-gray-200 p-4 flex items-start justify-between'>
                            <div>
                                <div className='opacity-50 text-sm'>累计流量</div>
                                <div className='text-lg'>0 GB</div>
                            </div>
                            <div className='text-2xl'>
                                <IoSpeedometer />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}