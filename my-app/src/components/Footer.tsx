import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from "react-router-dom";

function Footer(): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <footer
      dir={t.dir}
      className="bg-capsule-footer text-white pt-12 pb-6 px-8 mt-24 border-t border-capsule-teal/20 font-sans"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm pb-8 border-b border-white/10">

        <div>
          <h3 className="text-base font-black mb-3">🚀 {t.brand}</h3>
          <p className="text-gray-300 text-xs leading-relaxed">
            {t.footer.desc}
          </p>
        </div>

        <ul className="space-y-2 text-xs text-gray-300">
          <li><Link to="/" className="hover:text-capsule-gold transition">{t.footer.home}</Link></li>
          <li><Link to="/courses-overview" className="hover:text-capsule-gold transition">{t.footer.courses}</Link></li>
          <li><Link to="/contact" className="hover:text-capsule-gold transition">{t.footer.howItWorks}</Link></li>
          <li><Link to="/contact" className="hover:text-capsule-gold transition">{t.footer.contact}</Link></li>
        </ul>

        <div>
          <h4 className="font-bold mb-4 text-capsule-gold text-xs uppercase tracking-wider">
            {t.footer.social}
          </h4>

          <div className="flex items-center gap-5">

            <a
              href="https://www.instagram.com/capsuletahawul?igsh=ZnFmd3pxM2F5bzN3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-capsule-gold transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@capsuletahawul?lang=en&is_from_webapp=1&sender_device=mobile&sender_web_id=7657179049954002450"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-white hover:text-capsule-gold transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
            </a>

            <a
              href="https://x.com/capsuletahawul?s=11&t=fYzcMtPj7OPbeNGsLKnX6g"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-white hover:text-capsule-gold transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/company/capsule-tahawu-initiative/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white hover:text-capsule-gold transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

          </div>
        </div>

      </div>

      <div
        className={`max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center pt-6 text-xs text-gray-400 gap-4 ${
          t.dir === 'rtl' ? 'sm:flex-row' : 'sm:flex-row-reverse'
        }`}
      >
        <p>{t.footer.copyright1}</p>
        <p className="text-gray-500">{t.footer.copyright2}</p>
      </div>
    </footer>
  );
}

export default Footer;

