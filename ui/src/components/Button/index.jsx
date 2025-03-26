import cn from 'classnames'
import { PiSpinnerGap } from 'react-icons/pi'

export function Button({ type, block, children, className, icon, loading, ...props }) {
    const ghost = 'bg-transparent border-2 border-stone-200 !text-black hover:bg-stone-100 active:bg-stone-200'
    return (
        <button
            disabled={loading}
            className={cn({
                'bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 inline-flex active:bg-blue-500': true, 
                [className]: true,
                [ghost]: type === 'ghost',
                'w-full !block': block
            })}
            {...props}
        >
            {children} {loading ? <PiSpinnerGap className='animate-spin' /> : icon}
        </button>
    )
}