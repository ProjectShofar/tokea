import {SelectUserType} from './start/select-user-type'
import { useStartStore } from '../store/useStartStore'
import {ForNewbie} from './start/for-newbie'
import {ForExpert} from './start/for-expert'

export default function Start()
{
    const { step } = useStartStore()
    const steps = {
        'select-user-type': <SelectUserType />,
        'for-newbie': <ForNewbie />,
        'for-expert': <ForExpert />,
    }
    return (
        <div className='max-w-2xl mx-auto'>
            <div className='mt-8 text-2xl'>👋 第一次来吗？</div>
            <div className='text-sm mt-2 opacity-70'>从这里开始部署你的Tokea</div>

            {steps[step]}
        </div>
    )
}