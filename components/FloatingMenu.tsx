import React, { useState } from 'react';
import { PlusIcon, ReceiptIcon, TargetIcon, ChartIcon, WalletIcon, SettingsIcon } from './icons';
import { View } from '../types';

interface FloatingMenuProps {
  onAddTransaction: () => void;
  setCurrentView: (view: View) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onAddTransaction, setCurrentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <PlusIcon className="w-6 h-6" />, label: 'Add Transaction', action: onAddTransaction },
    { icon: <ReceiptIcon className="w-6 h-6" />, label: 'Transactions', action: () => setCurrentView(View.Transactions) },
    { icon: <WalletIcon className="w-6 h-6" />, label: 'Accounts', action: () => setCurrentView(View.Accounts) },
    { icon: <TargetIcon className="w-6 h-6" />, label: 'Goals', action: () => setCurrentView(View.Goals) },
    { icon: <ChartIcon className="w-6 h-6" />, label: 'Reports', action: () => setCurrentView(View.Reports) },
    { icon: <SettingsIcon className="w-6 h-6" />, label: 'Settings', action: () => setCurrentView(View.Settings) },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative flex flex-col items-center">
        
        {/* Menu Items Container */}
        <div 
            className="absolute bottom-full mb-3 flex flex-col items-center gap-3"
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }} 
        >
          {menuItems.map((item, index) => (
            <div 
              key={item.label}
              className="relative group flex items-center transition-all duration-300 ease-out"
              style={{
                  transitionDelay: `${isOpen ? (menuItems.length - 1 - index) * 40 : index * 40}ms`,
                  transform: `translateY(${isOpen ? 0 : '20px'})`,
                  opacity: isOpen ? 1 : 0,
              }}
            >
              {/* Tooltip */}
              <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-700/90 backdrop-blur-sm text-white text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {item.label}
              </span>
              {/* Icon Button */}
              <button
                onClick={() => { item.action(); setIsOpen(false); }}
                className="w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-300 flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-cyan-500 hover:text-white hover:scale-110"
                aria-label={item.label}
                tabIndex={isOpen ? 0 : -1}
              >
                {item.icon}
              </button>
            </div>
          ))}
        </div>
        
        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-110"
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
            <PlusIcon className={`w-8 h-8 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}/>
        </button>
      </div>
    </div>
  );
};

export default FloatingMenu;
