import { useState } from 'react'
import { IoArrowForwardSharp, IoCheckmarkCircleSharp } from 'react-icons/io5'
import { Button } from '../../components/Button'
import classNames from 'classnames'
import { useStartStore } from '../../store/useStartStore'

export function SelectUserType() {

    const { type, setType, setStep } = useStartStore()
    return (
        <>
            <div className='mt-8 text-xl'>选择适合你的部署方式</div>
            <div className='grid grid-cols-2 gap-4 mt-4'>
                <div className={classNames({
                    'p-4 bg-white rounded-lg cursor-pointer border-2 border-stone-200 relative': true,
                    '!border-blue-600': type === 'newbie'
                })} onClick={() => setType('newbie')}>
                    <div>🐦 我是新手</div>
                    <div className='text-sm mt-2 opacity-70'>我第一次使用Tokea或第一次接触翻墙。</div>
                    {type === 'newbie' && <IoCheckmarkCircleSharp className='text-blue-600 absolute right-3 top-3 text-2xl' />}
                </div>
                <div className={classNames({
                    'p-4 bg-white rounded-lg cursor-pointer border-2 border-stone-200 relative': true,
                    '!border-blue-600': type === 'expert'
                })} onClick={() => setType('expert')}>
                    <div>🧓 我是老司机</div>
                    <div className='text-sm mt-2 opacity-70'>我熟悉翻墙，知道工作原理和常见配置及术语。</div>
                    {type === 'expert' && <IoCheckmarkCircleSharp className='text-blue-600 absolute right-3 top-3 text-2xl' />}
                </div>
            </div>
            <div className='mt-8 text-right'>
                <Button onClick={() => setStep(`for-${type}`)}>下一步 <IoArrowForwardSharp /></Button>
            </div>
        </>
    )
}