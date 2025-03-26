import cn from 'classnames'
import { PiSpinnerGap } from 'react-icons/pi'

export function Button({ children, className, icon, loading, ...props }) {
    return (
        <button disabled={loading} className={cn('bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 inline-flex active:bg-blue-500', className)} {...props}>
            {children} {loading ? <PiSpinnerGap className='animate-spin' /> : icon}
        </button>
    )
}