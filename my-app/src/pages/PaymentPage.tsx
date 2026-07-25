import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import StudentNavbar from '../components/StudentNavbar';
import TrainerNavbar from '../components/TrainerNavbar';
import Footer from '../components/Footer';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

// 🔄 استيراد شعارات وسائل الدفع من مجلد assets
// @ts-ignore
import applePayLogo from '../assets/ApplePay.png';
// @ts-ignore
import moyasarLogo from '../assets/Moyassar.png';

// ==========================================
// 1. تعريف واجهات البيانات (TypeScript Interfaces)
// ==========================================

// واجهة تصف كائن الطلب (الفاتورة) القادم من سلة المشتريات
interface OrderDetails {
  courseName: string;
  trainer: string;
  price: number;
  discount: number;
  totalAmount: number;
  courseIds?: number[];
}

// واجهة تحدد شكل الأخطاء المحتملة لحقول إدخال بيانات البطاقة الائتمانية
interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

// واجهة تضمن كتابة وتعريف جميع النصوص والترجمات بدون أي نقص أو خطأ إملائي في المفاتيح
interface TranslationContent {
  title: string; subtitle: string; methodTitle: string; orderSummary: string; course: string; instructor: string;
  originalPrice: string; discount: string; tax: string; total: string; payBtn: string; cardHolder: string;
  cardHolderPlaceholder: string; cardNumber: string; expiry: string; cvv: string; successMsg: string;
  creditCard: string; cardDetailsHeader: string; currency: string; redirectApplePay: string; redirectMoyasar: string;
  errHolderRequired: string; errCardRequired: string; errCardLength: string; errExpiryRequired: string;
  errExpiryFormat: string; errCvvRequired: string; errCvvLength: string;
}

// تحديد خيارات طرق الدفع المتاحة لتقييد الـ State وحمايتها من القيم العشوائية
type PaymentMethod = 'card' | 'apple_pay' | 'moyasar';


// ==========================================
// 2. المكون البرمجي الرئيسي لصفحة الدفع
// ==========================================
export default function Payment() {
  // جلب اللغة الحالية (ar / en) لتحديد اتجاه الصفحة (RTL / LTR)
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isRTL = lang === 'ar';

  // استقبال تفاصيل الطلب من الـ Router مع وضع قيم افتراضية آمنة لمنع توقف الصفحة عند الدخول المباشر
  const order = (location.state as OrderDetails | null) || {
    courseName: "Full-Stack Generative AI & Digital Transformation Bootcamp",
    trainer: "Ahmed Mohammed",
    price: 450.00,
    discount: 200.00,
    totalAmount: 250.00
  };

  // تعريف حالات المدخلات (React States) بأنواع صريحة لتفادي الـ static analysis errors
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  // كائن الترجمة ثنائي اللغة المعرف بالكامل بناءً على واجهة TranslationContent
  const translations: Record<'ar' | 'en', TranslationContent> = {
    ar: { 
      title: 'إتمام الدفع', subtitle: 'أكمل عملية الدفع بأمان لحجز مقعدك', methodTitle: 'اختر طريقة الدفع', 
      orderSummary: 'ملخص الطلب', course: 'الدورة', instructor: 'المدرب', originalPrice: 'السعر الأصلي', 
      discount: 'الخصم', tax: 'ضريبة القيمة المضافة (15%)', total: 'الإجمالي', payBtn: 'إتمام الدفع بأمان', 
      cardHolder: 'اسم حامل البطاقة', cardHolderPlaceholder: 'الاسم كما يظهر على البطاقة',
      cardNumber: 'رقم البطاقة', expiry: 'تاريخ الانتهاء', cvv: 'رمز التحقق (CVV)', successMsg: 'شكراً لك! تم الدفع بنجاح.',
      creditCard: 'بطاقة ائتمانية', cardDetailsHeader: 'بيانات البطاقة', currency: 'ر.س',
      redirectApplePay: 'سيتم توجيهك بأمان لتأكيد عمليتك عبر Apple Pay عند الضغط على زر الدفع بالأسفل.',
      redirectMoyasar: 'سيتم توجيهك بأمان لتأكيد عمليتك عبر بوابة ميسر عند الضغط على زر الدفع بالأسفل.',
      errHolderRequired: 'يجب إدخال اسم حامل البطاقة المكتوب عليها.', errCardRequired: 'يجب إدخال رقم البطاقة الائتمانية.',
      errCardLength: 'يجب أن يتكون رقم البطاقة من 16 رقماً.', errExpiryRequired: 'يجب إدخال تاريخ انتهاء صلاحية البطاقة.',
      errExpiryFormat: 'صيغة التاريخ غير صحيحة، يجب أن تكون MM/YY (مثال: 12/28).',
      errCvvRequired: 'يجب إدخال رمز التحقق الخلفي للبطاقة.', errCvvLength: 'يجب أن يتكون رمز التحقق من 3 أرقام.'
    },
    en: { 
      title: 'Checkout', subtitle: 'Complete your payment securely to secure your spot', methodTitle: 'Select Payment Method', 
      orderSummary: 'Order Summary', course: 'Course', instructor: 'Instructor', originalPrice: 'Original Price', 
      discount: 'Discount', tax: 'VAT (15%)', total: 'Total Amount', payBtn: 'Complete Secure Payment', 
      cardHolder: 'Cardholder Name', cardHolderPlaceholder: 'Name as it appears on the card',
      cardNumber: 'Card Number', expiry: 'Expiry Date', cvv: 'CVV', successMsg: 'Thank you! Payment successful.',
      creditCard: 'Credit Card', cardDetailsHeader: 'Card Details', currency: 'SAR',
      redirectApplePay: 'You will be securely redirected to confirm your transaction via Apple Pay when you click the button below.',
      redirectMoyasar: 'You will be securely redirected to confirm your transaction via Moyasar when you click the button below.',
      errHolderRequired: 'Cardholder name is required.', errCardRequired: 'Card number is required.',
      errCardLength: 'Card number must be exactly 16 digits.', errExpiryRequired: 'Expiry date is required.',
      errExpiryFormat: 'Expiry format must be MM/YY (e.g., 12/28).', errCvvRequired: 'CVV is required.',
      errCvvLength: 'CVV must be exactly 3 digits.'
    }
  };

  // اختيار الترجمة النشطة بناءً على لغة واجهة المستخدم الحالية
  const t: TranslationContent = translations[lang as 'ar' | 'en'] || translations['ar'];

  // ==========================================
  // 3. دوال تنسيق ومعالجة حقول الإدخال (Formatters)
  // ==========================================

  // تنسيق رقم البطاقة تلقائياً بوضع فراغ بعد كل 4 أرقام لمنع تشتت المستخدم (مثال: 1234 5678 9012 3456)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    setCardNumber(value.replace(/(\d{4})(?=\d)/g, '$1 '));
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
  };

  // تنسيق تاريخ الانتهاء تلقائياً بوضع علامة "/" المائلة بعد الشهر مباشرة (مثال: 12/28)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    setExpiryDate(value);
    if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
  };

  // تقييد رمز التحقق (CVV) ليكون أرقاماً فقط ولا يتجاوز الـ 3 أرقام
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
  };

  // ==========================================
  // 4. التحقق البرمجي ومعالجة العملية (Validation)
  // ==========================================

  // دالة التحقق من شروط وصلاحية بيانات البطاقة قبل تفعيل الدفع
  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    if (paymentMethod === 'card') {
      if (!cardholderName.trim()) tempErrors.cardholderName = 'errHolderRequired';
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (!cleanCard) tempErrors.cardNumber = 'errCardRequired';
      else if (cleanCard.length !== 16) tempErrors.cardNumber = 'errCardLength';
      if (!expiryDate) tempErrors.expiryDate = 'errExpiryRequired';
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) tempErrors.expiryDate = 'errExpiryFormat';
      if (!cvv) tempErrors.cvv = 'errCvvRequired';
      else if (cvv.length !== 3) tempErrors.cvv = 'errCvvLength';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // دالة زر الدفع النهائي: تمسح محتويات سلة المشتريات من الذاكرة المحلية وتوجّه الطالب لصفحة الكورسات بعد نجاح الدفع
  const handlePaymentSubmit = async (): Promise<void> => {
    if (paymentMethod !== 'card' || validateForm()) {
      // 🎟️ تسجيل الطالب فعلياً بكل كورس بالسلة بعد نجاح الدفع
      const token = localStorage.getItem('user_token');
      if (order.courseIds?.length && token) {
        await Promise.allSettled(
          order.courseIds.map((courseId) =>
            fetch(`http://localhost:5000/api/student/courses/${courseId}/purchase`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      // 📚 نحفظ نسخة محلية من كل كورس بالسلة (وهمي أو حقيقي) عشان يبين بـ"دوراتي"
      // حتى لو الكورس وهمي وما يعرفه الباك اند أصلاً
      try {
        const cartItems: { id: number; title: string; category: string; duration: string }[] =
          JSON.parse(localStorage.getItem('cartItems') || '[]');
        const purchasedCourses: { id: number; title: string; category: string; duration: string; progress: number; status: string }[] =
          JSON.parse(localStorage.getItem('purchasedCourses') || '[]');

        cartItems.forEach((item) => {
          if (!purchasedCourses.some((p) => p.id === item.id)) {
            purchasedCourses.push({
              id: item.id,
              title: item.title,
              category: item.category,
              duration: item.duration,
              progress: 0,
              status: 'Active',
            });
          }
        });

        localStorage.setItem('purchasedCourses', JSON.stringify(purchasedCourses));
      } catch {
        // تجاهل أي خطأ بقراءة/كتابة التخزين المحلي — ما يوقف عملية الدفع
      }

      alert(t.successMsg);
      localStorage.removeItem('cartItems'); // تفريغ السلة لضمان عدم تكرار الفاتورة
      navigate(role === 'trainer' ? '/trainer-dashboard' : '/student-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-capsule-bg flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* شريط الملاحة العلوي للمتعلم */}
      {role === 'trainer' ? (
        <TrainerNavbar activePage="learn" />
      ) : (
        <StudentNavbar activePage="courses" />
      )}
      
      <main className="flex-grow">
        {/* هيدر الصفحة بتصميم مموج وتدرج لوني يعكس الاحترافية */}
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#164961] via-[#1a5570] to-[#2B636B] py-12 text-white text-center">
          <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 mb-4 shadow-lg">
              <BanknotesIcon className="w-8 h-8 text-[#FFD369]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">{t.title}</h1>
            <p className="text-sm sm:text-base text-white/80">{t.subtitle}</p>
          </div>
        </section>

        {/* جسم الصفحة المقسم شبكياً إلى عمودين (النموذج يمين/يسار والفاتورة على الجانب الآخر) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* العمود الأكبر: اختيار وسيلة الدفع وإدخال البيانات */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-capsule-teal to-cyan-500" />
                <h2 className="text-lg font-black text-capsule-navy mb-6 flex items-center gap-3">
                  <span className="w-2 h-5 rounded-full bg-capsule-teal" />
                  {t.methodTitle}
                </h2>
                
                {/* شبكة الأزرار للتبديل بين وسائل الدفع المتاحة */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* الدفع بالبطاقة الائتمانية */}
                  <button onClick={() => setPaymentMethod('card')} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-24 sm:h-28 ${paymentMethod === 'card' ? 'border-capsule-teal bg-capsule-bg/30 text-capsule-navy shadow-xs font-bold' : 'border-gray-100 hover:border-gray-200 text-gray-500 font-medium'}`}>
                    {paymentMethod === 'card' && <CheckCircleIcon className="absolute top-2 left-2 w-5 h-5 text-capsule-teal" />}
                    <CreditCardIcon className="w-8 h-8 mb-2 text-capsule-teal stroke-[2]" />
                    <span className="text-sm font-black">{t.creditCard}</span>
                  </button>

                  {/* الدفع عبر Apple Pay */}
                  <button onClick={() => setPaymentMethod('apple_pay')} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all h-24 sm:h-28 ${paymentMethod === 'apple_pay' ? 'border-capsule-teal bg-capsule-bg/30 shadow-xs' : 'border-gray-100 hover:border-gray-200'}`}>
                    {paymentMethod === 'apple_pay' && <CheckCircleIcon className="absolute top-2 left-2 w-5 h-5 text-capsule-teal" />}
                    <div className="flex items-center justify-center w-full h-full"><img src={applePayLogo} alt="Apple Pay" className="h-14 sm:h-16 w-auto object-contain flex-shrink-0" /></div>
                  </button>

                  {/* الدفع عبر بوابة ميسر Moyasar */}
                  <button onClick={() => setPaymentMethod('moyasar')} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all h-24 sm:h-28 ${paymentMethod === 'moyasar' ? 'border-capsule-teal bg-capsule-bg/30 shadow-xs' : 'border-gray-100 hover:border-gray-200'}`}>
                    {paymentMethod === 'moyasar' && <CheckCircleIcon className="absolute top-2 left-2 w-5 h-5 text-capsule-teal" />}
                    <div className="flex items-center justify-center w-full h-full"><img src={moyasarLogo} alt="Moyasar" className="h-13 sm:h-15 w-auto object-contain flex-shrink-0" /></div>
                  </button>
                </div>
              </div>

              {/* فورم البطاقة الائتمانية: يظهر بشكل مشروط وتفاعلي فقط في حالة اختيار البطاقة الائتمانية */}
              {paymentMethod === 'card' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                  <h2 className="text-lg font-black text-capsule-navy mb-6 flex items-center gap-3"><span className="w-2 h-5 rounded-full bg-purple-500" />{t.cardDetailsHeader}</h2>
                  <div className="space-y-4">
                    {/* حقل اسم حامل البطاقة مع إظهار الخطأ المترجم فورياً عند حدوثه */}
                    <div>
                      <label className="block text-xs font-bold text-capsule-navy/70 mb-1">{t.cardHolder}</label>
                      <input type="text" value={cardholderName} onChange={(e) => { setCardholderName(e.target.value); if (errors.cardholderName) setErrors(prev => ({ ...prev, cardholderName: '' })); }} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ${errors.cardholderName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-capsule-teal/40'}`} placeholder={t.cardHolderPlaceholder} />
                      {errors.cardholderName && <p className="text-red-500 text-xs mt-1 font-semibold">{t[errors.cardholderName as keyof TranslationContent]}</p>}
                    </div>
                    {/* حقل رقم البطاقة الائتمانية (16 رقم) */}
                    <div>
                      <label className="block text-xs font-bold text-capsule-navy/70 mb-1">{t.cardNumber}</label>
                      <input type="text" value={cardNumber} onChange={handleCardNumberChange} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ${errors.cardNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-capsule-teal/40'}`} placeholder="1234 5678 9101 1121" />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{t[errors.cardNumber as keyof TranslationContent]}</p>}
                    </div>
                    {/* حقول تاريخ الصلاحية ورمز الأمان جنباً إلى جنب */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-capsule-navy/70 mb-1">{t.expiry}</label>
                        <input type="text" value={expiryDate} onChange={handleExpiryChange} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ${errors.expiryDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-capsule-teal/40'}`} placeholder="MM/YY" />
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1 font-semibold">{t[errors.expiryDate as keyof TranslationContent]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-capsule-navy/70 mb-1">{t.cvv}</label>
                        <input type="password" value={cvv} onChange={handleCvvChange} className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ${errors.cvv ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-capsule-teal/40'}`} placeholder="123" />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1 font-semibold">{t[errors.cvv as keyof TranslationContent]}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* إشعار توجيه خارجي ذكي يظهر فقط عند استخدام بوابات الدفع الإلكترونية السريعة */}
              {paymentMethod !== 'card' && (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-sm font-semibold text-gray-500">
                  {paymentMethod === 'apple_pay' ? t.redirectApplePay : t.redirectMoyasar}
                </div>
              )}
            </div>

            {/* العمود الأيسر (الجانبي): كشف الحساب وفاتورة ملخص الطلب مع التفاصيل المالية */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <h2 className="text-lg font-black text-capsule-navy mb-6 flex items-center gap-3"><span className="w-2 h-5 rounded-full bg-amber-500" />{t.orderSummary}</h2>
              <div className="space-y-4 text-xs sm:text-sm font-semibold text-capsule-navy/80 border-b border-gray-100 pb-5 mb-5">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-400 font-bold">{t.course}</span>
                  <span className="text-start font-black max-w-[180px] leading-snug">{order.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">{t.instructor}</span>
                  <span className="font-bold">{order.trainer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">{t.originalPrice}</span>
                  <span>{order.price.toFixed(2)} {t.currency}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span className="font-bold">{t.discount}</span>
                  <span>- {order.discount.toFixed(2)} {t.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">{t.tax}</span>
                  <span>{((order.totalAmount) * 0.15).toFixed(2)} {t.currency}</span>
                </div>
              </div>
              {/* إجمالي المبلغ النهائي المطلوب دفعه */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-black text-capsule-navy">{t.total}</span>
                <span className="text-2xl font-black text-capsule-navy">{(order.totalAmount).toFixed(2)} {t.currency}</span>
              </div>
              {/* زر تنفيذ عملية الدفع النهائي */}
              <button onClick={handlePaymentSubmit} className="w-full bg-gradient-to-r from-capsule-navy to-[#2B636B] text-white font-black py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-400" />
                {t.payBtn}
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* فوتر الموقع السفلي */}
      <Footer />
    </div>
  );
}