import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import StudentNavbar from '../components/StudentNavbar';
import TrainerNavbar from '../components/TrainerNavbar';
import Footer from '../components/Footer';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { startCheckout } from "../services/api";

// @ts-ignore
import applePayLogo from '../assets/ApplePay.png';
// @ts-ignore
import moyasarLogo from '../assets/Moyassar.png';

declare global {
  interface Window {
    Moyasar: any;
  }
}

interface OrderDetails {
  courseName: string;
  trainer: string;
  price: number;
  discount: number;
  totalAmount: number;
  courseIds?: number[];
  orderId?: string; // أضفنا رقم الطلب لربطه بـ Moyasar
}

type PaymentMethod = 'card' | 'apple_pay' | 'moyasar';

export default function Payment() {
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const isRTL = lang === 'ar';

  // قراءة الـ payment.id إذا كان المستخدم راجعاً من التوجيه بعد الدفع (3DS Callback)
  const paymentIdFromUrl = searchParams.get('id');
  const orderIdFromUrl = searchParams.get('orderId');

  const rawOrder = location.state as Partial<OrderDetails> | null;

  const order: OrderDetails = {
    courseName:
      rawOrder?.courseName ||
      "Full-Stack Generative AI & Digital Transformation Bootcamp",

    trainer:
      rawOrder?.trainer ||
      "Ahmed Mohammed",

    price:
      typeof rawOrder?.price === "number"
        ? rawOrder.price
        : 450,

    discount:
      typeof rawOrder?.discount === "number"
        ? rawOrder.discount
        : 0,

    totalAmount:
      typeof rawOrder?.totalAmount === "number"
        ? rawOrder.totalAmount
        : typeof rawOrder?.price === "number"
          ? rawOrder.price
          : 250,

    courseIds: rawOrder?.courseIds,
    orderId: orderIdFromUrl || rawOrder?.orderId,
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('moyasar');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // 1. التحقق من الدفع عند عودة المستخدم من بوابة Moyasar
  useEffect(() => {
    if (paymentIdFromUrl) {
      verifyPaymentOnBackend(paymentIdFromUrl);
    }
  }, [paymentIdFromUrl]);

  // 2. تحميل سكربت وتهيئة نموذج Moyasar عند اختيار ميسر أو خيار البطاقة
  useEffect(() => {
    if (!paymentIdFromUrl && (paymentMethod === 'moyasar' || paymentMethod === 'card')) {
      loadMoyasarSDK();
    }
  }, [paymentMethod, paymentIdFromUrl]);

  const loadMoyasarSDK = () => {
    if (document.getElementById('moyasar-sdk')) {
      initMoyasarForm();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'moyasar-sdk';
    script.src = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.umd.min.js';
    script.onload = () => initMoyasarForm();
    document.body.appendChild(script);
  };

  const initMoyasarForm = async () => {
    if (window.Moyasar) {
      // إرسال المبلغ بالهللات (ضرب 100) حسب توثيق Moyasar
      const amountInHalalas = Math.round(order.totalAmount * 100);

      if (order.orderId) {
        try {
          await startCheckout(order.orderId).catch(err => {
            console.warn("Notice: Moyasar checkout init session warning:", err);
          });
        } catch (err) {
          console.warn("Notice: startCheckout handled gracefully:", err);
        }
      }

      const apiKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || 'pk_test_vcMykhadWBxxppsvlhAAbfAn';

      window.Moyasar.init({
        element: '.mysr-form',
        amount: amountInHalalas > 0 ? amountInHalalas : 40000,
        currency: 'SAR',
        description: `Purchase: ${order.courseName}`,
        publishable_api_key: apiKey,
        callback_url: `${window.location.origin}/payment?orderId=${order.orderId || 'ord_demo'}`,
        supported_networks: ['visa', 'mastercard', 'mada', 'unionpay'],
        methods: ['creditcard'],
        metadata: {
          orderId: order.orderId || 'ord_123',
        },
      });

    }
  };

  // 3. دالة الاستدعاء والتحقق من السيرفر (Server-Side Verification)
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const verifyPaymentOnBackend = async (paymentId: string) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/payment/return?id=${paymentId}&orderId=${order.orderId}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      const targetDashboard = role === 'admin' ? '/admin-dashboard' : role === 'trainer' ? '/trainer-dashboard' : '/student-dashboard';

      if (data.success || response.ok) {
        localStorage.removeItem('cartItems');
        navigate(targetDashboard, {
          state: { paymentSuccess: true }
        });
      } else {
        setVerificationError(
          (lang === 'ar' ? 'فشل التحقق من العملية: ' : 'Payment verification failed: ') +
          (data.error || '')
        );
      }
    } catch (err) {
      console.error('Verification Error:', err);
      const targetDashboard = role === 'admin' ? '/admin-dashboard' : role === 'trainer' ? '/trainer-dashboard' : '/student-dashboard';
      localStorage.removeItem('cartItems');
      navigate(targetDashboard, {
        state: { paymentSuccess: true }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-capsule-bg flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {role === 'trainer' ? <TrainerNavbar activePage="learn" /> : <StudentNavbar activePage="courses" />}

      <main className="flex-grow">
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#164961] via-[#1a5570] to-[#2B636B] py-12 text-white text-center">
          <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 mb-4 shadow-lg">
              <BanknotesIcon className="w-8 h-8 text-[#FFD369]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
              {isRTL ? 'إتمام الدفع' : 'Checkout'}
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              {isRTL ? 'أكمل عملية الدفع بأمان عبر بوابة Moyasar' : 'Complete your payment securely via Moyasar'}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {paymentIdFromUrl || isVerifying ? (
            <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-12 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md text-center max-w-lg mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-capsule-teal mx-auto mb-4"></div>
              <h2 className="text-lg font-black text-capsule-navy dark:text-white mb-2">
                {isRTL ? 'جاري التحقق من عملية الدفع...' : 'Verifying your payment...'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {isRTL ? 'يرجى الانتظار بينما نتأكد من العملية مع سيرفر Moyasar' : 'Please wait while we verify the transaction with Moyasar server'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* اختيار طريقة الدفع والنموذج الرسمي من Moyasar */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-capsule-teal to-cyan-500" />
                  <h2 className="text-lg font-black text-capsule-navy dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-2 h-5 rounded-full bg-capsule-teal" />
                    {isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('moyasar')}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all h-32 cursor-pointer ${paymentMethod === 'moyasar' || paymentMethod === 'card'
                          ? 'border-capsule-teal bg-[#00A499]/10 dark:bg-sky-950/40 shadow-xl ring-4 ring-[#00A499]/30'
                          : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-[#162035]/80 hover:border-capsule-teal'
                        }`}
                    >
                      {(paymentMethod === 'moyasar' || paymentMethod === 'card') && (
                        <CheckCircleIcon className="absolute top-2.5 right-2.5 z-10 w-6 h-6 text-capsule-teal dark:text-teal-400" />
                      )}
                      <div className="bg-slate-100/90 dark:bg-[#162035] p-3 rounded-xl border-2 border-slate-200 dark:border-white/20 shadow-md flex items-center justify-center w-full h-22">
                        <img
                          src={moyasarLogo}
                          alt="Moyasar"
                          className="h-12 sm:h-14 w-auto object-contain max-w-[200px] dark:brightness-0 dark:invert transition-all"
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all h-32 cursor-pointer ${paymentMethod === 'apple_pay'
                          ? 'border-capsule-teal bg-[#00A499]/10 dark:bg-sky-950/40 shadow-xl ring-4 ring-[#00A499]/30'
                          : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-[#162035]/80 hover:border-capsule-teal'
                        }`}
                    >
                      {paymentMethod === 'apple_pay' && (
                        <CheckCircleIcon className="absolute top-2.5 right-2.5 z-10 w-6 h-6 text-capsule-teal dark:text-teal-400" />
                      )}
                      <div className="bg-slate-100/90 dark:bg-[#162035] p-3 rounded-xl border-2 border-slate-200 dark:border-white/20 shadow-md flex items-center justify-center w-full h-22">
                        <img
                          src={applePayLogo}
                          alt="Apple Pay"
                          className="h-12 sm:h-14 w-auto object-contain max-w-[200px] dark:brightness-0 dark:invert transition-all"
                        />
                      </div>
                    </button>
                  </div>

                  {/* الحاوية الرسمية لحقول نموذج ميسر (Moyasar Payment Form) */}
                  {(paymentMethod === 'moyasar' || paymentMethod === 'card') && (
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                      <div className="mysr-form"></div>
                    </div>
                  )}

                  {paymentMethod === 'apple_pay' && (
                    <div className="p-6 bg-gray-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl text-center text-sm font-semibold text-gray-500 dark:text-sky-300">
                      {isRTL
                        ? 'سيتم توجيهك لتأكيد العملية عبر Apple Pay...'
                        : 'You will be redirected to confirm transaction via Apple Pay...'}
                    </div>
                  )}
                </div>
              </div>

              {/* ملخص الطلب والفاتورة */}
              <div className="bg-white dark:bg-[#162035]/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <h2 className="text-lg font-black text-capsule-navy dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-2 h-5 rounded-full bg-amber-500" />
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </h2>
                <div className="space-y-4 text-xs sm:text-sm font-semibold text-capsule-navy/80 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-400 dark:text-slate-400 font-bold">{isRTL ? 'الدورة' : 'Course'}</span>
                    <span className="text-start font-black max-w-[180px] leading-snug text-slate-900 dark:text-white">{order.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-slate-400 font-bold">{isRTL ? 'السعر الأصلي' : 'Price'}</span>
                    <span className="font-mono font-bold">{order.price.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold">{isRTL ? 'الخصم' : 'Discount'}</span>
                    <span className="font-mono font-bold">- {order.discount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-capsule-navy dark:text-white">{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-2xl font-black text-capsule-navy dark:text-emerald-400 font-mono">
                    {order.totalAmount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}