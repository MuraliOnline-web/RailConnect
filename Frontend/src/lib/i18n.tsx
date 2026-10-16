/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from "react";
import { useSettings, type AppLanguage } from "./settings";

export type TranslationKey =
  // Nav
  | "nav.dashboard"
  | "nav.journey"
  | "nav.platform"
  | "nav.qr"
  | "nav.tickets"
  | "nav.history"
  | "nav.transactions"
  | "nav.refunds"
  | "nav.wallet"
  | "nav.notifications"
  | "nav.favorites"
  | "nav.profile"
  | "nav.settings"
  | "nav.logout"
  // Common
  | "common.save"
  | "common.cancel"
  | "common.confirm"
  | "common.close"
  | "common.back"
  | "common.next"
  | "common.continue"
  | "common.edit"
  | "common.delete"
  | "common.view"
  | "common.done"
  | "common.clear"
  | "common.apply"
  | "common.retry"
  | "common.active"
  | "common.expired"
  | "common.cancelled"
  | "common.success"
  | "common.failed"
  | "common.unread"
  | "common.loading"
  // Settings
  | "settings.title"
  | "settings.subtitle"
  | "settings.language"
  | "settings.notifications"
  | "settings.notif.booking"
  | "settings.notif.bookingDesc"
  | "settings.notif.offers"
  | "settings.notif.offersDesc"
  | "settings.notif.journey"
  | "settings.notif.journeyDesc"
  | "settings.security"
  | "settings.sec.changePassword"
  | "settings.sec.changePasswordDesc"
  | "settings.sec.twoFactor"
  | "settings.sec.twoFactorDesc"
  | "settings.sec.activeSessions"
  | "settings.sec.activeSessionsDesc"
  | "settings.privacy"
  | "settings.priv.analytics"
  | "settings.priv.analyticsDesc"
  | "settings.priv.personalize"
  | "settings.priv.personalizeDesc"
  | "settings.appPreferences"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.theme.system"
  | "settings.pref.reducedMotion"
  | "settings.pref.reducedMotionDesc"
  | "settings.pref.largerText"
  | "settings.pref.largerTextDesc"
  | "settings.accessibility"
  | "settings.accessibilityDesc"
  // Dashboard
  | "dashboard.greetingMorning"
  | "dashboard.greetingAfternoon"
  | "dashboard.greetingEvening"
  | "dashboard.greetingNight"
  | "dashboard.tagline"
  | "dashboard.quickBook"
  | "dashboard.activeTickets"
  | "dashboard.walletBalance"
  | "dashboard.recharge"
  | "dashboard.recentJourneys"
  | "dashboard.viewAll"
  | "dashboard.noActiveTickets"
  | "dashboard.bookNow"
  // Booking
  | "booking.fromStation"
  | "booking.toStation"
  | "booking.class"
  | "booking.classSecond"
  | "booking.classFirst"
  | "booking.classAc"
  | "booking.ticketType"
  | "booking.singleJourney"
  | "booking.returnJourney"
  | "booking.passengers"
  | "booking.adults"
  | "booking.children"
  | "booking.trainType"
  | "booking.fareSummary"
  | "booking.baseFare"
  | "booking.totalFare"
  | "booking.proceedPayment"
  | "booking.platformTitle"
  | "booking.platformValidity"
  | "booking.issuePlatform"
  // Payment
  | "payment.title"
  | "payment.method"
  | "payment.wallet"
  | "payment.upi"
  | "payment.card"
  | "payment.netbanking"
  | "payment.pay"
  | "payment.successTitle"
  | "payment.failedTitle"
  | "payment.ticketNumber"
  | "payment.txnId"
  | "payment.viewTicket"
  | "payment.dashboard"
  // Tickets & History
  | "tickets.title"
  | "tickets.validUntil"
  | "tickets.showQr"
  | "tickets.downloadPdf"
  | "tickets.empty"
  | "history.title"
  | "history.empty"
  | "transactions.title"
  | "refunds.title"
  // Notifications
  | "notif.title"
  | "notif.markAllRead"
  | "notif.clearAll"
  | "notif.empty"
  | "notif.emptySub"
  // Profile
  | "profile.title"
  | "profile.personalDetails"
  | "profile.fullName"
  | "profile.email"
  | "profile.mobile"
  | "profile.editProfile"
  | "profile.loginActivity"
  | "profile.currentDevice"
  | "profile.activeNow"
  // Toasts
  | "toast.langChanged"
  | "toast.themeChanged"
  | "toast.prefSaved";

const DICTIONARIES: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.journey": "Journey Ticket",
    "nav.platform": "Platform Ticket",
    "nav.qr": "QR Ticket",
    "nav.tickets": "My Tickets",
    "nav.history": "Booking History",
    "nav.transactions": "Transactions",
    "nav.refunds": "Refunds",
    "nav.wallet": "Wallet",
    "nav.notifications": "Notifications",
    "nav.favorites": "Favorite Routes",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.logout": "Log out",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.continue": "Continue",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.done": "Done",
    "common.clear": "Clear",
    "common.apply": "Apply",
    "common.retry": "Retry",
    "common.active": "Active",
    "common.expired": "Expired",
    "common.cancelled": "Cancelled",
    "common.success": "Success",
    "common.failed": "Failed",
    "common.unread": "Unread",
    "common.loading": "Loading...",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Personalize your RailConnect experience.",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.notif.booking": "Booking confirmations",
    "settings.notif.bookingDesc": "In-app notifications when tickets are booked",
    "settings.notif.offers": "Offers & promotions",
    "settings.notif.offersDesc": "Special fare updates and seasonal announcements",
    "settings.notif.journey": "Journey reminders",
    "settings.notif.journeyDesc": "Reminders for your upcoming travel and valid passes",
    "settings.security": "Security",
    "settings.sec.changePassword": "Change password",
    "settings.sec.changePasswordDesc": "Recommended every 90 days",
    "settings.sec.twoFactor": "Two-factor authentication",
    "settings.sec.twoFactorDesc": "Add an extra layer of security",
    "settings.sec.activeSessions": "Active sessions",
    "settings.sec.activeSessionsDesc": "Review devices signed in",
    "settings.privacy": "Privacy",
    "settings.priv.analytics": "Share usage analytics",
    "settings.priv.analyticsDesc": "Help improve route recommendations and app speed",
    "settings.priv.personalize": "Personalized recommendations",
    "settings.priv.personalizeDesc": "Tailored quick routes based on frequent bookings",
    "settings.appPreferences": "App preferences",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.system": "System",
    "settings.pref.reducedMotion": "Reduced motion",
    "settings.pref.reducedMotionDesc": "Minimize animations and visual effects",
    "settings.pref.largerText": "Larger text",
    "settings.pref.largerTextDesc": "Increase overall text size for enhanced readability",
    "settings.accessibility": "Accessibility",
    "settings.accessibilityDesc":
      "RailConnect supports screen readers, high-contrast mode, and keyboard navigation across every page.",

    // Dashboard
    "dashboard.greetingMorning": "Good morning",
    "dashboard.greetingAfternoon": "Good afternoon",
    "dashboard.greetingEvening": "Good evening",
    "dashboard.greetingNight": "Welcome back",
    "dashboard.tagline": "Fast, reliable commuter booking across the suburban network.",
    "dashboard.quickBook": "Quick Book",
    "dashboard.activeTickets": "Active Tickets",
    "dashboard.walletBalance": "Wallet Balance",
    "dashboard.recharge": "Recharge",
    "dashboard.recentJourneys": "Recent Journeys",
    "dashboard.viewAll": "View all",
    "dashboard.noActiveTickets": "No active tickets right now",
    "dashboard.bookNow": "Book Ticket",

    // Booking
    "booking.fromStation": "From Station",
    "booking.toStation": "To Station",
    "booking.class": "Class",
    "booking.classSecond": "Second Class",
    "booking.classFirst": "First Class",
    "booking.classAc": "AC Local",
    "booking.ticketType": "Ticket Type",
    "booking.singleJourney": "Single Journey",
    "booking.returnJourney": "Return Journey",
    "booking.passengers": "Passengers",
    "booking.adults": "Adults",
    "booking.children": "Children",
    "booking.trainType": "Train Category",
    "booking.fareSummary": "Fare Breakdown",
    "booking.baseFare": "Base Fare",
    "booking.totalFare": "Total Fare",
    "booking.proceedPayment": "Proceed to Payment",
    "booking.platformTitle": "Platform Ticket",
    "booking.platformValidity": "Valid for 2 hours at selected station",
    "booking.issuePlatform": "Issue Platform Ticket",

    // Payment
    "payment.title": "Complete Payment",
    "payment.method": "Payment Method",
    "payment.wallet": "RailConnect Wallet",
    "payment.upi": "UPI / QR Code",
    "payment.card": "Debit / Credit Card",
    "payment.netbanking": "Net Banking",
    "payment.pay": "Pay Now",
    "payment.successTitle": "Payment Successful",
    "payment.failedTitle": "Payment Failed",
    "payment.ticketNumber": "Ticket Number",
    "payment.txnId": "Transaction ID",
    "payment.viewTicket": "View Ticket",
    "payment.dashboard": "Go to Dashboard",

    // Tickets & History
    "tickets.title": "My Tickets",
    "tickets.validUntil": "Valid until",
    "tickets.showQr": "Show QR",
    "tickets.downloadPdf": "Download PDF",
    "tickets.empty": "No tickets found",
    "history.title": "Booking History",
    "history.empty": "No booking history recorded",
    "transactions.title": "Transactions",
    "refunds.title": "Refunds",

    // Notifications
    "notif.title": "Notifications",
    "notif.markAllRead": "Mark all as read",
    "notif.clearAll": "Clear all",
    "notif.empty": "No notifications",
    "notif.emptySub": "You are all caught up!",

    // Profile
    "profile.title": "Profile",
    "profile.personalDetails": "Personal Details",
    "profile.fullName": "Full Name",
    "profile.email": "Email Address",
    "profile.mobile": "Mobile Number",
    "profile.editProfile": "Edit Profile",
    "profile.loginActivity": "Login Activity",
    "profile.currentDevice": "Current Device",
    "profile.activeNow": "Active Now",

    // Toasts
    "toast.langChanged": "Language updated to English",
    "toast.themeChanged": "Theme updated",
    "toast.prefSaved": "Preferences saved",
  },

  hi: {
    // Nav
    "nav.dashboard": "डैशबोर्ड",
    "nav.journey": "यात्रा टिकट",
    "nav.platform": "प्लेटफॉर्म टिकट",
    "nav.qr": "क्यूआर टिकट",
    "nav.tickets": "मेरे टिकट",
    "nav.history": "बुकिंग इतिहास",
    "nav.transactions": "लेन-देन",
    "nav.refunds": "धनवापसी",
    "nav.wallet": "वॉलेट",
    "nav.notifications": "सूचनाएं",
    "nav.favorites": "पसंदीदा मार्ग",
    "nav.profile": "प्रोफ़ाइल",
    "nav.settings": "सेटिंग्स",
    "nav.logout": "लॉग आउट",

    // Common
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.confirm": "पुष्टि करें",
    "common.close": "बंद करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.continue": "जारी रखें",
    "common.edit": "संपादित करें",
    "common.delete": "हटाएं",
    "common.view": "देखें",
    "common.done": "पूर्ण",
    "common.clear": "साफ़ करें",
    "common.apply": "लागू करें",
    "common.retry": "पुनः प्रयास करें",
    "common.active": "सक्रिय",
    "common.expired": "समाप्त",
    "common.cancelled": "रद्द",
    "common.success": "सफल",
    "common.failed": "विफल",
    "common.unread": "अपठित",
    "common.loading": "लोड हो रहा है...",

    // Settings
    "settings.title": "सेटिंग्स",
    "settings.subtitle": "अपने रेलकनेक्ट अनुभव को अनुकूलित करें।",
    "settings.language": "भाषा",
    "settings.notifications": "सूचनाएं",
    "settings.notif.booking": "बुकिंग पुष्टिकरण",
    "settings.notif.bookingDesc": "टिकट बुक होने पर इन-ऐप सूचनाएं प्राप्त करें",
    "settings.notif.offers": "ऑफ़र और प्रचार",
    "settings.notif.offersDesc": "विशेष किराया छूट और मौसमी घोषणाएं",
    "settings.notif.journey": "यात्रा स्मरणपत्र",
    "settings.notif.journeyDesc": "अपनी आगामी यात्रा और वैध पास के लिए अलर्ट",
    "settings.security": "सुरक्षा",
    "settings.sec.changePassword": "पासवर्ड बदलें",
    "settings.sec.changePasswordDesc": "हर 90 दिनों में अनुशंसित",
    "settings.sec.twoFactor": "दो-चरणीय प्रमाणीकरण",
    "settings.sec.twoFactorDesc": "सुरक्षा की एक अतिरिक्त परत जोड़ें",
    "settings.sec.activeSessions": "सक्रिय सत्र",
    "settings.sec.activeSessionsDesc": "साइन इन किए गए डिवाइसों की समीक्षा करें",
    "settings.privacy": "गोपनीयता",
    "settings.priv.analytics": "उपयोग विश्लेषण साझा करें",
    "settings.priv.analyticsDesc": "मार्ग सुझावों और ऐप प्रदर्शन को बेहतर बनाने में मदद करें",
    "settings.priv.personalize": "व्यक्तिगत अनुशंसाएं",
    "settings.priv.personalizeDesc": "यात्रा इतिहास के आधार पर तैयार किए गए शॉर्टकट",
    "settings.appPreferences": "ऐप प्राथमिकताएं",
    "settings.theme.light": "लाइट",
    "settings.theme.dark": "डार्क",
    "settings.theme.system": "सिस्टम",
    "settings.pref.reducedMotion": "कम गति (Reduced Motion)",
    "settings.pref.reducedMotionDesc": "एनीमेशन और दृश्य प्रभावों को कम करें",
    "settings.pref.largerText": "बड़ा टेक्स्ट (Larger Text)",
    "settings.pref.largerTextDesc": "बेहतर पठनीयता के लिए टेक्स्ट का आकार बढ़ाएं",
    "settings.accessibility": "अभिगम्यता",
    "settings.accessibilityDesc":
      "रेलकनेक्ट प्रत्येक पृष्ठ पर स्क्रीन रीडर, उच्च-कंट्रास्ट मोड और कीबोर्ड नेविगेशन का समर्थन करता है।",

    // Dashboard
    "dashboard.greetingMorning": "शुभ प्रभात",
    "dashboard.greetingAfternoon": "शुभ दोपहर",
    "dashboard.greetingEvening": "शुभ संध्या",
    "dashboard.greetingNight": "वापसी पर स्वागत है",
    "dashboard.tagline": "उपनगरीय नेटवर्क पर तेज़, विश्वसनीय यात्री टिकट बुकिंग।",
    "dashboard.quickBook": "त्वरित बुकिंग",
    "dashboard.activeTickets": "सक्रिय टिकट",
    "dashboard.walletBalance": "वॉलेट शेष",
    "dashboard.recharge": "रिचार्ज",
    "dashboard.recentJourneys": "हाल की यात्राएं",
    "dashboard.viewAll": "सभी देखें",
    "dashboard.noActiveTickets": "फ़िलहाल कोई सक्रिय टिकट नहीं है",
    "dashboard.bookNow": "टिकट बुक करें",

    // Booking
    "booking.fromStation": "प्रस्थान स्टेशन",
    "booking.toStation": "गंतव्य स्टेशन",
    "booking.class": "श्रेणी",
    "booking.classSecond": "द्वितीय श्रेणी",
    "booking.classFirst": "प्रथम श्रेणी",
    "booking.classAc": "एसी लोकल",
    "booking.ticketType": "टिकट प्रकार",
    "booking.singleJourney": "एक तरफा यात्रा",
    "booking.returnJourney": "वापसी यात्रा",
    "booking.passengers": "यात्री",
    "booking.adults": "वयस्क",
    "booking.children": "बच्चे",
    "booking.trainType": "ट्रेन श्रेणी",
    "booking.fareSummary": "किराया विवरण",
    "booking.baseFare": "मूल किराया",
    "booking.totalFare": "कुल किराया",
    "booking.proceedPayment": "भुगतान के लिए आगे बढ़ें",
    "booking.platformTitle": "प्लेटफॉर्म टिकट",
    "booking.platformValidity": "चयनित स्टेशन पर 2 घंटे के लिए मान्य",
    "booking.issuePlatform": "प्लेटफॉर्म टिकट जारी करें",

    // Payment
    "payment.title": "भुगतान पूरा करें",
    "payment.method": "भुगतान विधि",
    "payment.wallet": "रेलकनेक्ट वॉलेट",
    "payment.upi": "यूपीआई / क्यूआर कोड",
    "payment.card": "डेबिट / क्रेडिट कार्ड",
    "payment.netbanking": "नेट बैंकिंग",
    "payment.pay": "अब भुगतान करें",
    "payment.successTitle": "भुगतान सफल रहा",
    "payment.failedTitle": "भुगतान विफल रहा",
    "payment.ticketNumber": "टिकट संख्या",
    "payment.txnId": "लेन-देन आईडी",
    "payment.viewTicket": "टिकट देखें",
    "payment.dashboard": "डैशबोर्ड पर जाएं",

    // Tickets & History
    "tickets.title": "मेरे टिकट",
    "tickets.validUntil": "मान्य अवधि",
    "tickets.showQr": "क्यूआर कोड दिखाएं",
    "tickets.downloadPdf": "पीडीएफ डाउनलोड करें",
    "tickets.empty": "कोई टिकट नहीं मिला",
    "history.title": "बुकिंग इतिहास",
    "history.empty": "कोई बुकिंग इतिहास दर्ज नहीं है",
    "transactions.title": "लेन-देन",
    "refunds.title": "धनवापसी",

    // Notifications
    "notif.title": "सूचनाएं",
    "notif.markAllRead": "सभी पढ़े हुए के रूप में चिह्नित करें",
    "notif.clearAll": "सभी साफ़ करें",
    "notif.empty": "कोई नई सूचना नहीं",
    "notif.emptySub": "आपकी सभी सूचनाएं अद्यतन हैं!",

    // Profile
    "profile.title": "प्रोफ़ाइल",
    "profile.personalDetails": "व्यक्तिगत विवरण",
    "profile.fullName": "पूरा नाम",
    "profile.email": "ईमेल पता",
    "profile.mobile": "मोबाइल नंबर",
    "profile.editProfile": "प्रोफ़ाइल संपादित करें",
    "profile.loginActivity": "लॉगिन गतिविधि",
    "profile.currentDevice": "वर्तमान डिवाइस",
    "profile.activeNow": "अब सक्रिय",

    // Toasts
    "toast.langChanged": "भाषा बदलकर हिन्दी कर दी गई है",
    "toast.themeChanged": "थीम अपडेट कर दी गई है",
    "toast.prefSaved": "प्राथमिकताएं सहेजी गईं",
  },

  te: {
    // Nav
    "nav.dashboard": "డ్యాష్‌బోర్డ్",
    "nav.journey": "ప్రయాణ టికెట్",
    "nav.platform": "ప్లాట్‌ఫారమ్ టికెట్",
    "nav.qr": "క్యూఆర్ టికెట్",
    "nav.tickets": "నా టికెట్లు",
    "nav.history": "బుకింగ్ చరిత్ర",
    "nav.transactions": "లావాదేవీలు",
    "nav.refunds": "రీఫండ్‌లు",
    "nav.wallet": "వాలెట్",
    "nav.notifications": "నోటిఫికేషన్‌లు",
    "nav.favorites": "ఇష్టమైన మార్గాలు",
    "nav.profile": "ప్రొఫైల్",
    "nav.settings": "సెట్టింగ్‌లు",
    "nav.logout": "లాగ్ అవుట్",

    // Common
    "common.save": "సేవ్ చేయండి",
    "common.cancel": "రద్దు చేయండి",
    "common.confirm": "ధృవీకరించండి",
    "common.close": "మూసివేయండి",
    "common.back": "వెనుకకు",
    "common.next": "తదుపరి",
    "common.continue": "కొనసాగించండి",
    "common.edit": "సవరించండి",
    "common.delete": "తొలగించండి",
    "common.view": "చూడండి",
    "common.done": "పూర్తయింది",
    "common.clear": "క్లియర్ చేయండి",
    "common.apply": "వర్తింపజేయండి",
    "common.retry": "మళ్ళీ ప్రయత్నించండి",
    "common.active": "యాక్టివ్",
    "common.expired": "గడువు ముగిసింది",
    "common.cancelled": "రద్దయింది",
    "common.success": "విజయవంతమైంది",
    "common.failed": "విఫలమైంది",
    "common.unread": "చదవనివి",
    "common.loading": "లోడ్ అవుతోంది...",

    // Settings
    "settings.title": "సెట్టింగ్‌లు",
    "settings.subtitle": "మీ రైల్‌కనెక్ట్ అనుభవాన్ని వ్యక్తిగతీకరించండి.",
    "settings.language": "భాష",
    "settings.notifications": "నోటిఫికేషన్‌లు",
    "settings.notif.booking": "బుకింగ్ నిర్ధారణలు",
    "settings.notif.bookingDesc": "టికెట్లు బుక్ అయినప్పుడు యాప్‌లో నోటిఫికేషన్‌లు పొందండి",
    "settings.notif.offers": "ఆఫర్‌లు & ప్రచారాలు",
    "settings.notif.offersDesc": "ప్రత్యేక ఛార్జీల తగ్గింపులు మరియు పండుగ ప్రకటనలు",
    "settings.notif.journey": "ప్రయాణ రిమైండర్‌లు",
    "settings.notif.journeyDesc": "రాబోయే ప్రయాణాలు మరియు చెల్లుబాటు అయ్యే టికెట్ల హెచ్చరికలు",
    "settings.security": "భద్రత",
    "settings.sec.changePassword": "పాస్‌వర్డ్ మార్చండి",
    "settings.sec.changePasswordDesc": "ప్రతి 90 రోజులకు మార్చడం మంచిది",
    "settings.sec.twoFactor": "ద్విముఖ ప్రమాణీకరణ (2FA)",
    "settings.sec.twoFactorDesc": "అదనపు రక్షణ పొరను జోడించండి",
    "settings.sec.activeSessions": "యాక్టివ్ సెషన్‌లు",
    "settings.sec.activeSessionsDesc": "సైన్ ఇన్ చేసిన పరికరాలను సమీక్షించండి",
    "settings.privacy": "గోప్యత",
    "settings.priv.analytics": "వినియోగ విశ్లేషణను భాగస్వామ్యం చేయండి",
    "settings.priv.analyticsDesc": "మార్గాల సిఫార్సులు మరియు యాప్ వేగాన్ని మెరుగుపరచడంలో సహాయపడండి",
    "settings.priv.personalize": "వ్యక్తిగతీకరించిన సిఫార్సులు",
    "settings.priv.personalizeDesc": "ప్రయాణ చరిత్ర ఆధారంగా రూపొందించబడిన సత్వరమార్గాలు",
    "settings.appPreferences": "యాప్ ప్రాధాన్యతలు",
    "settings.theme.light": "లైట్",
    "settings.theme.dark": "డార్క్",
    "settings.theme.system": "సిస్టమ్",
    "settings.pref.reducedMotion": "తగ్గించిన మోషన్ (Reduced Motion)",
    "settings.pref.reducedMotionDesc": "యానిమేషన్‌లు మరియు కదలిక ప్రభావాలను తగ్గించండి",
    "settings.pref.largerText": "పెద్ద వచనం (Larger Text)",
    "settings.pref.largerTextDesc": "స్పష్టమైన రీడింగ్ కోసం అక్షరాల పరిమాణాన్ని పెంచండి",
    "settings.accessibility": "యాక్సెసిబిలిటీ",
    "settings.accessibilityDesc":
      "రైల్‌కనెక్ట్ ప్రతి పేజీలో స్క్రీన్ రీడర్‌లు, అధిక కాంట్రాస్ట్ మోడ్ మరియు కీబోర్డ్ నావిగేషన్‌కు మద్దతు ఇస్తుంది.",

    // Dashboard
    "dashboard.greetingMorning": "శుభోదయం",
    "dashboard.greetingAfternoon": "శుభ మధ్యాహ్నం",
    "dashboard.greetingEvening": "శుభ సాయంత్రం",
    "dashboard.greetingNight": "తిరిగి స్వాగతం",
    "dashboard.tagline": "సబర్బన్ నెట్‌వర్క్‌లో వేగవంతమైన, నమ్మకమైన సబర్బన్ రైలు టికెటింగ్.",
    "dashboard.quickBook": "శీఘ్ర బుకింగ్",
    "dashboard.activeTickets": "యాక్టివ్ టికెట్లు",
    "dashboard.walletBalance": "వాలెట్ బ్యాలెన్స్",
    "dashboard.recharge": "రీఛార్జ్",
    "dashboard.recentJourneys": "ఇటీవలి ప్రయాణాలు",
    "dashboard.viewAll": "అన్నీ చూడండి",
    "dashboard.noActiveTickets": "ప్రస్తుతం ఏ యాక్టివ్ టికెట్లు లేవు",
    "dashboard.bookNow": "టికెట్ బుక్ చేయండి",

    // Booking
    "booking.fromStation": "ప్రారంభ స్టేషన్",
    "booking.toStation": "గమ్యస్థాన స్టేషన్",
    "booking.class": "తరగతి",
    "booking.classSecond": "రెండవ తరగతి (Second Class)",
    "booking.classFirst": "మొదటి తరగతి (First Class)",
    "booking.classAc": "ఎసి లోకల్ (AC Local)",
    "booking.ticketType": "టికెట్ రకం",
    "booking.singleJourney": "సింగిల్ జర్నీ",
    "booking.returnJourney": "రిటర్న్ జర్నీ",
    "booking.passengers": "ప్రయాణీకులు",
    "booking.adults": "పెద్దలు",
    "booking.children": "పిల్లలు",
    "booking.trainType": "రైలు వర్గం",
    "booking.fareSummary": "ఛార్జీ వివరాలు",
    "booking.baseFare": "ప్రాథమిక ఛార్జీ",
    "booking.totalFare": "మొత్తం ఛార్జీ",
    "booking.proceedPayment": "చెల్లింపునకు వెళ్లండి",
    "booking.platformTitle": "ప్లాట్‌ఫారమ్ టికెట్",
    "booking.platformValidity": "ఎంచుకున్న స్టేషన్‌లో 2 గంటల పాటు చెల్లుబాటు అవుతుంది",
    "booking.issuePlatform": "ప్లాట్‌ఫారమ్ టికెట్ జారీ చేయండి",

    // Payment
    "payment.title": "చెల్లింపు పూర్తి చేయండి",
    "payment.method": "చెల్లింపు పద్ధతి",
    "payment.wallet": "రైల్‌కనెక్ట్ వాలెట్",
    "payment.upi": "యుపిఐ / క్యూఆర్ కోడ్",
    "payment.card": "డెబిట్ / క్రెడిట్ కార్డ్",
    "payment.netbanking": "నెట్ బ్యాంకింగ్",
    "payment.pay": "ఇప్పుడే చెల్లించండి",
    "payment.successTitle": "చెల్లింపు విజయవంతమైంది",
    "payment.failedTitle": "చెల్లింపు విఫలమైంది",
    "payment.ticketNumber": "టికెట్ నంబర్",
    "payment.txnId": "లావాదేవీ ఐడి",
    "payment.viewTicket": "టికెట్ చూడండి",
    "payment.dashboard": "డ్యాష్‌బోర్డ్‌కు వెళ్లండి",

    // Tickets & History
    "tickets.title": "నా టికెట్లు",
    "tickets.validUntil": "చెల్లుబాటు గడువు",
    "tickets.showQr": "క్యూఆర్ కోడ్ చూపించు",
    "tickets.downloadPdf": "పిడిఎఫ్ డౌన్‌లోడ్ చేయండి",
    "tickets.empty": "టికెట్లు ఏవీ కనుగొనబడలేదు",
    "history.title": "బుకింగ్ చరిత్ర",
    "history.empty": "బుకింగ్ చరిత్ర ఏదీ నమోదు కాలేదు",
    "transactions.title": "లావాదేవీలు",
    "refunds.title": "రీఫండ్‌లు",

    // Notifications
    "notif.title": "నోటిఫికేషన్‌లు",
    "notif.markAllRead": "అన్నీ చదివినట్లు గుర్తించండి",
    "notif.clearAll": "అన్నీ క్లియర్ చేయండి",
    "notif.empty": "నోటిఫికేషన్‌లు లేవు",
    "notif.emptySub": "మీ అన్ని నోటిఫికేషన్‌లు అప్‌డేట్ అయ్యాయి!",

    // Profile
    "profile.title": "ప్రొఫైల్",
    "profile.personalDetails": "వ్యక్తిగత వివరాలు",
    "profile.fullName": "పూర్తి పేరు",
    "profile.email": "ఇమెయిల్ చిరునామా",
    "profile.mobile": "మొబైల్ నంబర్",
    "profile.editProfile": "ప్రొఫైల్ సవరించండి",
    "profile.loginActivity": "లాగిన్ యాక్టివిటీ",
    "profile.currentDevice": "ప్రస్తుత పరికరం",
    "profile.activeNow": "ఇప్పుడు యాక్టివ్‌గా ఉంది",

    // Toasts
    "toast.langChanged": "భాష తెలుగులోకి మార్చబడింది",
    "toast.themeChanged": "థీమ్ నవీకరించబడింది",
    "toast.prefSaved": "ప్రాధాన్యతలు సేవ్ చేయబడ్డాయి",
  },
};

type I18nContextType = {
  language: AppLanguage;
  t: (key: TranslationKey, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const language = settings.language;

  const value = useMemo<I18nContextType>(() => {
    return {
      language,
      t: (key: TranslationKey, fallback?: string): string => {
        const dict = DICTIONARIES[language] || DICTIONARIES.en;
        if (dict[key]) return dict[key];
        const enFallback = DICTIONARIES.en[key];
        if (enFallback) return enFallback;
        return fallback ?? key;
      },
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback outside provider
    return {
      language: "en" as AppLanguage,
      t: (key: TranslationKey, fallback?: string): string => {
        return DICTIONARIES.en[key] ?? fallback ?? key;
      },
    };
  }
  return ctx;
}
