import cn from 'classnames'
import { IoArrowForwardSharp, IoCheckmarkCircleSharp } from 'react-icons/io5'
import { Button } from '../../components/Button'
import { useStartStore } from '../../store/useStartStore'

export function ForNewbie() {
    const { type, setType, setStep } = useStartStore()
    return (
        <>
            <div className='mt-8 text-xl'>选择模板快速开始</div>
            <div className='opacity-70 text-sm mt-2'>不会选择？随便选一个就行。</div>

            <div className='mt-8'>
                {[1,2,3].map(i => (
                    <div className={cn({
                        'p-4 bg-white cursor-pointer relative first:rounded-tl-lg first:rounded-tr-lg last:rounded-bl-lg last:rounded-br-lg border-b-1 border-b-stone-100 ': true,
                        'outline outline-2 outline-blue-600 rounded-lg z-1000': type === 'newbie' + i
                    })} onClick={() => setType('newbie' + i)}>
                        <div>Shadowsocks</div>
                        <div className='text-sm mt-1 opacity-70'>始于2013年，最经典的翻墙协议。</div>
                        {type === 'newbie' + i && <IoCheckmarkCircleSharp className='text-blue-600 absolute right-3 top-3 text-2xl' />}
                    </div>
                ))}
            </div>
            <div className='mt-8 text-right'>
                <Button onClick={() => setStep(`for-${type}`)}>下一步 <IoArrowForwardSharp /></Button>
            </div>
        </>
    )
}