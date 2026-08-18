import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import StudentNavbar from '../components/StudentNavbar.jsx';
import TrainerNavbar from '../components/TrainerNavbar';
import Footer from '../components/Footer.jsx';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  TagIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  ShoppingBagIcon as EmptyBagIcon
} from '@heroicons/react/24/outline';

// CHANGE: Added strict type definitions for individual items in the shopping cart
interface CartItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  price: number;
}

// CHANGE: Added strict type interface for the localization/translation text structure
interface ShoppingCartTranslations {
  title: string;
  subtitle: string;
  summaryTitle: string;
  emptyCart: string;
  subtotal: string;
  discount: string;
  vat: string;
  total: string;
  couponPlaceholder: string;
  btnApply: string;
  btnCheckout: string;
  secureBadge: string;
  couponSuccess: string;
  couponInvalid: string;
  checkoutSuccess: string;
}

// CHANGE: Added strict type for the feedback message banner system state
interface FeedbackState {
  text: string;
  isError: boolean;
}



export default function Cart() {
  // CHANGE: Extracted type constraints from the custom Language Context hook
  const { t, lang } = useLanguage() as { t: { shoppingCart?: ShoppingCartTranslations; dir: "ltr" | "rtl" }; lang: string };
  const navigate = useNavigate();
  const { role } = useAuth();

  const l: ShoppingCartTranslations = t.shoppingCart || {
    title: lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart',
    subtitle: lang === 'ar' ? 'مراجعة المناهج والمسارات المختارة وإتمام عملية الدفع الآمن.' : 'Review your selected tracks and complete your secure purchase.',
    summaryTitle: lang === 'ar' ? 'ملخص الطلب المالي' : 'Order Financial Summary',
    emptyCart: lang === 'ar' ? 'سلة التسوق فارغة حالياً. تصفح المسارات لإضافتها!' : 'Your shopping cart is currently empty. Explore tracks to begin!',
    subtotal: lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal',
    discount: lang === 'ar' ? 'خصم قسيمة التخفيض' : 'Coupon Discount',
    vat: lang === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)',
    total: lang === 'ar' ? 'الإجمالي الصافي المستحق' : 'Net Total Amount',
    couponPlaceholder: lang === 'ar' ? 'أدخل رمز الكوبون (مثال: CAPSULA10)' : 'Enter coupon code (e.g., CAPSULA10)',
    btnApply: lang === 'ar' ? 'تطبيق' : 'Apply',
    btnCheckout: lang === 'ar' ? 'الانتقال للدفع الآمن' : 'Proceed to Secure Checkout',
    secureBadge: lang === 'ar' ? 'دفع آمن ومحمي 100%' : '100% Secured & Encrypted Checkout',
    couponSuccess: lang === 'ar' ? 'تم تطبيق خصم الكوبون بنجاح!' : 'Coupon discount applied successfully!',
    couponInvalid: lang === 'ar' ? 'رمز الكوبون غير صحيح أو منتهي الصلاحية' : 'Invalid or expired coupon code',
    checkoutSuccess: lang === 'ar' ? 'تم تسجيل طلبك! جاري تحويلك لبوابة الدفع...' : 'Order registered! Redirecting to secure gateway...'
  };

  // CHANGE: Type-hinted useState to explicitly track an array of CartItem objects
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // CHANGE: Explicitly typed standard string state for the raw input element string value
  const [couponCode, setCouponCode] = useState<string>('');
  
  // CHANGE: Explicitly typed numeric state for computational calculations
  const [appliedDiscountRate, setAppliedDiscountRate] = useState<number>(0);
  
  // CHANGE: Attached FeedbackState type signature to form validation feedback object state
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState>({ text: '', isError: false });
  
  // CHANGE: Explicitly typed standard boolean state flag toggled during execution processes
  const [checkoutStatus, setCheckoutStatus] = useState<boolean>(false);

  // CHANGE: Explicitly declared primitive 'number' type parameter on ID deletion handler
  const handleRemoveItem = (id: number): void => {
    const updatedCart = cartItems.filter((item: CartItem) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  // CHANGE: Added specific React synthetic form submission event handling type signature
  const handleApplyCoupon = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CAPSULA10') {
      setAppliedDiscountRate(10);
      setFeedbackMessage({ text: l.couponSuccess, isError: false });
    } else {
      setFeedbackMessage({ text: l.couponInvalid, isError: true });
    }
  };

  // CHANGE: Provided explicit type mapping parameter parameters inside reduction loop
  const subtotalAmount: number = cartItems.reduce((acc: number, item: CartItem) => acc + item.price, 0);
  const discountAmount: number = subtotalAmount * (appliedDiscountRate / 100);
  const taxableBasis: number = subtotalAmount - discountAmount;
  const vatAmount: number = taxableBasis * 0.15;
  const finalTotalAmount: number = taxableBasis + vatAmount;

  // CHANGE: Type annotated void return type for checkout gateway state transfer
  const handleCheckoutInit = async (): Promise<void> => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutStatus(true);
      setFeedbackMessage({ text: '', isError: false });

      const course = cartItems[0];
      const courseTitles = cartItems.map(c => c.title).join(' + ');
      const response = await createOrder(String(course.id));

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create order');
      }

      console.log("BACKEND ORDER DATA:", response.data);

      const orderData = response.data as { 
        id?: string; 
        orderId?: string; 
        order?: { id: string }; 
        amount?: number;
      };
      const realOrderId = orderData.id || orderData.orderId || orderData.order?.id;

      if (!realOrderId) {
        throw new Error("Order was created, but could not find the ID in the response.");
      }

      navigate('/payment', {
        state: {
          orderId: realOrderId,
          courseId: course.id,
          courseName: cartItems.length > 1 ? `${cartItems.length} ${lang === 'ar' ? 'دورات' : 'Courses'}: ${courseTitles}` : course.title,
          trainer: lang === 'ar' ? 'نخبة من المدربين' : 'Expert Instructors',
          price: finalTotalAmount, 
        },
      });
    } catch (error) {
    console.error("Checkout Error:", error);
    setFeedbackMessage({
      text:
        error instanceof Error
          ? error.message
          : lang === 'ar'
            ? 'حدث خطأ أثناء إنشاء الطلب.'
            : 'Failed to create order.',
      isError: true,
    });

    setCheckoutStatus(false);
  }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent font-sans text-slate-800 dark:text-slate-100 selection:bg-[#00A499]/10" dir={t.dir}>
      {role === 'trainer' ? (
        <TrainerNavbar activePage="shopping-cart" />
      ) : (
        <StudentNavbar activePage="shopping-cart" />
      )}

      <div className="relative overflow-hidden bg-gradient-to-tr from-capsule-footer via-capsule-navy to-capsule-teal text-white pt-24 pb-16 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,164,153,0.12),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#00A499]/20 text-[#26FFE6] text-xs font-black px-3 py-1 rounded-full border border-[#00A499]/30 mb-4 uppercase tracking-wide">
            <ShoppingBagIcon className="w-3.5 h-3.5" />
            Secure Order Lifecycle
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">{l.title}</h1>
          <p className="text-slate-300 max-w-2xl text-xs md:text-sm font-semibold leading-relaxed">{l.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {cartItems.length === 0 ? (
          <div className="bg-white/75 dark:bg-[#162035]/60 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
            <EmptyBagIcon className="w-12 h-12 text-slate-300 dark:text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-slate-400 dark:text-slate-300">{l.emptyCart}</p>
          </div>
         ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItem) => (
                <div key={item.id} className="bg-white/75 dark:bg-[#162035]/60 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-200 dark:hover:border-white/20 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl flex-shrink-0">📘</div>
                    <div>
                      <span className="text-[10px] font-black text-[#00A499] dark:text-teal-300 bg-[#00A499]/10 dark:bg-teal-950/60 px-2 py-0.5 rounded-md uppercase tracking-wide border border-[#00A499]/20 dark:border-teal-700/40">{item.category}</span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-snug">{item.title}</h3>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mt-0.5 font-mono">{item.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span className="font-mono font-black text-sm md:text-base text-[#0D4C54] dark:text-emerald-400">{item.price.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/40 dark:border-rose-800/50 transition-colors cursor-pointer"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 dark:bg-[#162035]/80 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-capsule-footer via-capsule-navy to-capsule-teal"></div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>{l.summaryTitle}</h3>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-semibold text-xs md:text-sm space-y-3.5 pt-1">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-2"><span>{l.subtotal}</span><span className="font-mono font-bold text-slate-900 dark:text-white">{subtotalAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
                  {appliedDiscountRate > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-3.5"><span>{l.discount} (-{appliedDiscountRate}%)</span><span className="font-mono font-bold">-{discountAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
                  )}
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-3.5"><span>{l.vat}</span><span className="font-mono font-bold text-slate-900 dark:text-white">{vatAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
                  <div className="flex justify-between items-center text-base font-black pt-3.5 text-[#0D4C54] dark:text-white"><span>{l.total}</span><span className="font-mono">{Math.round(finalTotalAmount).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span></div>
                </div>

                <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-slate-400 mx-3" />
                      <input type="text" placeholder={l.couponPlaceholder} value={couponCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)} className={`w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 text-xs font-semibold focus:outline-none focus:border-[#00A499] transition-all ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`} />
                    </div>
                    <button type="submit" className="bg-[#0D4C54] dark:bg-capsule-teal hover:bg-[#003947] dark:hover:bg-teal-600 text-white font-black text-xs px-4 rounded-xl transition-all cursor-pointer">{l.btnApply}</button>
                  </div>
                  {feedbackMessage.text && <p className={`text-[11px] font-bold ${feedbackMessage.isError ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{feedbackMessage.text}</p>}
                </form>

                <div className="pt-2 space-y-3">
                  <button type="button" onClick={handleCheckoutInit} disabled={checkoutStatus} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs md:text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-lg disabled:opacity-50"><CreditCardIcon className="w-4 h-4" />{l.btnCheckout}</button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold flex items-center justify-center gap-1"><ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />{l.secureBadge}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}