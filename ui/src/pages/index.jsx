import { useEffect } from "react"
import { useGetConfigs } from "../apis/config"
import { useNavigate } from "react-router-dom"

export default function Index() {
    return (
        <div>
            <div className='bg-white rounded-lg p-4 mb-4'>
                用户管理
            </div>
        </div>
    )
}