import cn from 'classnames'

export function Button({ children, className, icon, ...props }) {
    return (
        <button className={cn('bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 inline-flex active:bg-blue-500', className)} {...props}>{children} {icon}</button>
    )
}