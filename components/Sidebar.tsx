'use client';

import React from 'react';
import { MessageSquare, History, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: any[];
}

export default function Sidebar({ isOpen, setIsOpen, sessions }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 300 : 0 }}
        className="fixed lg:relative z-50 h-full bg-[#1e212b] border-r border-white/5 overflow-hidden flex flex-col"
      >
        <div className="p-6 flex items-center justify-between min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-accent/20">
              <Image 
                src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
                alt="DouliaMed Logo" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">DouliaMed</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 min-w-[300px]">
          <div className="mb-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all shadow-lg shadow-accent/10">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Nouvelle Session</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Historique</p>
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <History className="w-8 h-8 text-text-secondary/20 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Aucune session récente</p>
              </div>
            ) : (
              sessions.map((session, i) => (
                <button 
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-text-secondary hover:text-white rounded-xl transition-all text-left group"
                >
                  <MessageSquare className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  <span className="truncate text-sm">{session.title || "Session sans titre"}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 min-w-[300px]">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent">
              <Image 
                src="https://i.postimg.cc/Z5MH4cqY/Capture_d_e_cran_2026_02_24_a_12_47_09_PM.png" 
                alt="Dr. Charlotte Eposse" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Dr. Charlotte Eposse</p>
              <p className="text-xs text-text-secondary truncate">Pédiatre & Chercheuse</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button for Desktop when closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-4 z-50 p-3 bg-panel border border-white/5 rounded-xl shadow-xl hover:bg-accent hover:text-white transition-all hidden lg:block"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 p-3 bg-panel border border-white/5 rounded-xl shadow-xl lg:hidden"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  );
}
