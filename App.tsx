

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Product, Customer, Sale, StoreInfo, AppContextType } from './types';
import { generateImage, sortInventoryByName } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { Calculator } from './components/Calculator';
import { Invoice } from './components/Invoice';
import { SaleUnit } from './types';

// --- UI Components (defined outside main App to prevent re-renders) ---

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 float-left">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// --- Page Components ---

const Dashboard: React.FC = () => {
    const { products, customers, sales } = useAppContext();
    const [rate, setRate] = useState('...');
    
    useEffect(() => {
        // NOTE: Direct scraping is blocked by CORS. This is a placeholder.
        // A backend proxy would be required to fetch this live.
        setRate('50,000'); // Mocked rate
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">لوحة التحكم</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700">إجمالي المنتجات</h2>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700">إجمالي الزبائن</h2>
                    <p className="text-4xl font-bold text-green-600 mt-2">{customers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700">إجمالي المبيعات</h2>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{sales.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
                    <h2 className="text-lg font-bold text-gray-700">سعر صرف الدولار الأمريكي مقابل الليرة السورية</h2>
                    <p className="text-4xl font-bold text-yellow-600 mt-2">{rate} <span className="text-xl">ل.س</span></p>
                    <p className="text-sm text-gray-500 mt-2">المصدر: SP-Today (بيانات محاكاة)</p>
                </div>
            </div>
        </div>
    );
};

const AddProduct: React.FC = () => {
    const { products, setProducts } = useAppContext();
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState<SaleUnit>(SaleUnit.Box);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [sellPrice, setSellPrice] = useState(0);
    const [image, setImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateImage = async () => {
        if (!name) {
            setError('الرجاء إدخال اسم المنتج أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const imageData = await generateImage(`صورة منتج احترافية لـ ${name} على خلفية بيضاء`);
            setImage(`data:image/png;base64,${imageData}`);
        } catch (e) {
            setError('فشل في إنشاء الصورة. الرجاء المحاولة مرة أخرى.');
            console.error(e);
        }
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !quantity || !sellPrice || !purchasePrice) {
            setError('الرجاء ملء جميع الحقول.');
            return;
        }
        const newProduct: Product = {
            id: Date.now().toString(),
            name,
            quantity,
            unit,
            purchasePrice,
            sellPrice,
            image,
        };
        setProducts([...products, newProduct]);
        // Reset form
        setName('');
        setQuantity(0);
        setUnit(SaleUnit.Box);
        setPurchasePrice(0);
        setSellPrice(0);
        setImage('');
        setError('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">إضافة منتج جديد</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم المنتج</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                     <div className="flex items-end">
                        <button type="button" onClick={handleGenerateImage} disabled={isLoading || !name} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center disabled:bg-gray-400">
                           {isLoading ? <Spinner /> : 'إنشاء صورة بالذكاء الاصطناعي'}
                        </button>
                    </div>
                </div>

                {image && (
                     <div className="flex justify-center">
                        <img src={image} alt="Generated Product" className="w-48 h-48 object-cover rounded-md border"/>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">الكمية</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">وحدة البيع</label>
                         <select value={unit} onChange={(e) => setUnit(e.target.value as SaleUnit)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value={SaleUnit.Box}>علبة</option>
                            <option value={SaleUnit.Kilo}>كيلو</option>
                        </select>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">سعر الشراء</label>
                        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">سعر البيع</label>
                        <input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>

                <div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">إضافة المنتج</button>
                </div>
            </form>
        </div>
    );
};

const Inventory: React.FC = () => {
    const { products, setProducts } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleSortAI = async () => {
        setIsLoading(true);
        try {
            const sortedNames = await sortInventoryByName(products.map(p => p.name));
            const sortedProducts = [...products].sort((a, b) => {
                return sortedNames.indexOf(a.name) - sortedNames.indexOf(b.name);
            });
            setProducts(sortedProducts);
        } catch (e) {
            console.error("Failed to sort with AI", e);
            alert('فشل في الترتيب باستخدام الذكاء الاصطناعي.');
        }
        setIsLoading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">المخزون</h1>
                <button onClick={handleSortAI} disabled={isLoading || products.length === 0} className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center disabled:bg-gray-400">
                    {isLoading ? <Spinner /> : 'ترتيب بواسطة AI'}
                </button>
            </div>
            {products.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">لا توجد منتجات في المخزون بعد.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <img src={p.image || 'https://picsum.photos/400/300'} alt={p.name} className="w-full h-40 object-cover"/>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{p.name}</h3>
                                <p className="text-gray-600">الكمية: {p.quantity} {p.unit}</p>
                                <p className="text-gray-600">سعر البيع: {p.sellPrice}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Customers: React.FC = () => {
    const { customers, setCustomers } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !phone) return;
        const newCustomer: Customer = {
            id: Date.now().toString(),
            name,
            phone,
            debt: 0,
        };
        setCustomers([...customers, newCustomer]);
        setName('');
        setPhone('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">الزبائن</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h2 className="text-xl font-bold text-gray-700">إضافة زبون جديد</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">الاسم</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">إضافة</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">قائمة الزبائن</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {customers.length === 0 ? <p className="text-gray-500">لا يوجد زبائن.</p> :
                        customers.map(c => (
                            <div key={c.id} className="p-4 border rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{c.name}</p>
                                    <p className="text-sm text-gray-600">{c.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm">الدين المتبقي</p>
                                    <p className={`font-bold ${c.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>{c.debt.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewSale: React.FC = () => {
    const { products, setProducts, customers, setCustomers, sales, setSales, storeInfo } = useAppContext();
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [productSearch, setProductSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [amountPaid, setAmountPaid] = useState(0);
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);

    const addToCart = (product: Product) => {
        const currentQty = cart.get(product.id) || 0;
        if (currentQty < product.quantity) {
            setCart(new Map(cart.set(product.id, currentQty + 1)));
        }
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (product && quantity >= 0 && quantity <= product.quantity) {
            const newCart = new Map(cart);
            if (quantity === 0) {
                newCart.delete(productId);
            } else {
                newCart.set(productId, quantity);
            }
            setCart(newCart);
        }
    };

    const filteredProducts = products.filter(p => p.name.includes(productSearch) && p.quantity > 0);
    const filteredCustomers = customers.filter(c => c.name.includes(customerSearch));
    
    const total = Array.from(cart.entries()).reduce((acc, [productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return acc + (product ? product.sellPrice * quantity : 0);
    }, 0);

    const handleCompleteSale = () => {
        if (cart.size === 0) return;

        // 1. Update product quantities
        const updatedProducts = products.map(p => {
            if (cart.has(p.id)) {
                return { ...p, quantity: p.quantity - (cart.get(p.id) || 0) };
            }
            return p;
        });
        setProducts(updatedProducts);

        // 2. Update customer debt if selected
        if (selectedCustomer) {
            const debt = total - amountPaid;
            const updatedCustomers = customers.map(c => {
                if (c.id === selectedCustomer.id) {
                    return { ...c, debt: c.debt + debt };
                }
                return c;
            });
            setCustomers(updatedCustomers);
        }

        // 3. Create and save sale record
        const sale: Sale = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: Array.from(cart.entries()).map(([productId, quantity]) => ({
                product: products.find(p => p.id === productId)!,
                quantity,
            })),
            total,
            amountPaid,
            customer: selectedCustomer,
        };
        setSales([...sales, sale]);
        setLastSale(sale);

        // 4. Reset state and show invoice
        setCart(new Map());
        setProductSearch('');
        setCustomerSearch('');
        setSelectedCustomer(null);
        setAmountPaid(0);
        setIsInvoiceVisible(true);
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">عملية بيع جديدة</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Products Section */}
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">المنتجات</h2>
                    <input type="text" placeholder="ابحث عن منتج..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full border p-2 rounded-md mb-4"/>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-bold">{p.name}</p>
                                    <p className="text-sm text-gray-500">المتاح: {p.quantity}</p>
                                </div>
                                <button onClick={() => addToCart(p)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">إضافة</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart & Customer Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">الفاتورة</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {Array.from(cart.entries()).map(([productId, quantity]) => {
                                const product = products.find(p => p.id === productId);
                                if (!product) return null;
                                return (
                                    <div key={productId} className="flex items-center justify-between">
                                        <span className="font-semibold">{product.name}</span>
                                        <input type="number" value={quantity} onChange={e => updateCartQuantity(productId, parseInt(e.target.value))} className="w-16 text-center border rounded-md mx-2"/>
                                        <span>{(product.sellPrice * quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                             {cart.size === 0 && <p className="text-gray-500">الفاتورة فارغة.</p>}
                        </div>
                        <div className="border-t mt-4 pt-4">
                            <p className="text-xl font-bold flex justify-between">الإجمالي: <span>{total.toFixed(2)}</span></p>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">الزبون (اختياري)</h2>
                        <input type="text" placeholder="ابحث عن زبون..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="w-full border p-2 rounded-md"/>
                        {customerSearch && (
                            <div className="border mt-1 rounded-md max-h-40 overflow-y-auto">
                                {filteredCustomers.map(c => (
                                    <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }} className="p-2 cursor-pointer hover:bg-gray-100">{c.name}</div>
                                ))}
                            </div>
                        )}
                        {selectedCustomer && <p className="mt-2 p-2 bg-blue-100 text-blue-800 rounded-md">الزبون المحدد: {selectedCustomer.name}</p>}
                    </div>

                    <div>
                        <label className="text-lg font-bold text-gray-700">المبلغ المدفوع</label>
                        <input type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} className="w-full border p-2 rounded-md mt-2"/>
                    </div>
                    
                    <button onClick={handleCompleteSale} disabled={cart.size === 0} className="w-full bg-green-600 text-white py-3 rounded-md font-bold text-lg hover:bg-green-700 disabled:bg-gray-400">إتمام البيع</button>
                </div>
            </div>

            <Modal isOpen={isInvoiceVisible} onClose={() => setIsInvoiceVisible(false)}>
                {lastSale && <Invoice sale={lastSale} storeInfo={storeInfo!} onClose={() => setIsInvoiceVisible(false)}/>}
            </Modal>
        </div>
    );
};

const Settings: React.FC<{ onSave: (info: StoreInfo) => void }> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSave = () => {
        if (name && phone) {
            onSave({ name, phone });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">إعدادات المتجر</h1>
                <p className="text-center text-gray-500 mb-6">الرجاء إدخال معلومات متجرك للمتابعة.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">اسم المتجر</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">رقم هاتف المتجر</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400" disabled={!name || !phone}>حفظ وبدء الاستخدام</button>
                </div>
            </div>
        </div>
    );
}


// --- Main App Component ---

const App: React.FC = () => {
    const [page, setPage] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // State management using custom hook for localStorage persistence
    const [storeInfo, setStoreInfo] = useLocalStorage<StoreInfo | null>('storeInfo', null);
    const [products, setProducts] = useLocalStorage<Product[]>('products', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    
    const contextValue: AppContextType = {
        products, setProducts,
        customers, setCustomers,
        sales, setSales,
        storeInfo
    };

    if (!storeInfo) {
        return <Settings onSave={setStoreInfo} />;
    }

    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <Dashboard />;
            case 'add-product': return <AddProduct />;
            case 'inventory': return <Inventory />;
            case 'customers': return <Customers />;
            case 'new-sale': return <NewSale />;
            case 'calculator': return <Calculator />;
            default: return <Dashboard />;
        }
    };
    
    return (
        <AppContext.Provider value={contextValue}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar isOpen={isSidebarOpen} setPage={setPage} currentPage={page} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex justify-between items-center p-4 bg-white border-b">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">{storeInfo.name}</h1>
                        <div></div> {/* Placeholder for right side items */}
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                        {renderPage()}
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default App;