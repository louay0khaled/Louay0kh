
export enum SaleUnit {
    Box = 'علبة',
    Kilo = 'كيلو',
}

export interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: SaleUnit;
    purchasePrice: number;
    sellPrice: number;
    image: string; // base64 string
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    debt: number;
}

export interface SaleItem {
    product: Product;
    quantity: number;
}

export interface Sale {
    id: string;
    date: string;
    items: SaleItem[];
    total: number;
    amountPaid: number;
    customer: Customer | null;
}

export interface StoreInfo {
    name: string;
    phone: string;
}

export interface AppContextType {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    storeInfo: StoreInfo | null;
}
   