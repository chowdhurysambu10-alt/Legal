/**
 * Comprehensive Translations for Legal AI Assistant
 * Supported languages:
 *  - en: English
 *  - hi: हिन्दी (Hindi)
 *  - bn: বাংলা (Bengali)
 *  - es: Español (Spanish)
 *  - fr: Français (French)
 *  - de: Deutsch (German)
 *  - ar: العربية (Arabic)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const translations = {
  en: {
    // Header & Navigation
    backToWorkspace: 'Back to Workspace & History',
    analyzed: 'Analyzed',
    viewContract: 'View Contract',
    askAi: 'Ask AI',
    language: 'Language',
    selectLanguage: 'Select Language',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'Room Rental & Tenancy Deal Terms',
    employmentPackage: 'Employment Package & Compensation',
    confidentialityTerms: 'Confidentiality & Non-Disclosure Terms',
    servicesDealTerms: 'Services & Commercial Deal Terms',
    keyDealTerms: 'Key Deal Terms & Highlights',
    coreTermsIdentified: 'Core Terms Identified',
    keyRoomRentalTerms: 'Key Room Rental Terms & Financial Overview',
    employmentOverview: 'Employment Terms & Compensation Dashboard',
    confidentialityOverview: 'Confidentiality Scope & Governing Terms',
    servicesOverview: 'Commercial Services & Financial Terms',
    vitalContractHighlights: 'Vital Contract Highlights & Intelligence',
    showLess: 'Show Less',
    viewAll: 'View All',
    summary: 'Summary',
    clickToAsk: 'Click to ask AI about',

    // Deal Categories & Labels
    parties: 'PARTIES',
    financial: 'FINANCIAL',
    premises: 'PREMISES',
    timeline: 'TIMELINE',
    expensesUtilities: 'EXPENSES & UTILITIES',
    terms: 'TERMS',
    landlordName: 'LANDLORD NAME',
    tenantName: 'TENANT NAME',
    monthlyRent: 'MONTHLY RENT',
    securityDeposit: 'SECURITY DEPOSIT',
    propertyAddress: 'PROPERTY ADDRESS',
    leaseTerm: 'LEASE TERM',
    noticePeriod: 'NOTICE PERIOD',
    monthlyRoomRent: 'MONTHLY ROOM RENT',

    // Important Clauses
    importantClauses: 'Important Clauses',
    clausesAnalyzed: 'clauses analyzed',
    noHighRiskClauses: 'No High-Risk Clauses Flagged',
    noHighRiskDesc: 'This contract does not contain any detected high-risk liabilities, onerous indemnities, or unusual restrictions.',
    highRisk: 'HIGH RISK',
    mediumRisk: 'MEDIUM RISK',
    lowRisk: 'LOW RISK',
    whatItMeans: 'What it means',
    whyItMatters: 'Why it matters',
    affects: 'Affects',
    viewClause: 'View Clause',
    hideDetails: 'Hide Details',
    clauseOriginalText: 'Clause (Original Contract Text)',
    inSimpleWords: 'In Simple Words',
    source: 'Source',
    askAiAboutClause: 'Ask AI about this clause',

    // Chatbot Panel
    legalAiChatbot: 'Legal AI Chatbot',
    online: 'Online',
    clear: 'Clear',
    quickPrompts: 'Quick Prompts:',
    promptSayHi: '👋 Say Hi',
    promptRentDeposit: '💰 Rent & Deposit',
    promptLiabilities: '⚠️ Key Liabilities',
    promptNotice: '⏰ Notice & Termination',
    promptLaw: '📜 Governing Law',
    promptQSayHi: 'Hi! Can you introduce yourself and give me a brief overview of this document in my selected language?',
    promptQRent: 'What is the rent amount, due date, and security deposit terms in this agreement?',
    promptQLiabilities: 'What are my primary liability risks, penalties, and key obligations?',
    promptQNotice: 'What are the termination clauses, early exit fees, and notice periods?',
    promptQLaw: 'What is the governing law, dispute resolution mechanism, and jurisdiction?',
    helloAiIntro: "Hello! I'm your Legal AI Assistant.",
    helloAiDesc: 'I have analyzed this contract. Click a prompt above or ask any question in any language below!',
    you: 'You',
    assistantName: 'Legal AI Assistant',
    copy: 'Copy',
    copied: 'Copied',
    viewCitations: 'View verified clause citations',
    hideCitations: 'Hide verified clause citations',
    verifiedClause: 'Verified Clause',
    match: 'Match',
    thinking: 'Reviewing contract & drafting answer...',
    inputPlaceholder: 'Ask your Legal AI Assistant anything in any language...',
    ask: 'Ask',
    disclaimer: 'AI-assisted contract understanding. Not legal advice.',
    
    // Modal
    extractedVerbatim: 'Extracted verbatim text',
    pages: 'pages',
    indexedClauses: 'indexed clauses',
    closeContractText: 'Close Contract Text',
    noExtractedText: 'No extracted text available.',

    // Common Term translations
    months: 'months',
    daysWrittenNotice: '30 days written notice',
    dueNoticeHelper: 'Due on or before the 5th of each calendar month',
  },
  hi: {
    // Header & Navigation
    backToWorkspace: 'कार्यस्थान और इतिहास पर वापस जाएं',
    analyzed: 'विश्लेषित',
    viewContract: 'अनुबंध देखें',
    askAi: 'एआई से पूछें',
    language: 'भाषा',
    selectLanguage: 'भाषा चुनें',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'कमरा किराया और किरायेदारी नियम',
    employmentPackage: 'रोजगार पैकेज और मुआवजा',
    confidentialityTerms: 'गोपनीयता और प्रकटीकरण न करने की शर्तें',
    servicesDealTerms: 'सेवाएं और वाणिज्यिक सौदे की शर्तें',
    keyDealTerms: 'प्रमुख सौदे की शर्तें और मुख्य बिंदु',
    coreTermsIdentified: 'पहचाने गए मुख्य नियम',
    keyRoomRentalTerms: 'प्रमुख कमरा किराया शर्तें और वित्तीय विवरण',
    employmentOverview: 'रोजगार की शर्तें और मुआवजा डैशबोर्ड',
    confidentialityOverview: 'गोपनीयता का दायरा और नियंत्रण शर्तें',
    servicesOverview: 'वाणिज्यिक सेवाएं और वित्तीय शर्तें',
    vitalContractHighlights: 'महत्वपूर्ण अनुबंध मुख्य बिंदु और विश्लेषण',
    showLess: 'कम दिखाएं',
    viewAll: 'सभी देखें',
    summary: 'सारांश',
    clickToAsk: 'एआई से पूछने के लिए क्लिक करें',

    // Deal Categories & Labels
    parties: 'पक्षकार',
    financial: 'वित्तीय',
    premises: 'परिसर / पता',
    timeline: 'समय सीमा',
    expensesUtilities: 'खर्च और सुविधाएं',
    terms: 'नियम व शर्तें',
    landlordName: 'मकान मालिक का नाम',
    tenantName: 'किरायेदार का नाम',
    monthlyRent: 'मासिक किराया',
    securityDeposit: 'सुरक्षा जमा (सिक्योरिटी)',
    propertyAddress: 'संपत्ति का पता',
    leaseTerm: 'पट्टे / अनुबंध की अवधि',
    noticePeriod: 'नोटिस अवधि',
    monthlyRoomRent: 'मासिक कमरे का किराया',

    // Important Clauses
    importantClauses: 'महत्वपूर्ण धाराएं (Clauses)',
    clausesAnalyzed: 'धाराओं का विश्लेषण किया गया',
    noHighRiskClauses: 'कोई उच्च जोखिम वाली धारा नहीं मिली',
    noHighRiskDesc: 'इस अनुबंध में कोई खतरनाक देनदारी, भारी जुर्माना या असामान्य प्रतिबंध नहीं पाए गए हैं।',
    highRisk: 'उच्च जोखिम (HIGH RISK)',
    mediumRisk: 'मध्यम जोखिम (MEDIUM RISK)',
    lowRisk: 'कम जोखिम (LOW RISK)',
    whatItMeans: 'इसका क्या अर्थ है',
    whyItMatters: 'यह क्यों महत्वपूर्ण है',
    affects: 'किसे प्रभावित करता है',
    viewClause: 'धारा देखें',
    hideDetails: 'विवरण छिपाएं',
    clauseOriginalText: 'मूल अनुबंध पाठ (Original Text)',
    inSimpleWords: 'सरल शब्दों में',
    source: 'स्रोत संदर्भ',
    askAiAboutClause: 'इस धारा के बारे में AI से पूछें',

    // Chatbot Panel
    legalAiChatbot: 'कानूनी एआई चैटबॉट',
    online: 'सक्रिय (Online)',
    clear: 'साफ़ करें',
    quickPrompts: 'त्वरित प्रश्न:',
    promptSayHi: '👋 नमस्ते कहें',
    promptRentDeposit: '💰 किराया और जमा',
    promptLiabilities: '⚠️ मुख्य देनदारियां',
    promptNotice: '⏰ नोटिस और समाप्ति',
    promptLaw: '📜 लागू कानून',
    promptQSayHi: 'नमस्ते! कृपया हिंदी में अपना परिचय दें और इस अनुबंध का एक संक्षिप्त विवरण प्रस्तुत करें।',
    promptQRent: 'इस अनुबंध में किराए की राशि, भुगतान की अंतिम तिथि और सुरक्षा जमा के क्या नियम हैं?',
    promptQLiabilities: 'इस अनुबंध के तहत मेरी मुख्य देनदारियां, जिम्मेदारियां और जोखिम क्या हैं?',
    promptQNotice: 'अनुबंध समाप्त करने के नियम, नोटिस अवधि और समय से पहले बाहर निकलने की शर्तें क्या हैं?',
    promptQLaw: 'इस अनुबंध पर कौन सा कानून लागू होगा और किसी विवाद की स्थिति में क्या अधिकार क्षेत्र रहेगा?',
    helloAiIntro: 'नमस्ते! मैं आपका लीगल एआई सहायक हूं।',
    helloAiDesc: 'मैंने आपके अनुबंध का पूर्ण विश्लेषण कर लिया है। ऊपर दिए गए प्रश्नों पर क्लिक करें या नीचे अपनी भाषा में प्रश्न पूछें!',
    you: 'आप',
    assistantName: 'लीगल एआई सहायक',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया',
    viewCitations: 'सत्यापित उद्धरण (Citations) देखें',
    hideCitations: 'उद्धरण छिपाएं',
    verifiedClause: 'सत्यापित धारा',
    match: 'सटीकता',
    thinking: 'अनुबंध की समीक्षा और उत्तर तैयार किया जा रहा है...',
    inputPlaceholder: 'अपने लीगल एआई सहायक से हिंदी या किसी भी भाषा में पूछें...',
    ask: 'पूछें',
    disclaimer: 'एआई-सहायक अनुबंध विश्लेषण। यह कोई औपचारिक कानूनी सलाह नहीं है।',
    
    // Modal
    extractedVerbatim: 'निकाला गया मूल पाठ',
    pages: 'पृष्ठ',
    indexedClauses: 'अनुक्रमित धाराएं',
    closeContractText: 'अनुबंध पाठ बंद करें',
    noExtractedText: 'कोई निकाला गया पाठ उपलब्ध नहीं है।',

    months: 'महीने',
    daysWrittenNotice: '30 दिनों का लिखित नोटिस',
    dueNoticeHelper: 'प्रत्येक कैलेंडर माह की 5 तारीख को या उससे पहले देय',
  },
  bn: {
    // Header & Navigation
    backToWorkspace: 'ওয়ার্কস্পেস ও ইতিহাসে ফিরে যান',
    analyzed: 'বিশ্লেষিত',
    viewContract: 'চুক্তিপত্র দেখুন',
    askAi: 'এআই-কে জিজ্ঞাসা করুন',
    language: 'ভাষা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'রুম ভাড়া এবং ভাড়াটেকে শর্তাবলী',
    employmentPackage: 'চাকরির প্যাকেজ এবং ক্ষতিপূরণ',
    confidentialityTerms: 'গোপনীয়তা এবং অ-প্রকাশ শর্তাবলী',
    servicesDealTerms: 'পরিষেবা এবং বাণিজ্যিক চুক্তির শর্তাবলী',
    keyDealTerms: 'মূল চুক্তির শর্তাবলী ও হাইলাইটস',
    coreTermsIdentified: 'টি প্রধান শর্ত চিহ্নিত',
    keyRoomRentalTerms: 'রুম ভাড়ার মূল শর্তাবলী এবং আর্থিক সারসংক্ষেপ',
    employmentOverview: 'চাকরির শর্তাবলী ও ক্ষতিপূরণ ড্যাশবোর্ড',
    confidentialityOverview: 'গোপনীয়তার পরিধি এবং পরিচালনা শর্তাবলী',
    servicesOverview: 'বাণিজ্যিক পরিষেবা এবং আর্থিক শর্তাবলী',
    vitalContractHighlights: 'গুরুত্বপূর্ণ চুক্তি বিশ্লেষণ ও হাইলাইটস',
    showLess: 'সংক্ষিপ্ত করুন',
    viewAll: 'সবগুলো দেখুন',
    summary: 'সারসংক্ষেপ',
    clickToAsk: 'এআই-কে জিজ্ঞাসা করতে ক্লিক করুন',

    // Deal Categories & Labels
    parties: 'পক্ষসমূহ',
    financial: 'আর্থিক বিবরণ',
    premises: 'ঠিকানা / প্রাঙ্গণ',
    timeline: 'সময়সীমা',
    expensesUtilities: 'খরচ ও ইউটিলিটি',
    terms: 'শর্তাবলী',
    landlordName: 'বাড়িওয়ালার নাম',
    tenantName: 'ভাড়াটিয়ার নাম',
    monthlyRent: 'মাসিক ভাড়া',
    securityDeposit: 'সিকিউরিটি ডিপোজিট',
    propertyAddress: 'সম্পত্তির ঠিকানা',
    leaseTerm: 'চুক্তির মেয়াদ',
    noticePeriod: 'নোটিশের সময়সীমা',
    monthlyRoomRent: 'মাসিক রুমের ভাড়া',

    // Important Clauses
    importantClauses: 'গুরুত্বপূর্ণ ধারা (Clauses)',
    clausesAnalyzed: 'টি ধারা বিশ্লেষণ করা হয়েছে',
    noHighRiskClauses: 'কোনো উচ্চ ঝুঁকির ধারা পাওয়া যায়নি',
    noHighRiskDesc: 'এই চুক্তিতে কোনো মারাত্মক ঝুঁকি বা অপ্রয়োজনীয় জরিমানা ধারা নেই।',
    highRisk: 'উচ্চ ঝুঁকি (HIGH RISK)',
    mediumRisk: 'মাঝারি ঝুঁকি (MEDIUM RISK)',
    lowRisk: 'স্বল্প ঝুঁকি (LOW RISK)',
    whatItMeans: 'এর সহজ অর্থ',
    whyItMatters: 'কেন এটি গুরুত্বপূর্ণ',
    affects: 'কাকে প্রভাবিত করে',
    viewClause: 'ধারাটি দেখুন',
    hideDetails: 'লুকিয়ে রাখুন',
    clauseOriginalText: 'মূল চুক্তির পাঠ্য (Original Text)',
    inSimpleWords: 'সহজ ভাষায় ব্যাখ্যা',
    source: 'উৎস সূত্র',
    askAiAboutClause: 'এই ধারা সম্পর্কে এআই-কে জিজ্ঞাসা করুন',

    // Chatbot Panel
    legalAiChatbot: 'লিগ্যাল এআই চ্যাটবট',
    online: 'সক্রিয় (Online)',
    clear: 'মুছে ফেলুন',
    quickPrompts: 'দ্রুত প্রশ্নাবলী:',
    promptSayHi: '👋 শুভেচ্ছা জানান',
    promptRentDeposit: '💰 ভাড়া ও ডিপোজিট',
    promptLiabilities: '⚠️ প্রধান দায়বদ্ধতা',
    promptNotice: '⏰ নোটিশ ও চুক্তি বাতিল',
    promptLaw: '📜 প্রযোজ্য আইন',
    promptQSayHi: 'নমস্কার! দয়া করে বাংলায় সংক্ষেপে এই চুক্তির মূল বিষয়গুলো আমাকে বুঝিয়ে দিন।',
    promptQRent: 'এই চুক্তিতে ভাড়ার পরিমাণ, পরিশোধের তারিখ ও সিকিউরিটি ডিপোজিট সম্পর্কে কি বলা আছে?',
    promptQLiabilities: 'এই চুক্তির অধীনে আমার প্রধান ঝুঁকি ও দায়দায়িত্ব কী কী?',
    promptQNotice: 'চুক্তি বাতিলের নিয়ম ও নোটিশ পিরিয়ড কত দিনের?',
    promptQLaw: 'বিরোধ দেখা দিলে কোন আইন প্রযোজ্য হবে এবং বিচারিক এলাকা কোনটি?',
    helloAiIntro: 'নমস্কার! আমি আপনার লিগ্যাল এআই সহকারী।',
    helloAiDesc: 'আমি এই চুক্তিটি সম্পূর্ণ বিশ্লেষণ করেছি। যেকোনো প্রশ্ন বাংলায় বা অন্য ভাষায় জিজ্ঞাসা করুন!',
    you: 'আপনি',
    assistantName: 'লিগ্যাল এআই সহকারী',
    copy: 'কপি করুন',
    copied: 'কপি হয়েছে',
    viewCitations: 'যাচাইকৃত উদ্ধৃতি দেখুন',
    hideCitations: 'উদ্ধৃতি লুকান',
    verifiedClause: 'যাচাইকৃত ধারা',
    match: 'মিল',
    thinking: 'চুক্তিপত্র পর্যালোচনা ও উত্তর তৈরি হচ্ছে...',
    inputPlaceholder: 'আপনার লিগ্যাল এআই সহকারীকে বাংলায় যেকোনো প্রশ্ন করুন...',
    ask: 'জিজ্ঞাসা করুন',
    disclaimer: 'এআই-সহায়তাপ্রাপ্ত চুক্তি বিশ্লেষণ। এটি কোনো সরাসরি আইনি পরামর্শ নয়।',
    
    // Modal
    extractedVerbatim: 'আসল উদ্ধৃত পাঠ্য',
    pages: 'পৃষ্ঠা',
    indexedClauses: 'সূচিপত্র ধারা',
    closeContractText: 'চুক্তি বন্ধ করুন',
    noExtractedText: 'কোনো পাঠ্য খুঁজে পাওয়া যায়নি।',

    months: 'মাস',
    daysWrittenNotice: '৩০ দিনের লিখিত নোটিশ',
    dueNoticeHelper: 'প্রতি ক্যালেন্ডার মাসের ৫ তারিখের মধ্যে প্রদেয়',
  },
  es: {
    // Header & Navigation
    backToWorkspace: 'Volver al Espacio de Trabajo',
    analyzed: 'Analizado',
    viewContract: 'Ver Contrato',
    askAi: 'Consultar a la IA',
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'Términos de Alquiler de Habitación y Arrendamiento',
    employmentPackage: 'Paquete de Empleo y Compensación',
    confidentialityTerms: 'Términos de Confidencialidad y No Divulgación',
    servicesDealTerms: 'Términos de Servicios Comerciales',
    keyDealTerms: 'Términos Clave y Puntos Destacados',
    coreTermsIdentified: 'Términos Principales Identificados',
    keyRoomRentalTerms: 'Términos Clave de Alquiler y Resumen Financiero',
    employmentOverview: 'Panel de Términos de Empleo y Salario',
    confidentialityOverview: 'Alcance de Confidencialidad y Términos',
    servicesOverview: 'Servicios Comerciales y Condiciones Financieras',
    vitalContractHighlights: 'Puntos Clave e Inteligencia del Contrato',
    showLess: 'Mostrar Menos',
    viewAll: 'Ver Todos',
    summary: 'Resumen',
    clickToAsk: 'Haga clic para consultar a la IA sobre',

    // Deal Categories & Labels
    parties: 'PARTES',
    financial: 'FINANCIERO',
    premises: 'INMUEBLE / UBICACIÓN',
    timeline: 'PLAZOS',
    expensesUtilities: 'GASTOS Y SERVICIOS',
    terms: 'TÉRMINOS',
    landlordName: 'NOMBRE DEL ARRENDADOR',
    tenantName: 'NOMBRE DEL INQUILINO',
    monthlyRent: 'ALQUILER MENSUAL',
    securityDeposit: 'DEPÓSITO DE GARANTÍA',
    propertyAddress: 'DIRECCIÓN DEL INMUEBLE',
    leaseTerm: 'DURACIÓN DEL CONTRATO',
    noticePeriod: 'PLAZO DE AVISO',
    monthlyRoomRent: 'ALQUILER MENSUAL DE HABITACIÓN',

    // Important Clauses
    importantClauses: 'Cláusulas Importantes',
    clausesAnalyzed: 'cláusulas analizadas',
    noHighRiskClauses: 'No se detectaron cláusulas de alto riesgo',
    noHighRiskDesc: 'Este contrato no presenta responsabilidades excesivas ni sanciones inusuales.',
    highRisk: 'ALTO RIESGO',
    mediumRisk: 'RIESGO MEDIO',
    lowRisk: 'BAJO RIESGO',
    whatItMeans: 'Qué significa',
    whyItMatters: 'Por qué es importante',
    affects: 'A quién afecta',
    viewClause: 'Ver Cláusula',
    hideDetails: 'Ocultar Detalles',
    clauseOriginalText: 'Cláusula (Texto Original)',
    inSimpleWords: 'En Palabras Sencillas',
    source: 'Fuente / Sección',
    askAiAboutClause: 'Consultar a la IA sobre esta cláusula',

    // Chatbot Panel
    legalAiChatbot: 'Chatbot Legal con IA',
    online: 'En Línea',
    clear: 'Limpiar',
    quickPrompts: 'Preguntas Rápidas:',
    promptSayHi: '👋 Saludar',
    promptRentDeposit: '💰 Alquiler y Depósito',
    promptLiabilities: '⚠️ Riesgos y Deberes',
    promptNotice: '⏰ Rescisión y Plazos',
    promptLaw: '📜 Ley Aplicable',
    promptQSayHi: '¡Hola! Por favor preséntate y dame un resumen conciso de este contrato en español.',
    promptQRent: '¿Cuál es el valor del alquiler, fecha de vencimiento y condiciones del depósito?',
    promptQLiabilities: '¿Cuáles son mis obligaciones, responsabilidades y riesgos primarios?',
    promptQNotice: '¿Cuáles son las cláusulas de rescisión y los periodos de notificación previa?',
    promptQLaw: '¿Cuál es la ley aplicable y la jurisdicción en caso de conflicto?',
    helloAiIntro: '¡Hola! Soy tu Asistente Legal con IA.',
    helloAiDesc: 'He analizado tu contrato. Elige una pregunta rápida arriba o escribe en cualquier idioma abajo.',
    you: 'Tú',
    assistantName: 'Asistente Legal con IA',
    copy: 'Copiar',
    copied: 'Copiado',
    viewCitations: 'Ver citas verificadas',
    hideCitations: 'Ocultar citas',
    verifiedClause: 'Cláusula Verificada',
    match: 'Coincidencia',
    thinking: 'Analizando el contrato y redactando respuesta...',
    inputPlaceholder: 'Haz cualquier consulta en español o tu idioma de preferencia...',
    ask: 'Preguntar',
    disclaimer: 'Análisis asistido por IA. No constituye asesoramiento legal profesional.',
    
    // Modal
    extractedVerbatim: 'Texto textual extraído',
    pages: 'páginas',
    indexedClauses: 'cláusulas indexadas',
    closeContractText: 'Cerrar Texto del Contrato',
    noExtractedText: 'No hay texto extraído disponible.',

    months: 'meses',
    daysWrittenNotice: '30 días de notificación por escrito',
    dueNoticeHelper: 'Pagadero el día 5 de cada mes o antes',
  },
  fr: {
    // Header & Navigation
    backToWorkspace: 'Retour à l\'Espace de Travail',
    analyzed: 'Analysé',
    viewContract: 'Voir le Contrat',
    askAi: 'Poser une Question à l\'IA',
    language: 'Langue',
    selectLanguage: 'Choisir la langue',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'Conditions de Location de Chambre et Bail',
    employmentPackage: 'Conditions d\'Emploi et Rémunération',
    confidentialityTerms: 'Conditions de Confidentialité et Non-Divulgation',
    servicesDealTerms: 'Conditions Commerciales de Prestation de Services',
    keyDealTerms: 'Conditions Essentielles et Points Clés',
    coreTermsIdentified: 'Conditions Clés Identifiées',
    keyRoomRentalTerms: 'Conditions Clés de Location et Aperçu Financier',
    employmentOverview: 'Tableau de Bord Emploi et Rémunération',
    confidentialityOverview: 'Portée de la Confidentialité et Droit Applicable',
    servicesOverview: 'Services Commerciaux et Modalités Financières',
    vitalContractHighlights: 'Points Saillants et Synthèse Contractuelle',
    showLess: 'Réduire',
    viewAll: 'Voir Tout',
    summary: 'Résumé',
    clickToAsk: 'Cliquer pour interroger l\'IA sur',

    // Deal Categories & Labels
    parties: 'PARTIES',
    financial: 'FINANCES',
    premises: 'LOCALISATION / BIEN',
    timeline: 'DURÉE & DÉLAIS',
    expensesUtilities: 'CHARGES & FRAIS',
    terms: 'CONDITIONS',
    landlordName: 'NOM DU BAILLEUR',
    tenantName: 'NOM DU LOCATAIRE',
    monthlyRent: 'LOYER MENSUEL',
    securityDeposit: 'DÉPÔT DE GARANTIE',
    propertyAddress: 'ADRESSE DU BIEN',
    leaseTerm: 'DURÉE DU BAIL',
    noticePeriod: 'PRÉAVIS',
    monthlyRoomRent: 'LOYER MENSUEL DE LA CHAMBRE',

    // Important Clauses
    importantClauses: 'Clauses Importantes',
    clausesAnalyzed: 'clauses analysées',
    noHighRiskClauses: 'Aucune clause à haut risque détectée',
    noHighRiskDesc: 'Ce contrat ne comporte pas d\'obligations excessives ou de pénalités inhabituelles.',
    highRisk: 'RISQUE ÉLEVÉ',
    mediumRisk: 'RISQUE MODÉRÉ',
    lowRisk: 'FAIBLE RISQUE',
    whatItMeans: 'Ce que cela signifie',
    whyItMatters: 'Pourquoi c\'est important',
    affects: 'Personnes concernées',
    viewClause: 'Voir la Clause',
    hideDetails: 'Masquer les Détails',
    clauseOriginalText: 'Clause (Texte Original)',
    inSimpleWords: 'En Termes Simples',
    source: 'Référence Source',
    askAiAboutClause: 'Interroger l\'IA sur cette clause',

    // Chatbot Panel
    legalAiChatbot: 'Assistant IA Juridique',
    online: 'En Ligne',
    clear: 'Effacer',
    quickPrompts: 'Questions Rapides :',
    promptSayHi: '👋 Bonjour',
    promptRentDeposit: '💰 Loyer & Dépôt',
    promptLiabilities: '⚠️ Risques Majeurs',
    promptNotice: '⏰ Résiliation & Préavis',
    promptLaw: '📜 Droit Applicable',
    promptQSayHi: 'Bonjour ! Présentez-vous s\'il vous plaît et donnez-moi une vue d\'ensemble de ce contrat en français.',
    promptQRent: 'Quels sont le montant du loyer, la date d\'échéance et les règles du dépôt de garantie ?',
    promptQLiabilities: 'Quelles sont mes obligations majeures et mes responsabilités légales ?',
    promptQNotice: 'Quelles sont les conditions de résiliation anticipée et les délais de préavis ?',
    promptQLaw: 'Quel est le droit applicable et la juridiction compétente en cas de litige ?',
    helloAiIntro: 'Bonjour ! Je suis votre assistant juridique IA.',
    helloAiDesc: 'J\'ai analysé votre contrat. Cliquez sur une suggestion ou posez votre question en français ci-dessous !',
    you: 'Vous',
    assistantName: 'Assistant IA Juridique',
    copy: 'Copier',
    copied: 'Copié',
    viewCitations: 'Voir les citations vérifiées',
    hideCitations: 'Masquer les citations',
    verifiedClause: 'Clause Vérifiée',
    match: 'Pertinence',
    thinking: 'Analyse du contrat et préparation de la réponse...',
    inputPlaceholder: 'Posez votre question à l\'assistant juridique en français...',
    ask: 'Envoyer',
    disclaimer: 'Analyse contractuelle assistée par IA. Ne constitue pas un conseil juridique officiel.',
    
    // Modal
    extractedVerbatim: 'Texte intégral extrait',
    pages: 'pages',
    indexedClauses: 'clauses indexées',
    closeContractText: 'Fermer le Texte du Contrat',
    noExtractedText: 'Aucun texte extrait disponible.',

    months: 'mois',
    daysWrittenNotice: 'Préavis écrit de 30 jours',
    dueNoticeHelper: 'Payable le 5 de chaque mois civil au plus tard',
  },
  de: {
    // Header & Navigation
    backToWorkspace: 'Zurück zum Arbeitsbereich',
    analyzed: 'Analysiert',
    viewContract: 'Vertrag Anzeigen',
    askAi: 'KI Befragen',
    language: 'Sprache',
    selectLanguage: 'Sprache auswählen',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'Zimmermiet- & Mietvertragsbedingungen',
    employmentPackage: 'Arbeitsvertrag & Vergütungspaket',
    confidentialityTerms: 'Vertraulichkeits- & Geheimhaltungsvereinbarung',
    servicesDealTerms: 'Dienstleistungs- & Handelsbedingungen',
    keyDealTerms: 'Wesentliche Vertragsbedingungen & Highlights',
    coreTermsIdentified: 'Kernbedingungen identifiziert',
    keyRoomRentalTerms: 'Wesentliche Mietbedingungen & Finanzübersicht',
    employmentOverview: 'Übersicht Arbeitsbedingungen & Gehalt',
    confidentialityOverview: 'Umfang der Geheimhaltung & Geltungsbereich',
    servicesOverview: 'Kommerzielle Dienstleistungen & Finanzen',
    vitalContractHighlights: 'Wesentliche Vertragshighlights & Analyse',
    showLess: 'Weniger anzeigen',
    viewAll: 'Alle anzeigen',
    summary: 'Zusammenfassung',
    clickToAsk: 'Klicken, um die KI zu fragen über',

    // Deal Categories & Labels
    parties: 'PARTEIEN',
    financial: 'FINANZIELLES',
    premises: 'IMMOBILIE / STANDORT',
    timeline: 'ZEITRAHMEN',
    expensesUtilities: 'NEBENKOSTEN & AUSGABEN',
    terms: 'BEDINGUNGEN',
    landlordName: 'NAME DES VERMIETERS',
    tenantName: 'NAME DES MIETERS',
    monthlyRent: 'MONATLICHE MIETE',
    securityDeposit: 'KAUTION',
    propertyAddress: 'ADRESSE DER IMMOBILIE',
    leaseTerm: 'VERTRAGSLAUFZEIT',
    noticePeriod: 'KÜNDIGUNGSFRIST',
    monthlyRoomRent: 'MONATLICHE ZIMMERMIETE',

    // Important Clauses
    importantClauses: 'Wichtige Klauseln',
    clausesAnalyzed: 'Klauseln analysiert',
    noHighRiskClauses: 'Keine risikoreichen Klauseln erkannt',
    noHighRiskDesc: 'Dieser Vertrag enthält keine unverhältnismäßigen Haftungsrisiken oder unüblichen Strafen.',
    highRisk: 'HOHES RISIKO',
    mediumRisk: 'MITTLERES RISIKO',
    lowRisk: 'GERINGES RISIKO',
    whatItMeans: 'Bedeutung',
    whyItMatters: 'Warum dies wichtig ist',
    affects: 'Betrifft',
    viewClause: 'Klausel Anzeigen',
    hideDetails: 'Details Ausblenden',
    clauseOriginalText: 'Klausel (Originalvertragstext)',
    inSimpleWords: 'Einfach erklärt',
    source: 'Quellenangabe',
    askAiAboutClause: 'KI zu dieser Klausel befragen',

    // Chatbot Panel
    legalAiChatbot: 'Rechts-KI Chatbot',
    online: 'Online',
    clear: 'Löschen',
    quickPrompts: 'Schnellfragen:',
    promptSayHi: '👋 Hallo sagen',
    promptRentDeposit: '💰 Miete & Kaution',
    promptLiabilities: '⚠️ Wichtige Haftungen',
    promptNotice: '⏰ Kündigung & Fristen',
    promptLaw: '📜 Anwendbares Recht',
    promptQSayHi: 'Hallo! Bitte stelle dich vor und gib mir eine kurze Zusammenfassung dieses Vertrags auf Deutsch.',
    promptQRent: 'Wie hoch ist die monatliche Miete, wann ist sie fällig und welche Kautionsregeln gelten?',
    promptQLiabilities: 'Welche Hauptpflichten und Haftungsrisiken entstehen für mich?',
    promptQNotice: 'Welche Kündigungsfristen und Regelungen zur vorzeitigen Vertragsauflösung bestehen?',
    promptQLaw: 'Welches Recht und welcher Gerichtsstand gelten für diesen Vertrag?',
    helloAiIntro: 'Hallo! Ich bin Ihr rechtlicher KI-Assistent.',
    helloAiDesc: 'Ich habe diesen Vertrag analysiert. Wählen Sie oben eine Frage oder fragen Sie mich auf Deutsch!',
    you: 'Sie',
    assistantName: 'Rechts-KI Assistent',
    copy: 'Kopieren',
    copied: 'Kopiert',
    viewCitations: 'Geprüfte Belegstellen anzeigen',
    hideCitations: 'Belegstellen ausblenden',
    verifiedClause: 'Geprüfte Klausel',
    match: 'Übereinstimmung',
    thinking: 'Vertrag wird geprüft & Antwort formuliert...',
    inputPlaceholder: 'Fragen Sie Ihren Rechts-KI-Assistenten auf Deutsch...',
    ask: 'Fragen',
    disclaimer: 'KI-gestützte Vertragsanalyse. Keine rechtsverbindliche Rechtsberatung.',
    
    // Modal
    extractedVerbatim: 'Extrahierter Originaltext',
    pages: 'Seiten',
    indexedClauses: 'indizierte Klauseln',
    closeContractText: 'Vertragstext schließen',
    noExtractedText: 'Kein extrahierter Text vorhanden.',

    months: 'Monate',
    daysWrittenNotice: '30 Tage schriftliche Kündigungsfrist',
    dueNoticeHelper: 'Fällig am oder vor dem 5. eines jeden Kalendermonats',
  },
  ar: {
    // Header & Navigation
    backToWorkspace: 'العودة إلى مساحة العمل والتاريخ',
    analyzed: 'تم التحليل',
    viewContract: 'عرض العقد',
    askAi: 'اسأل الذكاء الاصطناعي',
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    
    // Deal Highlights Section
    roomRentalDealTerms: 'شروط إيجار الغرفة وعقد الإيجار',
    employmentPackage: 'عقد العمل وحزمة المكافآت',
    confidentialityTerms: 'شروط السرية وعدم الإفصاح',
    servicesDealTerms: 'شروط الخدمات والاتفاقيات التجارية',
    keyDealTerms: 'أهم بنود العقد والنقاط الرئيسية',
    coreTermsIdentified: 'بنود رئيسية تم تحديدها',
    keyRoomRentalTerms: 'أهم شروط إيجار الغرفة والنظرة المالية',
    employmentOverview: 'لوحة شروط التوظيف والتعويضات',
    confidentialityOverview: 'نطاق السرية والشروط الحاكمة',
    servicesOverview: 'الخدمات التجارية والشروط المالية',
    vitalContractHighlights: 'أهم مقتطفات العقد والتحليل الذكي',
    showLess: 'عرض أقل',
    viewAll: 'عرض الكل',
    summary: 'ملخص',
    clickToAsk: 'انقر لسؤال الذكاء الاصطناعي عن',

    // Deal Categories & Labels
    parties: 'الأطراف',
    financial: 'مالي',
    premises: 'العقار / العنوان',
    timeline: 'الجدول الزمني',
    expensesUtilities: 'المصاريف والخدمات',
    terms: 'الشروط',
    landlordName: 'اسم المؤجر / المالك',
    tenantName: 'اسم المستأجر',
    monthlyRent: 'الإيجار الشهري',
    securityDeposit: 'مبلغ التأمين',
    propertyAddress: 'عنوان العقار',
    leaseTerm: 'مدة العقد',
    noticePeriod: 'فترة الإشعار',
    monthlyRoomRent: 'الإيجار الشهري للغرفة',

    // Important Clauses
    importantClauses: 'البنود الهامة (Clauses)',
    clausesAnalyzed: 'بنود تم تحليلها',
    noHighRiskClauses: 'لم يتم العثور على بنود عالية الخطورة',
    noHighRiskDesc: 'هذا العقد لا يحتوي على أي التزامات خطيرة أو غرامات غير عادية تم رصدها.',
    highRisk: 'مخاطرة عالية',
    mediumRisk: 'مخاطرة متوسطة',
    lowRisk: 'مخاطرة منخفضة',
    whatItMeans: 'ما يعنيه هذا البند',
    whyItMatters: 'لماذا هذا مهم',
    affects: 'الطرف المتأثر',
    viewClause: 'عرض البند',
    hideDetails: 'إخفاء التفاصيل',
    clauseOriginalText: 'نص البند الأصلي من العقد',
    inSimpleWords: 'بكلمات مبسطة',
    source: 'المرجع في العقد',
    askAiAboutClause: 'اسأل الذكاء الاصطناعي عن هذا البند',

    // Chatbot Panel
    legalAiChatbot: 'المساعد القانوني الذكي',
    online: 'متصل الآن',
    clear: 'مسح',
    quickPrompts: 'أسئلة سريعة:',
    promptSayHi: '👋 مرحباً',
    promptRentDeposit: '💰 الإيجار والتأمين',
    promptLiabilities: '⚠️ الالتزامات الرئيسية',
    promptNotice: '⏰ الإنهاء والإشعار',
    promptLaw: '📜 القانون الحاكم',
    promptQSayHi: 'مرحباً! يرجى تقديم نفسك وإعطائي ملخصاً شاملاً وسريعاً لهذا العقد باللغة العربية.',
    promptQRent: 'ما هي قيمة الإيجار وموعد استحقاقه وما هي شروط التأمين في هذا العقد؟',
    promptQLiabilities: 'ما هي التزاماتي ومسؤولياتي والمخاطر المترتبة علي بموجب هذا العقد؟',
    promptQNotice: 'ما هي شروط إنهاء العقد وفترة الإخطار المسبق؟',
    promptQLaw: 'ما هو القانون الحاكم وما هي جهة الاختصاص القضائي في حال حدوث نزاع؟',
    helloAiIntro: 'مرحباً! أنا مساعدك القانوني بالذكاء الاصطناعي.',
    helloAiDesc: 'لقد قمت بتحليل هذا العقد بالكامل. اضغط على أي سؤال مقترح أعلاه أو اسأل بأي لغة أدناه!',
    you: 'أنت',
    assistantName: 'المساعد القانوني الذكي',
    copy: 'نسخ',
    copied: 'تم النسخ',
    viewCitations: 'عرض الاستشهادات الموثقة من العقد',
    hideCitations: 'إخفاء الاستشهادات',
    verifiedClause: 'بند موثق',
    match: 'مطابقة',
    thinking: 'جاري مراجعة العقد وصياغة الإجابة بدقة...',
    inputPlaceholder: 'اسأل مساعدك القانوني أي سؤال باللغة العربية...',
    ask: 'إرسال',
    disclaimer: 'تحليل عقد مدعوم بالذكاء الاصطناعي. لا يُعد مشورة قانونية رسمية ملزمة.',
    
    // Modal
    extractedVerbatim: 'النص الأصلي المستخرج',
    pages: 'صفحات',
    indexedClauses: 'بنود مفهرسة',
    closeContractText: 'إغلاق نص العقد',
    noExtractedText: 'لا يوجد نص مستخرج متاح.',

    months: 'أشهر',
    daysWrittenNotice: 'إشعار خطي مسبق مدته 30 يوماً',
    dueNoticeHelper: 'يُستحق في موعد أقصاه اليوم الخامس من كل شهر ميلادي',
  }
};

/**
 * Returns dynamic translations for contract categories and labels
 */
export function getLocalizedCategoryName(category, lang = 'en') {
  const t = translations[lang] || translations.en;
  switch ((category || '').toLowerCase()) {
    case 'rental':
      return t.roomRentalDealTerms;
    case 'employment':
      return t.employmentPackage;
    case 'nda':
      return t.confidentialityTerms;
    case 'services':
      return t.servicesDealTerms;
    default:
      return t.keyDealTerms;
  }
}

export function getLocalizedOverviewTitle(category, lang = 'en') {
  const t = translations[lang] || translations.en;
  switch ((category || '').toLowerCase()) {
    case 'rental':
      return t.keyRoomRentalTerms;
    case 'employment':
      return t.employmentOverview;
    case 'nda':
      return t.confidentialityOverview;
    case 'services':
      return t.servicesOverview;
    default:
      return t.vitalContractHighlights;
  }
}

export function getLocalizedLabel(label, lang = 'en') {
  const t = translations[lang] || translations.en;
  const l = (label || '').toLowerCase();
  if (l.includes('landlord')) return t.landlordName;
  if (l.includes('tenant')) return t.tenantName;
  if (l.includes('monthly rent') || l.includes('room rent')) return t.monthlyRent;
  if (l.includes('security deposit') || l.includes('deposit')) return t.securityDeposit;
  if (l.includes('address') || l.includes('property') || l.includes('premises')) return t.propertyAddress;
  if (l.includes('lease term') || l.includes('duration')) return t.leaseTerm;
  if (l.includes('notice')) return t.noticePeriod;
  return label;
}

export function getLocalizedBadgeCategory(category, lang = 'en') {
  const t = translations[lang] || translations.en;
  const c = (category || '').toUpperCase();
  if (c.includes('PARTIES')) return t.parties;
  if (c.includes('FINANCIAL')) return t.financial;
  if (c.includes('PREMISES')) return t.premises;
  if (c.includes('TIMELINE')) return t.timeline;
  if (c.includes('UTILITIES') || c.includes('EXPENSES')) return t.expensesUtilities;
  return category || t.terms;
}
