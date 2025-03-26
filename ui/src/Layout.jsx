import { useEffect } from "react"
import { useGetConfigs } from "./apis/config"
import { useNavigate } from "react-router-dom"

export default function Layout({ children }) {
    const { data: configs, loaded } = useGetConfigs()
    const navigate = useNavigate()
    useEffect(() => {
        if (!loaded) return
        if (!configs?.inited) navigate('/start')
    }, [configs, loaded])
    return (
        children
    )
}