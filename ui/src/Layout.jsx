import { IoMenu } from "react-icons/io5";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const menus = [{
        name: '首页',
        onClick: () => {
            window.location.href = '/'
        }
    }, {
        name: '什么是号角计划？',
        onClick: () => {
            document.getElementById('what-is-shofar')?.scrollIntoView({ behavior: 'smooth' });
            setOpen(false);
        }
    }, {
        name: 'ShofarAPP',
        onClick: () => {
            document.getElementById('shofar-app')?.scrollIntoView({ behavior: 'smooth' });
            setOpen(false);
        }
    }, {
        name: 'TokeaPlatform',
        onClick: () => {
            document.getElementById('tokea-platform')?.scrollIntoView({ behavior: 'smooth' });
            setOpen(false);
        }
    }]

    return (
        <div>
            <div className="py-4 px-8 flex items-center justify-between border-b border-black/10 container mx-auto border-x border-black/10">
                <div className='flex items-center gap-3'>
                    <img height={35} width={35} src='./logo.svg' />
                    <div className="text-2xl">Shofar</div>
                </div>
                <div className="flex items-center gap-5 hidden md:flex cursor-pointer">
                    {menus.map((menu, index) => (
                        <div key={index} onClick={menu.onClick}>{menu.name}</div>
                    ))}
                </div>
                <div className='block md:hidden'>
                    <div className=' cursor-pointer px-4 py-2 bg-blue-800 text-white' onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open);
                    }}><IoMenu /></div>
                </div>
            </div>
            <div>
                {children}
            </div>
            {open && (
                <div ref={menuRef} className='fixed top-0 mt-15 right-0 left-0 z-[1000]'>
                    <div className="grid items-center gap-5 bg-white p-8 border-b border-black/10 cursor-pointer">
                        {menus.map((menu, index) => (
                            <div key={index} onClick={menu.onClick}>{menu.name}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}