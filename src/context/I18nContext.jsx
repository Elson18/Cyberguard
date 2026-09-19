import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTranslations } from '../services/api';

const STORAGE_KEY = 'ng_lang';

export const LANGUAGE_NAMES = {
  en: 'English', ta: 'தமிழ் (Tamil)', hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)', kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)',
  bn: 'বাংলা (Bengali)', mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)', or: 'ଓଡ଼ିଆ (Odia)',
  es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português',
  ar: 'العربية', ja: '日本語', ko: '한국어', zh: '中文',
};

export const INDIAN_LANGS = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or'];
export const INTL_LANGS = ['es', 'fr', 'de', 'pt', 'ar', 'ja', 'ko', 'zh'];
export const RTL_LANGS = ['ar'];

const FALLBACK_TRANSLATIONS = {
  nav_dashboard: 'Dashboard',
  nav_extension: 'Download Extension',
  nav_complaint: 'File Complaint',
  nav_settings: 'Settings',
  sidebar_status: 'SYSTEM ACTIVE',
  sidebar_new_session: '+ New Session',
  sidebar_system_status: 'System Status',
  sidebar_rag: 'RAG Engine',
  sidebar_online: '● Online',
  sidebar_ai: 'AI Model',
  sidebar_active: '● Active',
  sidebar_threatdb: 'Threat DB',
  sidebar_synced: '● Synced',
  btn_exit: 'Exit',
  chat_title: 'Cyber Incident Assistant',
  chat_subtitle: 'Secure end-to-end session · All data encrypted',
  chat_extension_btn: 'Extension',
  chat_ai_tag: 'AI Powered',
  chat_empty: 'Start a conversation to get expert cyber support',
  chat_placeholder: 'Describe your incident or ask a question…',
  chat_complaint_btn: '🛡️ File Cyber Complaint',
  chat_success: '✅ Your cyber complaint has been submitted successfully. Our cyber team will contact you shortly.',
  settings_title: 'Security Settings',
  settings_subtitle: 'Manage your profile, notifications, and security preferences.',
};

const TRANSLATION_MAP = {
  ta: {
    nav_dashboard: 'முகப்புப் பலகை (Dashboard)',
    nav_extension: 'நீட்டிப்பு பதிவிறக்கம் (Extension)',
    nav_complaint: 'புகார் பதிவு (File Complaint)',
    nav_settings: 'அமைப்புகள் (Settings)',
    sidebar_status: 'அமைப்பு இயங்குகிறது',
    sidebar_new_session: '+ புதிய உரையாடல்',
    sidebar_system_status: 'அமைப்பு நிலை',
    sidebar_rag: 'ஆர்.ஏ.ஜி எஞ்சின்',
    sidebar_online: '● ஆன்லைன்',
    sidebar_ai: 'ஏ.ஐ மாடல்',
    sidebar_active: '● செயலில்',
    sidebar_threatdb: 'அச்சுறுத்தல் தரவுத்தளம்',
    sidebar_synced: '● ஒத்திசைக்கப்பட்டது',
    btn_exit: 'வெளியேறு',
    chat_title: 'சைபர் சம்பவ உதவி மையம்',
    chat_subtitle: 'பாதுகாப்பான மற்றும் மறைகுறியாக்கப்பட்ட உரையாடல்',
    chat_extension_btn: 'நீட்டிப்பு',
    chat_ai_tag: 'ஏ.ஐ இயங்கும் திறன்',
    chat_empty: 'நிபுணர் சைபர் ஆதரவைப் பெற உரையாடலைத் தொடங்குங்கள்',
    chat_placeholder: 'உங்கள் சம்பவத்தை விவரிக்கவும் அல்லது கேள்வி கேட்கவும்…',
    chat_complaint_btn: '🛡️ சைபர் புகார் பதிவு செய்க',
    chat_success: '✅ உங்கள் சைபர் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. எங்கள் சைபர் குழு விரைவில் உங்களைத் தொடர்பு கொள்ளும்.',
    settings_title: 'பாதுகாப்பு அமைப்புகள்',
    settings_subtitle: 'உங்கள் சுயவிவரம், அறிவிப்புகள் மற்றும் பாதுகாப்பு விருப்பங்களை நிர்வகிக்கவும்.',
  },
  hi: {
    nav_dashboard: 'डैशबोर्ड (Dashboard)',
    nav_extension: 'एक्सटेंशन डाउनलोड',
    nav_complaint: 'शिकायत दर्ज करें',
    nav_settings: 'सेटिंग्स',
    sidebar_status: 'सिस्टम सक्रिय',
    sidebar_new_session: '+ नया सत्र',
    sidebar_system_status: 'सिस्टम स्थिति',
    sidebar_rag: 'आरएजी इंजन',
    sidebar_online: '● ऑनलाइन',
    sidebar_ai: 'एआई मॉडल',
    sidebar_active: '● सक्रिय',
    sidebar_threatdb: 'खतरा डेटाबेस',
    sidebar_synced: '● सिंक्रनाइज़',
    btn_exit: 'बाहर निकलें',
    chat_title: 'साइबर घटना सहायक',
    chat_subtitle: 'सुरक्षित अंत-से-अंत सत्र · सभी डेटा एन्क्रिप्टेड',
    chat_extension_btn: 'एक्सटेंशन',
    chat_ai_tag: 'एआई संचालित',
    chat_empty: 'विशेषज्ञ साइबर सहायता प्राप्त करने के लिए बातचीत शुरू करें',
    chat_placeholder: 'अपनी घटना का वर्णन करें या प्रश्न पूछें…',
    chat_complaint_btn: '🛡️ साइबर शिकायत दर्ज करें',
    chat_success: '✅ आपकी साइबर शिकायत सफलतापूर्वक दर्ज कर ली गई है। हमारी साइबर टीम जल्द ही आपसे संपर्क करेगी।',
    settings_title: 'सुरक्षा सेटिंग्स',
    settings_subtitle: 'अपनी प्रोफ़ाइल, सूचनाएं और सुरक्षा प्राथमिकताओं को प्रबंधित करें।',
  },
  te: {
    nav_dashboard: 'డాష్‌బోర్డ్ (Dashboard)',
    nav_extension: 'ఎక్స్‌టెన్షన్ డౌన్‌లోడ్',
    nav_complaint: 'ఫిర్యాదు చేయండి',
    nav_settings: 'సెట్టింగ్‌లు',
    sidebar_status: 'సిస్టమ్ సక్రియంగా ఉంది',
    sidebar_new_session: '+ కొత్త సెషన్',
    sidebar_system_status: 'సిస్టమ్ స్థితి',
    sidebar_rag: 'RAG ఇంజిన్',
    sidebar_online: '● ఆన్‌లైన్',
    sidebar_ai: 'AI మోడల్',
    sidebar_active: '● సక్రియం',
    sidebar_threatdb: 'బెదిరింపు డేటాబేస్',
    sidebar_synced: '● సింక్ చేయబడింది',
    btn_exit: 'నిష్క్రమించు',
    chat_title: 'సైబర్ ఘటన సహాయకుడు',
    chat_subtitle: 'సురక్షితమైన సంభాషణ · డేటా ఎన్‌క్రిప్ట్ చేయబడింది',
    chat_extension_btn: 'ఎక్స్‌టెన్షన్',
    chat_ai_tag: 'AI ఆధారితం',
    chat_empty: 'సైబర్ నిపుణుల మద్దతు కోసం సంభాషణను ప్రారంభించండి',
    chat_placeholder: 'మీ ఘటనను వివరించండి లేదా ప్రశ్న అడగండి…',
    chat_complaint_btn: '🛡️ సైబర్ ఫిర్యాదు నమోదు చేయండి',
    settings_title: 'భద్రతా సెట్టింగ్‌లు',
  },
  kn: {
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_extension: 'ಎಕ್ಸ್‌ಟೆನ್ಶನ್ ಡೌನ್‌ಲೋಡ್',
    nav_complaint: 'ದೂರು ಸಲ್ಲಿಸಿ',
    nav_settings: 'ಸಂಯೋಜನೆಗಳು',
    sidebar_status: 'ಸಿಸ್ಟಮ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    sidebar_new_session: '+ ಹೊಸ ಅಧಿವೇಶನ',
    btn_exit: 'ನಿರ್ಗಮಿಸಿ',
    chat_title: 'ಸೈಬರ್ ಘಟನೆ ಸಹಾಯಕ',
    chat_placeholder: 'ನಿಮ್ಮ ಘಟನೆಯನ್ನು ವಿವರಿಸಿ ಅಥವಾ ಪ್ರಶ್ನೆ ಕೇಳಿ…',
    chat_complaint_btn: '🛡️ ಸೈಬರ್ ದೂರು ಸಲ್ಲಿಸಿ',
    settings_title: 'ಭದ್ರತಾ ಸಂಯೋಜನೆಗಳು',
  },
  ml: {
    nav_dashboard: 'ഡാഷ്ബോർഡ്',
    nav_extension: 'എക്സ്റ്റൻഷൻ ഡൗൺലോഡ്',
    nav_complaint: 'പരാതി നൽകുക',
    nav_settings: 'ക്രമീകരണങ്ങൾ',
    sidebar_status: 'സിസ്റ്റം സജീവമാണ്',
    sidebar_new_session: '+ പുതിയ സെഷൻ',
    btn_exit: 'പുറത്തുകടക്കുക',
    chat_title: 'സൈബർ ഇൻസിഡന്റ് അസിസ്റ്റന്റ്',
    chat_placeholder: 'നിങ്ങളുടെ സംഭവം വിവരിക്കുക അല്ലെങ്കിൽ ചോദ്യം ചോദിക്കുക…',
    chat_complaint_btn: '🛡️ സൈബർ പരാതി നൽകുക',
    settings_title: 'സുരക്ഷാ ക്രമീകരണങ്ങൾ',
  },
  es: {
    nav_dashboard: 'Panel de Control',
    nav_extension: 'Descargar Extensión',
    nav_complaint: 'Presentar Denuncia',
    nav_settings: 'Configuración',
    sidebar_status: 'SISTEMA ACTIVO',
    sidebar_new_session: '+ Nueva Sesión',
    btn_exit: 'Salir',
    chat_title: 'Asistente de Incidentes Cibernéticos',
    chat_subtitle: 'Sesión segura cifrada de extremo a extremo',
    chat_placeholder: 'Describe tu incidente o haz una pregunta…',
    chat_complaint_btn: '🛡️ Presentar Denuncia Cibernética',
    settings_title: 'Configuración de Seguridad',
  },
  fr: {
    nav_dashboard: 'Tableau de bord',
    nav_extension: 'Télécharger l\'extension',
    nav_complaint: 'Déposer une plainte',
    nav_settings: 'Paramètres',
    sidebar_status: 'SYSTÈME ACTIF',
    sidebar_new_session: '+ Nouvelle session',
    btn_exit: 'Quitter',
    chat_title: 'Assistant Incidents Cyber',
    chat_subtitle: 'Session sécurisée et cryptée',
    chat_placeholder: 'Décrivez votre incident ou posez une question…',
    chat_complaint_btn: '🛡️ Déposer une plainte cyber',
    settings_title: 'Paramètres de sécurité',
  },
  ar: {
    nav_dashboard: 'لوحة التحكم',
    nav_extension: 'تحميل الامتداد',
    nav_complaint: 'تقديم شكوى',
    nav_settings: 'الإعدادات',
    sidebar_status: 'النظام نشط',
    sidebar_new_session: '+ جلسة جديدة',
    btn_exit: 'خروج',
    chat_title: 'مساعد الحوادث السيبرانية',
    chat_subtitle: 'جلسة آمنة ومشفّرة بالكامل',
    chat_placeholder: 'صف الحادث أو اطرح سؤالاً…',
    chat_complaint_btn: '🛡️ تقديم شكوى سيبرانية',
    settings_title: 'إعدادات الأمان',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');
  const [translations, setTranslations] = useState(() => ({
    ...FALLBACK_TRANSLATIONS,
    ...(TRANSLATION_MAP[lang] || {}),
  }));

  useEffect(() => {
    let isMounted = true;
    const mapDict = TRANSLATION_MAP[lang] || {};
    setTranslations({ ...FALLBACK_TRANSLATIONS, ...mapDict });

    fetchTranslations(lang).then((fetched) => {
      if (isMounted && fetched && Object.keys(fetched).length > 0) {
        setTranslations((prev) => ({ ...prev, ...fetched }));
      }
    });

    if (RTL_LANGS.includes(lang)) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', lang);

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const setLanguage = (langCode) => {
    if (LANGUAGE_NAMES[langCode]) {
      setLangState(langCode);
      localStorage.setItem(STORAGE_KEY, langCode);
    }
  };

  const t = (key, fallbackText) => {
    return translations[key] || fallbackText || FALLBACK_TRANSLATIONS[key] || key;
  };

  const getLanguageName = (code = lang) => {
    return LANGUAGE_NAMES[code] || code;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t, getLanguageName }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
