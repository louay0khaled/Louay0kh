
import React from 'react';
import type { Sale, StoreInfo } from '../types';

interface InvoiceProps {
    sale: Sale;
    storeInfo: StoreInfo;
    onClose: () => void;
}

export const Invoice: React.FC<InvoiceProps> = ({ sale, storeInfo, onClose }) => {
    const handlePrint = () => {
        window.print();
    };
    
    const generateWhatsAppMessage = () => {
        let message = `*فاتورة من ${storeInfo.name}*\n`;
        message += `رقم الهاتف: ${storeInfo.phone}\n\n`;
        if (sale.customer) {
            message += `*الزبون:* ${sale.customer.name}\n`;
            message += `*رقم الزبون:* ${sale.customer.phone}\n\n`;
        }
        message += '------------------------------------\n';
        message += '*المنتجات:*\n';
        sale.items.forEach(item => {
            message += `- ${item.product.name} (الكمية: ${item.quantity}) - السعر: ${item.product.sellPrice * item.quantity}\n`;
        });
        message += '------------------------------------\n';
        message += `*الإجمالي:* ${sale.total.toFixed(2)}\n`;
        message += `*المدفوع:* ${sale.amountPaid.toFixed(2)}\n`;
        const remaining = sale.total - sale.amountPaid;
        message += `*المتبقي:* ${remaining.toFixed(2)}\n\n`;
        message += 'شكراً لتعاملكم معنا!';
        return encodeURIComponent(message);
    };

    const handleSendWhatsApp = () => {
        if (sale.customer && sale.customer.phone) {
            const message = generateWhatsAppMessage();
            // Note: Country code might be needed for this to work reliably.
            const whatsappUrl = `https://wa.me/${sale.customer.phone}?text=${message}`;
            window.open(whatsappUrl, '_blank');
        } else {
            alert('لا يوجد رقم هاتف للزبون لإرسال الفاتورة.');
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div id="invoice-content">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">{storeInfo.name}</h1>
                    <p className="text-gray-600">{storeInfo.phone}</p>
                </div>
                <div className="flex justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold">فاتورة إلى:</h2>
                        {sale.customer ? (
                            <>
                                <p>{sale.customer.name}</p>
                                <p>{sale.customer.phone}</p>
                            </>
                        ) : (
                            <p>زبون عام</p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">رقم الفاتورة: {sale.id}</h2>
                        <p>التاريخ: {new Date(sale.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <table className="w-full text-right mb-8">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">المنتج</th>
                            <th className="p-2">الكمية</th>
                            <th className="p-2">سعر الوحدة</th>
                            <th className="p-2">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item) => (
                            <tr key={item.product.id} className="border-b">
                                <td className="p-2">{item.product.name}</td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2">{item.product.sellPrice.toFixed(2)}</td>
                                <td className="p-2">{(item.product.sellPrice * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span>المجموع الفرعي:</span>
                            <span>{sale.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl border-t pt-2">
                            <span>الإجمالي:</span>
                            <span>{sale.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>المبلغ المدفوع:</span>
                            <span>{sale.amountPaid.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-red-600 font-bold">
                            <span>المبلغ المتبقي:</span>
                            <span>{(sale.total - sale.amountPaid).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-2 space-x-reverse no-print">
                <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">إغلاق</button>
                <button onClick={handleSendWhatsApp} disabled={!sale.customer?.phone} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300">إرسال عبر واتساب</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">طباعة</button>
            </div>

            <style>
            {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}
            </style>
        </div>
    );
};
   