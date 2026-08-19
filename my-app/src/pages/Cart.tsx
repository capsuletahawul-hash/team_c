import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import StudentNavbar from '../components/StudentNavbar.jsx';
import TrainerNavbar from '../components/TrainerNavbar';
import Footer from '../components/Footer.jsx';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  TagIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  ShoppingCartIcon as EmptyBagIcon,
  AcademicCapIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  price: number;
}

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

interface FeedbackState {
  text: string;
  isError: boolean;
}

export default function Cart() {
  const { t, lang } = useLanguage() as { t: { shoppingCart?: ShoppingCartTranslations; dir: "ltr" | "rtl" }; lang: string };
  const navigate = useNavigate();
  const { role } = useAuth();
  const isRTL = t.dir === 'rtl';

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

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscountRate, setAppliedDiscountRate] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackState>({ text: '', isError: false });
  const [checkoutStatus, setCheckoutStatus] = useState<boolean>(false);

  const handleRemoveItem = (id: number): void => {
    const updatedCart = cartItems.filter((item: CartItem) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const handleApplyCoupon = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CAPSULA10') {
      setAppliedDiscountRate(10);
      setFeedbackMessage({ text: l.couponSuccess, isError: false });
    } else {
      setFeedbackMessage({ text: l.couponInvalid, isError: true });
    }
  };

  const formatNum = (num: number) => {
    return num.toLocaleString(lang === 'en' ? 'en-US' : 'ar-SA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const rawSubtotal: number = cartItems.reduce((acc: number, item: CartItem) => acc + item.price, 0);
  const discountAmount: number = rawSubtotal * (appliedDiscountRate / 100);
  const finalTotalAmount: number = rawSubtotal - discountAmount;
  const subtotalExclVat: number = finalTotalAmount / 1.15;
  const vatAmount: number = finalTotalAmount - subtotalExclVat;

  const handleCheckoutInit = async (): Promise<void> => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutStatus(true);
      setFeedbackMessage({ text: '', isError: false });

      const course = cartItems[0];
      const courseTitles = cartItems.map(c => c.title).join(' + ');
      let realOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        const response = await createOrder(String(course.id));
        if (response && response.success && response.data) {
          const orderData = response.data as { 
            id?: string; 
            orderId?: string; 
            order?: { id: string }; 
            amount?: number;
          };
          realOrderId = orderData.id || orderData.orderId || orderData.order?.id || realOrderId;
        }
      } catch (apiErr) {
        console.warn("Notice: proceeding to payment gateway with created session order ID:", apiErr);
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
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] font-sans text-slate-800 dark:text-slate-100 selection:bg-[#00A499]/20 transition-colors duration-300" dir={t.dir}>
      {role === 'trainer' ? (
        <TrainerNavbar activePage="shopping-cart" />
      ) : (
        <StudentNavbar activePage="shopping-cart" />
      )}

      {/* Refined Hero Banner for Dark and Light Modes */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0D3B43] via-[#123E4C] to-[#0A535C] dark:from-[#080E1A] dark:via-[#0F1B2D] dark:to-[#0F2837] text-white pt-24 pb-16 border-b border-teal-500/10 dark:border-teal-500/20 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,164,153,0.22),transparent_60%)] pointer-events-none"></div>
        <div className="absolute -bottom-10 right-10 w-96 h-96 bg-teal-500/15 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Big Embedded Glowing Glassmorphic Shopping Cart Logo Watermark */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4 md:left-14' : 'right-4 md:right-14'} pointer-events-none select-none opacity-25 dark:opacity-30 transition-all transform -rotate-12`}>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00A499] via-cyan-400 to-teal-300 rounded-full blur-3xl opacity-80 animate-pulse"></div>
            <div className="relative p-7 rounded-3xl bg-white/5 backdrop-blur-md border border-white/15 shadow-2xl">
              <ShoppingCartIcon className="w-48 h-48 md:w-64 md:h-64 text-[#26FFE6] dark:text-teal-300 drop-shadow-[0_0_35px_rgba(0,164,153,0.7)] stroke-[1.2]" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 dark:bg-teal-400/10 backdrop-blur-md text-[#26FFE6] dark:text-teal-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-teal-500/20 dark:border-teal-400/20 mb-4 shadow-sm tracking-wide">
            <ShoppingCartIcon className="w-4 h-4" />
            <span>{isRTL ? 'إدارة سلة الشراء' : 'Secure Order Lifecycle'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2.5 text-white">{l.title}</h1>
          <p className="text-slate-200 dark:text-slate-300 max-w-2xl text-xs md:text-sm font-medium leading-relaxed">{l.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {cartItems.length === 0 ? (
          <div className="bg-white/80 dark:bg-[#111A2B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-6 shadow-xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/20 dark:border-teal-400/20 flex items-center justify-center mx-auto shadow-xs">
              <EmptyBagIcon className="w-10 h-10 text-[#00A499] dark:text-teal-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isRTL ? 'سلتك فارغة حالياً' : 'Your cart is empty'}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {l.emptyCart}
              </p>
            </div>
            <button
              onClick={() => navigate('/courses-overview')}
              className="inline-flex items-center gap-2 bg-[#00A499] hover:bg-[#008c83] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <AcademicCapIcon className="w-4 h-4" />
              <span>{isRTL ? 'استكشف المسارات التعليمية' : 'Explore Tracks'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* List of Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItem) => (
                <div 
                  key={item.id} 
                  className="group bg-white/90 dark:bg-[#111A2B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/40 transition-all duration-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xl flex-shrink-0">
                      📘
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#00A499] dark:text-teal-300 bg-teal-500/10 dark:bg-teal-400/10 px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-teal-500/20 dark:border-teal-400/20">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-snug group-hover:text-[#00A499] dark:group-hover:text-teal-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-mono flex items-center gap-1">
                        <span>⏱️</span> {item.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-end">
                      <span className="text-[10px] text-slate-400 block font-semibold">{isRTL ? 'السعر' : 'Price'}</span>
                      <span className="font-mono font-black text-base text-[#0D4C54] dark:text-teal-300 inline-flex items-center gap-1.5">
                        {formatNum(item.price)} <span className="text-xl font-black text-[#00A499] dark:text-teal-300 leading-none">⃁</span>
                      </span>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(item.id)} 
                      title={isRTL ? 'إزالة من السلة' : 'Remove from cart'}
                      className="w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/40 transition-all cursor-pointer shadow-2xs"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Order Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/90 dark:bg-[#111A2B]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400"></div>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00A499]"></span>
                    {l.summaryTitle}
                  </h3>
                  <SparklesIcon className="w-4.5 h-4.5 text-amber-500" />
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-semibold text-xs md:text-sm space-y-3.5 pt-1">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-2">
                    <span>{lang === 'ar' ? 'المجموع (غير شامل الضريبة)' : 'Subtotal (Excl. VAT)'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                      {formatNum(subtotalExclVat)} <span className="text-lg font-black text-[#00A499] dark:text-teal-300 leading-none">⃁</span>
                    </span>
                  </div>

                  {appliedDiscountRate > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <CheckCircleIcon className="w-4 h-4" /> {l.discount} (-{appliedDiscountRate}%)
                      </span>
                      <span className="font-mono font-bold inline-flex items-center gap-1.5">
                        -{formatNum(discountAmount)} <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">⃁</span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-3.5">
                    <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                      {formatNum(vatAmount)} <span className="text-lg font-black text-[#00A499] dark:text-teal-300 leading-none">⃁</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-base font-black pt-3.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0A111F] p-3 rounded-2xl border border-slate-200/70 dark:border-teal-500/30">
                    <span className="text-xs md:text-sm font-black">{lang === 'ar' ? 'الإجمالي (شامل الضريبة 15%)' : 'Total Due (Incl. 15% VAT)'}</span>
                    <span className="font-mono text-xl text-[#00A499] dark:text-teal-300 inline-flex items-center gap-1.5 font-black">
                      {formatNum(finalTotalAmount)} <span className="text-2xl font-black text-[#00A499] dark:text-teal-300 leading-none">⃁</span>
                    </span>
                  </div>
                </div>

                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-slate-400 mx-3" />
                      <input 
                        type="text" 
                        placeholder={l.couponPlaceholder} 
                        value={couponCode} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)} 
                        className={`w-full bg-slate-50 dark:bg-[#0A111F] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-xl py-2 text-xs font-semibold focus:outline-none focus:border-[#00A499] transition-all ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`} 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-[#0D4C54] dark:bg-slate-800 hover:bg-[#08363c] dark:hover:bg-slate-700 text-white font-black text-xs px-4 rounded-xl transition-all cursor-pointer border border-transparent dark:border-slate-700"
                    >
                      {l.btnApply}
                    </button>
                  </div>
                  {feedbackMessage.text && (
                    <p className={`text-[11px] font-bold mt-1 ${feedbackMessage.isError ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {feedbackMessage.text}
                    </p>
                  )}
                </form>

                {/* Action Button - High Conversion Glassmorphic Glowing Button */}
                <div className="pt-3 space-y-3.5">
                  <button 
                    type="button" 
                    onClick={handleCheckoutInit} 
                    disabled={checkoutStatus} 
                    className="relative group w-full overflow-hidden rounded-2xl p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_8px_30px_rgba(0,164,153,0.4)] hover:shadow-[0_12px_40px_rgba(0,164,153,0.7)] disabled:opacity-50"
                  >
                    {/* Ambient Pulsing Glow Border */}
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-[#26FFE6] to-teal-300 rounded-2xl opacity-80 animate-pulse group-hover:opacity-100 transition-opacity"></span>
                    
                    {/* Inner Glass Container */}
                    <span className="relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#0D4C54] via-[#00A499] to-[#0D4C54] dark:from-[#092B31] dark:via-[#00A499] dark:to-[#0A3D46] backdrop-blur-xl px-6 py-4 rounded-[14px] text-white font-black text-sm md:text-base tracking-wide border border-white/30 group-hover:border-white/50 transition-all duration-300 overflow-hidden">
                      {/* Shimmer Light Reflection Sweep */}
                      <span className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out pointer-events-none"></span>

                      <CreditCardIcon className="w-5 h-5 md:w-6 md:h-6 text-[#26FFE6] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                      <span className="drop-shadow-sm">{l.btnCheckout}</span>
                      <SparklesIcon className="w-4 h-4 text-amber-300 animate-pulse" />
                    </span>
                  </button>
                  
                  <div className="space-y-1 text-center">
                    <p className="text-[11px] text-slate-500 dark:text-slate-300 font-extrabold flex items-center justify-center gap-1.5">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                      <span>{l.secureBadge}</span>
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                      {isRTL ? '⚡ وصول فوري ومباشر للدورة (120 يوماً) فور إتمام الدفع' : '⚡ Instant 120-day track access upon payment completion'}
                    </p>
                  </div>
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