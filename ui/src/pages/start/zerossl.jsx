import cn from 'classnames'
import { IoArrowForwardSharp } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { useStartStore } from '../../store/useStartStore'
import { useNavigate } from 'react-router-dom'
import { PiSpinnerGap } from 'react-icons/pi'
import { Input } from '@/components/ui/input'
import { useZeroSSLInit } from '../../apis/zerossl'
import { useState } from 'react'
export function ZeroSSL() {
    const { type, templateType, setStep, setTemplateType } = useStartStore()
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { trigger: initZeroSSL, loading: initZeroSSLLoading, error: initZeroSSLError } = useZeroSSLInit()
    return (
        <>
            <div className='flex justify-between items-center mt-8'>
                <div>
                    <div className='text-xl'>配置ZeroSSL</div>
                    <div className='opacity-70 text-sm mt-2'>配置ZeroSSL证书以加密你的连接，确保你的数据安全。</div>
                </div>
                <img src='https://zerossl.com/assets/images/zerossl_logo.svg' className='w-32' />
            </div>

            <div className='mt-8'>
                <Input type='text' placeholder='ZeroSSL API Key' className='bg-white' value={key} onChange={(e) => setKey(e.target.value)} />
                <div className='text-sm mt-2 opacity-70'>
                    如何获取ZeroSSL API Key？
                    <a href='https://app.zerossl.com/signup' target='_blank' className='text-primary'>点击这里登入完成注册后</a> 访问 Developer 页面。
                </div>
            </div>
            <div className='mt-8 flex justify-between'>
                <Button variant='destructive' className='cursor-pointer' onClick={() => setStep('select-user-type')}>跳过加密</Button>
                <Button disabled={loading} className='cursor-pointer' onClick={async() => {
                    try {
                        if (loading) return;
                        setLoading(true)
                        await initZeroSSL({ key })
                        await new Promise(async resolve => {
                            while (true) {
                                fetch(`https://${window.location.host}`).then(() => {
                                    resolve(true)
                                })
                                await new Promise(resolve => setTimeout(resolve, 1000))
                            }
                        })
                        window.location.href = `https://${window.location.host}`
                    } finally {
                        setLoading(false)
                    }
                }}>加密我的连接 {loading ? <PiSpinnerGap className='animate-spin' /> : <IoArrowForwardSharp />}</Button>
            </div>
            {initZeroSSLError && <div className='bg-red-800 text-white p-4 mt-8 rounded-lg'>
                {initZeroSSLError?.message}
            </div>}
        </>
    )
}