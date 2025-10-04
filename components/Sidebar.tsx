

import React from 'react';

interface SidebarProps {
    isOpen: boolean;
    setPage: (page: string) => void;
    currentPage: string;
}

// FIX: Define NavLinkProps interface for better readability and to resolve JSX namespace issue.
interface NavLinkProps {
    page: string;
    label: string;
    currentPage: string;
    setPage: (page: string) => void;
    icon: JSX.Element;
}

const NavLink: React.FC<NavLinkProps> = ({ page, label, currentPage, setPage, icon }) => {
    const isActive = currentPage === page;
    return (
        <a href="#" onClick={() => setPage(page)} className={`flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md ${isActive ? 'bg-gray-900' : ''}`}>
            {icon}
            <span className="mx-4 font-medium">{label}</span>
        </a>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setPage, currentPage }) => {
    return (
        <div className={`fixed inset-y-0 right-0 z-30 w-64 bg-gray-800 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
             <div className="flex items-center justify-center mt-8">
                <div className="flex items-center">
                    <span className="text-white text-2xl font-semibold">المحاسب AI</span>
                </div>
            </div>
            <nav className="mt-10 flex-1 px-2">
                <NavLink page="dashboard" label="لوحة التحكم" currentPage={currentPage} setPage={setPage} icon={<DashboardIcon />} />
                <NavLink page="add-product" label="إضافة منتج" currentPage={currentPage} setPage={setPage} icon={<AddProductIcon />} />
                <NavLink page="inventory" label="المخزون" currentPage={currentPage} setPage={setPage} icon={<InventoryIcon />} />
                <NavLink page="customers" label="الزبائن" currentPage={currentPage} setPage={setPage} icon={<CustomersIcon />} />
                <NavLink page="new-sale" label="عملية بيع" currentPage={currentPage} setPage={setPage} icon={<NewSaleIcon />} />
                <NavLink page="calculator" label="آلة حاسبة" currentPage={currentPage} setPage={setPage} icon={<CalculatorIcon />} />
            </nav>
        </div>
    );
};

// Icons
const DashboardIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const AddProductIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const InventoryIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>;
const CustomersIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
const NewSaleIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
const CalculatorIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;