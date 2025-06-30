import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  items: { icon: React.ElementType; label: string; href: string }[]
  isMinimized: boolean
  toggleMinimize: () => void
  onLogout: () => void
}

export function Sidebar({ items, isMinimized, toggleMinimize, onLogout }: SidebarProps) {
  return (
    <motion.div
      className={`bg-gradient-to-b from-slate-800 to-slate-900 text-white h-screen ${isMinimized ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col`}
      initial={false}
      animate={isMinimized ? { width: 64 } : { width: 256 }}
    >
      <div className="p-4 flex justify-end">
        <Button variant="ghost" size="icon" onClick={toggleMinimize} className="text-white hover:bg-slate-700">
          {isMinimized ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </Button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 px-2">
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-slate-700 ${isMinimized ? 'px-2' : 'px-4'}`}
                >
                  <item.icon size={24} className={isMinimized ? 'mr-0' : 'mr-2'} />
                  {!isMinimized && <span>{item.label}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4">
        <Button
          variant="ghost"
          className={`w-full justify-start text-white hover:bg-slate-700 ${isMinimized ? 'px-2' : 'px-4'}`}
          onClick={onLogout}
        >
          <LogOut size={24} className={isMinimized ? 'mr-0' : 'mr-2'} />
          {!isMinimized && <span>Logout</span>}
        </Button>
      </div>
    </motion.div>
  )
}


