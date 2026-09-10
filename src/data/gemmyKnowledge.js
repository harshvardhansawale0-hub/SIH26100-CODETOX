/**
 * GeMMy AI Knowledge Base & Procurement Rule Engine
 * Comprehensive rule dataset for GeM, GFR 2017, DPIIT MII, MSME/Startup policies,
 * Anti-Cartel forensics, reverse auctions, and live platform navigation.
 * Supports English (en), Hindi (hi), and Marathi (mr).
 */

export const GEMMY_SUGGESTED_PROMPTS = {
  en: [
    { label: "📋 GFR Rule 149 Limits", query: "What are the GFR 2017 Rule 149 direct purchase and bidding limits on GeM?" },
    { label: "🛡️ Make in India Class I & II", query: "Explain DPIIT Make in India Class-I and Class-II supplier criteria and purchase preference." },
    { label: "🏢 MSME & Startup Exemptions", query: "What exemptions do MSMEs and Startups receive for EMD and turnover on GeM?" },
    { label: "⚡ Reverse Auction Rules", query: "How does Reverse Auction (RA) elimination and timer auto-extension work on GeM?" },
    { label: "⚖️ Anti-Cartel Detection", query: "How does GeM AI detect bidder cartels and collusive pricing?" },
    { label: "🔍 Live Bid Verifier", query: "How can I verify tender documents and check my AI compliance score?" },
    { label: "📦 Seller Registration Guide", query: "How can a new vendor register on GeM and upload product catalogs?" },
    { label: "💳 CRAC & 10-Day Payments", query: "What is the CRAC inspection rule and 10-day payment timeline on GeM?" }
  ],
  hi: [
    { label: "📋 GFR 149 खरीद सीमाएं", query: "GeM पर GFR 2017 नियम 149 के अनुसार डायरेक्ट परचेस और बिडिंग की सीमाएं क्या हैं?" },
    { label: "🛡️ मेक इन इंडिया नियम", query: "DPIIT मेक इन इंडिया क्लास-I और क्लास-II स्थानीय आपूर्तिकर्ता के नियम समझाइए।" },
    { label: "🏢 MSME व स्टार्टअप छूट", query: "MSME और स्टार्टअप्स को GeM पर EMD और टर्नओवर में क्या छूट मिलती है?" },
    { label: "⚡ रिवर्स ऑक्शन नियम", query: "GeM पर रिवर्स ऑक्शन में बोली और समय विस्तार के क्या नियम हैं?" },
    { label: "⚖️ कार्टेल व फर्जीवाड़ा जांच", query: "GeM AI बोलीदाताओं के कार्टेल और मिलीभगत की पहचान कैसे करता है?" },
    { label: "🔍 बिड सत्यापन सैंडबॉक्स", query: "मैं अपने टेंडर दस्तावेजों की जांच और बिड स्कोर कैसे सत्यापित करूँ?" },
    { label: "📦 विक्रेता पंजीकरण प्रक्रिया", query: "GeM पर नया विक्रेता पंजीकरण और उत्पाद सूची कैसे दर्ज करें?" },
    { label: "💳 CRAC व 10-दिवसीय भुगतान", query: "GeM पर CRAC निरीक्षण और 10 दिनों में भुगतान की प्रक्रिया क्या है?" }
  ],
  mr: [
    { label: "📋 GFR 149 खरेदी मर्यादा", query: "GeM पोर्टलवर GFR 2017 नियम 149 नुसार थेट खरेदी आणि निविदा मर्यादा काय आहेत?" },
    { label: "🛡️ मेक इन इंडिया धोरण", query: "DPIIT मेक इन इंडिया Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम स्पष्ट करा." },
    { label: "🏢 MSME व स्टार्टअप सवलती", query: "MSME आणि स्टार्टअप्सना GeM वर EMD आणि टर्नओव्हरमध्ये काय सवलती मिळतात?" },
    { label: "⚡ रिव्हर्स ऑक्शन नियम", query: "GeM वर रिव्हर्स ऑक्शन (RA) चे नियम आणि वेळ विस्तार कसा चालतो?" },
    { label: "⚖️ कार्टेल व मिलीभगत तपासणी", query: "GeM AI बोलीदारांची मिलीभगत आणि कार्टेल कसे शोधते?" },
    { label: "🔍 थेट बिड पडताळणी", query: "मी माझ्या निविदा कागदपत्रांची पडताळणी आणि बिड स्कोअर कसा तपासावा?" },
    { label: "📦 विक्रेता नोंदणी मार्गदर्शक", query: "GeM वर नवीन विक्रेता नोंदणी आणि उत्पादन कॅटलॉग कसा जोडावा?" },
    { label: "💳 CRAC आणि १० दिवसांत पेमेंट", query: "GeM वर CRAC तपासणी आणि १० दिवसांत पेमेंटचे काय नियम आहेत?" }
  ]
};

export const GEMMY_KNOWLEDGE_TOPICS = [
  // 1. GFR 2017 Rule 149
  {
    id: 'gfr_149',
    keywords: ['149', 'direct purchase', 'limit', 'threshold', 'l1 comparison', 'l1', 'direct', '25000', '500000', 'खरेदी मर्यादा', 'डायरेक्ट', 'थेट खरेदी'],
    citations: ['GFR 2017 Rule 149', 'GeM Procurement Manual 2024'],
    actions: [
      { id: 'act_buyer', label: 'Explore Buyer Portal', action: 'NAVIGATE_BUYER', icon: 'PlusCircle' },
      { id: 'act_tenders', label: 'View Active Bids', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**Procurement Thresholds under GFR 2017 Rule 149 on GeM:**\n\n` +
          `1. **Direct Purchase (Up to ₹25,000)**: Any government buyer can purchase goods/services directly through any available GeM supplier meeting technical specifications and delivery terms without floating tenders [GFR Rule 149(i)].\n\n` +
          `2. **L1 Price Comparison (₹25,000 to ₹5,00,000)**: Buyers must compare products of at least **3 distinct manufacturers/sellers** on GeM meeting identical specifications and place the order with the lowest compliant (L1) bidder [GFR Rule 149(ii)].\n\n` +
          `3. **Mandatory Bidding / Reverse Auction (Above ₹5,00,000)**: Procurements exceeding ₹5 Lakhs must strictly be conducted through **open electronic bidding or Reverse Auction (RA)** on the portal [GFR Rule 149(iii)].\n\n` +
          `*Note: For automobiles, the direct purchase limit is extended up to ₹30 Lakhs subject to DGS&D/GeM rate contracts.*`,
      hi: `**GeM पर GFR 2017 नियम 149 के अंतर्गत अनिवार्य खरीद सीमाएं:**\n\n` +
          `1. **डायरेक्ट परचेस (₹25,000 तक)**: सरकारी क्रेता बिना किसी कोटेशन के GeM पर उपलब्ध किसी भी योग्य विक्रेता से सीधे खरीद कर सकते हैं [GFR Rule 149(i)]।\n\n` +
          `2. **L1 मूल्य तुलना (₹25,000 से ₹5,00,000)**: कम से कम **3 अलग-अलग निर्माताओं (OEMs)** के उत्पादों की तकनीकी तुलना करके सबसे कम दर (L1) वाले विक्रेता को आर्डर देना अनिवार्य है [GFR Rule 149(ii)]।\n\n` +
          `3. **अनिवार्य बिडिंग / रिवर्स ऑक्शन (₹5,00,000 से अधिक)**: ₹5 लाख से अधिक की सभी सरकारी खरीद के लिए GeM पर खुली इलेक्ट्रॉनिक बोली (Bidding) या रिवर्स ऑक्शन (RA) अनिवार्य है [GFR Rule 149(iii)]।`,
      mr: `**GeM पोर्टलवर GFR 2017 नियम 149 नुसार खरेदी मर्यादा:**\n\n` +
          `1. **थेट खरेदी (₹२५,००० पर्यंत)**: सरकारी खरेदीदार कोणत्याही पात्र विक्रेत्याकडून थेट कोटेशनशिवाय खरेदी करू शकतात [GFR Rule 149(i)].\n\n` +
          `2. **L1 किंमत तुलना (₹२५,००० ते ₹५,००,०००)**: किमान **३ वेगवेगळ्या उत्पादकांच्या (OEMs)** उत्पादनांची तुलना करून सर्वात कमी (L1) किमतीत खरेदी करणे बंधनकारक आहे [GFR Rule 149(ii)].\n\n` +
          `3. **अनिवार्य निविदा / रिव्हर्स ऑक्शन (₹५,००,००० पेक्षा जास्त)**: ₹५ लाखांपेक्षा जास्त खरेदीसाठी GeM वर खुली इलेक्ट्रॉनिक निविदा किंवा रिव्हर्स ऑक्शन (RA) अनिवार्य आहे [GFR Rule 149(iii)].`
    }
  },

  // 2. Make in India / DPIIT Local Content
  {
    id: 'make_in_india',
    keywords: ['make in india', 'dpiit', 'local content', 'class-i', 'class 1', 'class-ii', 'class 2', 'non-local', 'margin', 'purchase preference', 'मेक इन इंडिया', 'स्थानिक सामग्री'],
    citations: ['DPIIT Order P-45021/2/2017-PP', 'Public Procurement Order 2017', 'GFR Rule 161(iv)'],
    actions: [
      { id: 'act_schemes', label: 'View MII Initiative Portal', action: 'NAVIGATE_SCHEMES', icon: 'Award' },
      { id: 'act_verify', label: 'Verify Local Content %', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' }
    ],
    responses: {
      en: `**DPIIT Public Procurement (Preference to Make in India) Policy:**\n\n` +
          `• **Class-I Local Supplier (Local Content ≥ 50%)**:\n` +
          `  - Receives **20% Margin of Purchase Preference** (L1 + 20% window).\n` +
          `  - If lowest bid (L1) is non-local, Class-I supplier within L1+20% is invited to match L1 price for contract award.\n\n` +
          `• **Class-II Local Supplier (Local Content ≥ 20% and < 50%)**:\n` +
          `  - Eligible to participate in domestic tenders where local availability exists, but **no purchase preference** is granted.\n\n` +
          `• **Non-Local Supplier (Local Content < 20%)**:\n` +
          `  - Banned from participating in government tenders up to **₹200 Crores** under Global Tender Enquiry (GTE) restrictions [Rule 161(iv)].\n\n` +
          `*Verification: Self-certification permitted up to ₹10 Cr; CA/Cost Auditor audited declaration mandatory above ₹10 Cr.*`,
      hi: `**DPIIT मेक इन इंडिया (MII) स्थानीय सामग्री और वरीयता नियम:**\n\n` +
          `• **Class-I स्थानीय आपूर्तिकर्ता (स्थानीय सामग्री ≥ 50%)**:\n` +
          `  - इन्हें टेंडर में **20% खरीद वरीयता मार्जिन (Purchase Preference)** मिलता है।\n` +
          `  - यदि L1 बोलीदाता गैर-स्थानीय है, तो L1+20% के दायरे में आने वाले Class-I सप्लायर को L1 दर पर आर्डर पाने का पहला अवसर मिलता है।\n\n` +
          `• **Class-II स्थानीय आपूर्तिकर्ता (स्थानीय सामग्री ≥ 20% और < 50%)**:\n` +
          `  - ये बोली लगा सकते हैं लेकिन इन्हें खरीद वरीयता (Preference Margin) का लाभ नहीं मिलता।\n\n` +
          `• **Non-Local आपूर्तिकर्ता (स्थानीय सामग्री < 20%)**:\n` +
          `  - ₹200 करोड़ तक के सभी टेंडरों में इनके भाग लेने पर पूर्ण प्रतिबंध है (GTE प्रतिबंध [Rule 161(iv)])।`,
      mr: `**DPIIT मेक इन इंडिया (MII) स्थानिक सामग्री धोरण:**\n\n` +
          `• **Class-I स्थानिक पुरवठादार (स्थानिक सामग्री ≥ ५०%)**:\n` +
          `  - यांना निविदेमध्ये **२०% खरेदी प्राधान्य मार्जिन (Purchase Preference)** मिळते.\n` +
          `  - जर L1 पुरवठादार स्थानिक नसेल, तर L1+20% मधील Class-I पुरवठादारास L1 दराने काम स्वीकारण्याची संधी दिली जाते.\n\n` +
          `• **Class-II स्थानिक पुरवठादार (स्थानिक सामग्री ≥ २०% आणि < ५०%)**:\n` +
          `  - हे निविदेत भाग घेऊ शकतात, परंतु यांना खरेदी प्राधान्य मिळत नाही.\n\n` +
          `• **Non-Local पुरवठादार (स्थानिक सामग्री < २०%)**:\n` +
          `  - ₹२०० कोटींपर्यंतच्या टेंडरसाठी ग्लोबल टेंडरवर (GTE) बंदी असल्याने हे सहभागी होऊ शकत नाहीत [Rule 161(iv)].`
    }
  },

  // 3. MSME & Startup Exemptions
  {
    id: 'msme_startup',
    keywords: ['msme', 'startup', 'udyam', 'emd', 'exemption', 'turnover', 'prior experience', 'waiver', 'reservation', 'स्टार्टअप', 'उद्यम', 'सवलत', 'सूट'],
    citations: ['Public Procurement Policy for MSEs Order 2012', 'GFR 2017 Rule 170(i)', 'MoF OM F.20/2/2014-PPD'],
    actions: [
      { id: 'act_schemes', label: 'MSME & Startup Schemes', action: 'NAVIGATE_SCHEMES', icon: 'Award' },
      { id: 'act_verify', label: 'Verify UDYAM Certificate', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' }
    ],
    responses: {
      en: `**Statutory Privileges & Exemptions for MSMEs and Startups on GeM:**\n\n` +
          `1. **100% EMD Exemption**: All MSEs registered on UDYAM and DPIIT-recognized Startups are **100% exempt from Earnest Money Deposit (EMD)** [GFR Rule 170(i)].\n\n` +
          `2. **Relaxation of Prior Turnover & Experience**: Buyers can exempt recognized Startups and MSEs from past turnover and years of experience, subject to meeting technical specifications and quality standards.\n\n` +
          `3. **25% Mandatory Annual Procurement Target**: Central Ministries, Departments, and CPSEs must procure at least **25%** of their total annual procurement from MSEs:\n` +
          `   - **4% reserved for SC/ST-owned MSEs**\n` +
          `   - **3% reserved for Women-owned MSEs (Womaniya on GeM)**\n\n` +
          `4. **L1 Price Matching (MSE Purchase Preference)**: MSEs quoting within **L1 + 15%** price band can match L1 price and win at least **25% of the total order quantity**.`,
      hi: `**GeM पर MSME और स्टार्टअप्स को मिलने वाली प्रमुख कानूनी छूट:**\n\n` +
          `1. **100% EMD (बयाना राशि) छूट**: वैध UDYAM पंजीकृत MSEs और DPIIT मान्यता प्राप्त स्टार्टअप्स को **ईएमडी जमा करने से पूर्ण छूट** प्राप्त है [GFR 170(i)]।\n\n` +
          `2. **पूर्व टर्नओवर व अनुभव में छूट**: तकनीकी मानकों को पूरा करने पर स्टार्टअप्स और सूक्ष्म/लघु उद्योगों को पूर्व अनुभव और टर्नओवर की अनिवार्य शर्तों से छूट दी जा सकती है।\n\n` +
          `3. **25% अनिवार्य वार्षिक खरीद लक्ष्य**: सभी केंद्रीय मंत्रालयों और CPSEs के लिए अपनी वार्षिक खरीद का कम से कम **25% हिस्सा MSEs से करना अनिवार्य** है:\n` +
          `   - **4% अनुसूचित जाति/जनजाति (SC/ST) उद्यमियों के लिए**\n` +
          `   - **3% महिला उद्यमियों के लिए (Womaniya on GeM)**\n\n` +
          `4. **L1 + 15% मूल्य वरीयता**: यदि L1 कोई गैर-MSE है, तो L1+15% के दायरे में आने वाले MSE को L1 मूल्य मिलान करके कम से कम **25% कार्य आर्डर** पाने का अधिकार है।`,
      mr: `**GeM पोर्टलवर MSME आणि स्टार्टअप्ससाठी प्रमुख सवलती:**\n\n` +
          `1. **१००% EMD फी माफी**: सर्व वैध UDYAM नोंदणीकृत MSEs आणि मान्यताप्राप्त स्टार्टअप्सना **बयाणा रक्कम (EMD) भरण्यापासून १००% सूट** आहे [GFR Rule 170(i)].\n\n` +
          `2. **टर्नओव्हर आणि अनुभवात सवलत**: तांत्रिक निकष पूर्ण करत असल्यास मागील टर्नओव्हर आणि कामाच्या अनुभवाच्या अटींमधून सूट दिली जाते.\n\n` +
          `3. **२५% अनिवार्य वार्षिक खरेदी**: सर्व सरकारी विभागांना वर्षातील एकूण खरेदीच्या किमान **२५% खरेदी MSEs कडून करणे बंधनकारक** आहे:\n` +
          `   - **४% SC/ST उद्योजकांसाठी राखीव**\n` +
          `   - **३% महिला उद्योजकांसाठी राखीव (Womaniya)**\n\n` +
          `4. **L1 + 15% प्राधान्य**: L1+15% च्या टप्प्यात असणाऱ्या MSE ला L1 किमतीशी जुळवून किमान **२५% ऑर्डर मिळवण्याचा अधिकार** आहे.`
    }
  },

  // 4. Reverse Auction (RA) Rules
  {
    id: 'reverse_auction',
    keywords: ['reverse auction', 'ra', 'auto-extension', 'auto extension', 'timer', 'h1', 'elimination', 'decrement', 'रिवर्स ऑक्शन', 'रिव्हर्स ऑक्शन', 'लिलाव', 'लिलावात', 'ऑक्शन', 'वेळ विस्तार'],
    citations: ['GeM Reverse Auction (RA) Guidelines 2024', 'GFR 2017 Rule 149(iii)'],
    actions: [
      { id: 'act_auctions', label: 'View Live E-Auctions Portal', action: 'NAVIGATE_AUCTIONS', icon: 'TrendingDown' },
      { id: 'act_tenders', label: 'Browse Active RA Bids', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**GeM Reverse Auction (RA) Operating Rules & Dynamics:**\n\n` +
          `1. **H1 Elimination Rule (Promoting Competition)**:\n` +
          `   - When **4 or more qualified bidders** enter the Reverse Auction, the highest-priced bidder (**H1**) is automatically eliminated prior to RA commencement.\n` +
          `   - If bidders are between 2 and 3, all participate without H1 elimination.\n\n` +
          `2. **Dynamic Auto-Extension Window**:\n` +
          `   - The standard RA duration is typically **2 to 3 hours**.\n` +
          `   - If any lower bid is submitted in the **final 10 minutes**, the auction timer **automatically extends by 10 to 15 minutes** to prevent bid-sniping.\n` +
          `   - Extensions continue until no new bid is received during the extended window.\n\n` +
          `3. **Minimum Decrement Value**:\n` +
          `   - Bidders can only decrement their price by at least the specified minimum percentage/value (e.g. 0.5% or ₹1,000).\n\n` +
          `*To inspect live simulation and timer extensions, visit the dedicated Live E-Auctions Portal.*`,
      hi: `**GeM पर रिवर्स ऑक्शन (Reverse Auction - RA) के प्रमुख नियम:**\n\n` +
          `1. **H1 निष्कासन नियम (H1 Elimination)**:\n` +
          `   - यदि रिवर्स ऑक्शन में **4 या उससे अधिक योग्य बोलीदाता** हैं, तो सबसे अधिक मूल्य कोट करने वाले बोलीदाता (**H1**) को नीलामी शुरू होने से पहले ही सिस्टम से बाहर कर दिया जाता है।\n` +
          `   - यदि 2 या 3 बोलीदाता हों, तो किसी को बाहर नहीं किया जाता।\n\n` +
          `2. **ऑटो-एक्सटेंशन (Auto-Extension) टाइमर**:\n` +
          `   - यदि नीलामी के **अंतिम 10 मिनट** में कोई भी विक्रेता नई निचली बोली लगाता है, तो सिस्टम का समय **स्वचालित रूप से 10 या 15 मिनट आगे बढ़ जाता है**।\n` +
          `   - जब तक अंतिम 10 मिनट में नई बोली आना बंद नहीं होती, यह विस्तार जारी रहता है।\n\n` +
          `3. **न्यूनतम कमी (Minimum Decrement)**: प्रत्येक नई बोली को पिछली बोली से कम से कम निर्धारित न्यूनतम राशि (जैसे 0.5%) नीचे होना अनिवार्य है।`,
      mr: `**GeM पोर्टलवर रिव्हर्स ऑक्शन (RA) चे नियम आणि कार्यप्रणाली:**\n\n` +
          `1. **H1 बाद करण्याचे नियम (H1 Elimination)**:\n` +
          `   - जेव्हा रिव्हर्स ऑक्शनमध्ये **४ किंवा त्याहून अधिक पात्र बोलीदार** असतात, तेव्हा सर्वात जास्त किंमत देणाऱ्या बोलीदाराला (**H1**) लिलाव सुरू होण्यापूर्वीच बाद केले जाते.\n` +
          `   - २ किंवा ३ बोलीदार असल्यास कोणालाही बाद केले जात नाही.\n\n` +
          `2. **स्वयंचलित वेळ विस्तार (Auto-Extension)**:\n` +
          `   - लिलावाच्या **शेवटच्या १० मिनिटांत** नवीन कमी बोली आल्यास घड्याळाचा वेळ **आपोआप १० किंवा १५ मिनिटांनी वाढतो**.\n` +
          `   - जोपर्यंत नवीन बोली येणे थांबत नाही, तोपर्यंत वेळ वाढत राहतो.\n\n` +
          `3. **किमान किंमत घट (Minimum Decrement)**: पुढील बोली निर्धारित रकमेपेक्षा कमी असणे आवश्यक असते.`
    }
  },

  // 5. Anti-Cartel & Collusion AI Detection
  {
    id: 'anti_cartel',
    keywords: ['cartel', 'collusion', 'bid rigging', 'anomaly', 'dsc', 'ip subnet', 'syndicate', 'price clustering', 'fraud', 'कार्टेल', 'मिलीभगत', 'सिंडिकेट', 'धांधली'],
    citations: ['Competition Act 2002 Sec 3(3)', 'GeM Forensic Vigilance Directive', 'GFR 2017 Rule 175'],
    actions: [
      { id: 'act_auctions', label: 'View Cartel Analysis Graph', action: 'NAVIGATE_AUCTIONS', icon: 'TrendingDown' },
      { id: 'act_verify', label: 'Check Bid Forensic Dossier', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' }
    ],
    responses: {
      en: `**GeM AI Anti-Cartel & Forensic Surveillance Engine:**\n\n` +
          `Our platform deploys real-time neural anomaly detection to uncover illicit bidder cartels:\n\n` +
          `1. **Digital Signature Certificate (DSC) Forensics**: Detects if competing vendors submitted bids signed by the identical USB cryptographic token, common authorized signatory, or shared serial numbers.\n\n` +
          `2. **IP / MAC / Subnet Clustering**: Identifies rival bids submitted from the identical public IP address or within minutes from the same LAN subnet (e.g. 192.168.4.x).\n\n` +
          `3. **Coordinated Price Clustering**: Flags suspicious quote spacings (e.g. within 0.1% to 0.4% margins) designed to rotate contract awards artificially among syndicate members.\n\n` +
          `4. **Direct Consequences**: Cartelized vendors face immediate disqualification, forfeiture of EMD, and up to **2 years debarment** under GFR Rule 151 and Competition Commission of India (CCI) penal action.`,
      hi: `**GeM AI एंटी-कार्टेल और मिलीभगत पहचान प्रणाली:**\n\n` +
          `हमारा AI इंजन बोलियों में अवैध सिंडिकेट और मिलीभगत की पहचान के लिए बहु-स्तरीय जांच करता है:\n\n` +
          `1. **DSC डिजिटल हस्ताक्षर फॉरेंसिक**: जब दो या दो से अधिक प्रतिस्पर्धी बोलियां एक ही DSC डोंगल, सीरियल नंबर या अधिकृत हस्ताक्षरकर्ता द्वारा अपलोड की जाती हैं।\n\n` +
          `2. **IP और सबनेट क्लस्टरिंग**: एक ही IP पते या चंद मिनटों के अंतराल पर एक ही नेटवर्क सबनेट से दर्ज की गई बोलियों को तुरंत कार्टेल रिस्क में फ्लैग किया जाता है।\n\n` +
          `3. **मूल्य सिंडिकेटिंग (Price Spacing)**: जब सभी विक्रेता बेंचमार्क मूल्य से ठीक 0.1% से 0.4% के संकीर्ण अंतर पर बोलियां लगाते हैं।\n\n` +
          `4. **सख्त कार्रवाई**: कार्टेल पाए जाने पर ईएमडी जब्त होती है और **2 वर्ष तक के लिए GeM से ब्लैकलिस्ट** (Debarment) किया जाता है।`,
      mr: `**GeM AI अँटी-कार्टेल आणि मिलीभगत शोध प्रणाली:**\n\n` +
          `1. **DSC डिजिटल स्वाक्षरी तपासणी**: एकाच DSC डोंगल किंवा स्वाक्षरीद्वारे अनेक प्रतिस्पर्धी कंपन्यांनी बोली लावल्यास प्रणाली त्वरित इशारा देते.\n\n` +
          `2. **IP सबनेट क्लस्टरिंग**: एकाच इंटरनेट IP पत्त्यावरून किंवा काही मिनिटांत सबमिट केलेल्या बिड्स कार्टेल म्हणून नोंदवल्या जातात.\n\n` +
          `3. **किंमत सिंडिकेटिंग**: जेव्हा स्पर्धक संगनमत करून अत्यंत कमी फरकाने (०.१% ते ०.५%) किमती कोट करतात.\n\n` +
          `4. **कारवाई**: अशा कंपन्यांना GeM वरून **२ वर्षांसाठी काळ्या यादीत (Blacklist)** टाकले जाते.`
    }
  },

  // 6. Live Bid Verification & AI Document OCR Sandbox
  {
    id: 'bid_verification',
    keywords: ['verify', 'verifier', 'document', 'ocr', 'compliance score', 'sandbox', 'audit trail', 'pan', 'gstin', 'dossier', 'पडताळणी', 'सत्यापन', 'दस्तावेज', 'कागदपत्रे'],
    citations: ['GFR 2017 Statutory Compliance', 'GeM AI Document Verification Pipeline 2026'],
    actions: [
      { id: 'act_verify', label: 'Open Live Bid Verification Sandbox', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
      { id: 'act_tenders', label: 'Select Tender to Verify', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**GeM AI 8-Stage Autonomous Bid Verification Pipeline:**\n\n` +
          `Our system verifies bidder compliance in real-time before official submission:\n\n` +
          `1. **Document Ingestion & Multi-OCR**: Uses EasyOCR and Tesseract to extract entity values from PAN, GST REG-06, UDYAM, and CA Turnover balance sheets.\n` +
          `2. **Document Forensics**: Scans for font inconsistencies, digital signature authenticity, and document tampering.\n` +
          `3. **Live API Cross-Validation**: Validates GSTIN status against the GST Portal and PAN against NSDL records.\n` +
          `4. **214+ GFR Rule Engine**: Checks statutory requirements (Local Content %, turnover minimums, experience years).\n` +
          `5. **Compliance Scoring**: Generates an instant Score out of 100:\n` +
          `   - **Compliant (Score ≥ 85)**: Eligible for award\n` +
          `   - **Flagged (Score 50-84)**: Document clarification requested\n` +
          `   - **Non-Compliant (Score < 50)**: Disqualified\n\n` +
          `*Click below to test any tender document live in the Verification Sandbox!*`,
      hi: `**GeM AI 8-चरणीय स्वायत्त बिड सत्यापन पाइपलाइन:**\n\n` +
          `हमारा सिस्टम टेंडर जमा करने से पहले दस्तावेजों की वास्तविक समय में स्वचालित जांच करता है:\n\n` +
          `1. **दस्तावेज OCR एक्सट्रैक्शन**: PAN, GSTIN, UDYAM और CA टर्नओवर सर्टिफिकेट से स्वतः डेटा निकालता है।\n` +
          `2. **फोरेंसिक जांच**: फॉन्ट विसंगति, जाली सील या डिजिटल छेड़छाड़ की पहचान करता है।\n` +
          `3. **सरकारी API सत्यापन**: GST पोर्टल और NSDL से डेटा का सीधा मिलान करता है।\n` +
          `4. **214+ कानूनी नियमों का मूल्यांकन**: GFR 2017, DPIIT और टेंडर की शर्तों का सत्यापन करता है।\n` +
          `5. **तत्काल बिड स्कोर**: 100 में से स्कोर जनरेट करता है (Compliant, Flagged, या Non-Compliant)।\n\n` +
          `*नीचे दिए गए बटन से आप सीधे सत्यापन सैंडबॉक्स खोलकर दस्तावेजों की जांच कर सकते हैं!*`,
      mr: `**GeM AI ८-टप्प्यांची थेट बिड पडताळणी प्रणाली:**\n\n` +
          `1. **OCR डेटा संकलन**: पॅन कार्ड, GSTIN, उद्यम आणि CA टर्नओव्हर प्रमाणपत्रांमधून आपोआप माहिती वाचतो.\n` +
          `2. **फॉरेन्सिक तपासणी**: दस्तऐवजातील खाडाखोड, फॉन्टमधील विसंगती आणि बनावट शिक्के शोधतो.\n` +
          `3. **API पडताळणी**: थेट GST आणि NSDL डेटाबेसशी पडताळणी करतो.\n` +
          `4. **२१४+ नियम तपासणी**: GFR 2017 आणि स्थानिक सामग्री नियमांचे मूल्यमापन करतो.\n` +
          `5. **बिड स्कोअर**: १०० पैकी स्कोअर तयार करतो (Compliant, Flagged किंवा Non-Compliant).\n\n` +
          `*खालील बटणावर क्लिक करून थेट पडताळणी सँडबॉक्स उघडा!*`
    }
  },

  // 7. Seller Registration & Cataloging
  {
    id: 'seller_registration',
    keywords: ['register as a seller', 'seller registration', 'onboarding', 'vendor registration', 'caution money', 'catalog', 'विक्रेता', 'नोंदणी', 'पंजीकरण', 'कैटलॉग'],
    citations: ['GeM Vendor Onboarding Policy 2024', 'GeM Incident Management & Caution Money Policy'],
    actions: [
      { id: 'act_bidder', label: 'Open Seller / Bidder Portal', action: 'NAVIGATE_BIDDER', icon: 'Award' },
      { id: 'act_tenders', label: 'Explore Opportunities', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**Step-by-Step Seller Registration & Onboarding Guide for GeM:**\n\n` +
          `1. **Prerequisites Required**:\n` +
          `   - Aadhaar-linked mobile & PAN of authorized signatory\n` +
          `   - Active GSTIN Certificate (FORM GST REG-06)\n` +
          `   - UDYAM Registration Certificate (for MSME benefits)\n` +
          `   - Bank Account Details & Cancelled Cheque\n` +
          `   - Class-3 Digital Signature Certificate (DSC)\n\n` +
          `2. **Caution Money Deposit Slabs**:\n` +
          `   - **Turnover < ₹1 Crore**: ₹5,000\n` +
          `   - **Turnover ₹1 Cr to ₹10 Cr**: ₹10,000\n` +
          `   - **Turnover > ₹10 Crore**: ₹25,000\n` +
          `   *(100% refundable upon account exit if no active penalties)*\n\n` +
          `3. **Catalog Upload**: Create product pairings, specify OEM authorizations, set pricing below MRP, and map logistics delivery zones.`,
      hi: `**GeM पर विक्रेता (Seller) पंजीकरण और कैटलॉग अपलोड की प्रक्रिया:**\n\n` +
          `1. **आवश्यक दस्तावेज**:\n` +
          `   - अधिकृत हस्ताक्षरकर्ता का आधार व पैन कार्ड\n` +
          `   - सक्रिय GSTIN प्रमाण पत्र\n` +
          `   - UDYAM पंजीकरण (MSME छूट के लिए)\n` +
          `   - बैंक खाता विवरण व कैंसिल्ड चेक\n` +
          `   - क्लास-3 डिजिटल सिग्नेचर सर्टिफिकेट (DSC)\n\n` +
          `2. **कॉशन मनी (Caution Money) स्लैब**:\n` +
          `   - **टर्नओवर ₹1 करोड़ से कम**: ₹5,000\n` +
          `   - **टर्नओवर ₹1 करोड़ से ₹10 करोड़**: ₹10,000\n` +
          `   - **टर्नओवर ₹10 करोड़ से अधिक**: ₹25,000\n\n` +
          `3. **कैटलॉग लिस्टिंग**: अपने उत्पादों की तकनीकी विशेषताएं दर्ज करें, MRP से कम मूल्य निर्धारित करें और डिलीवरी पिन कोड सेट करें।`,
      mr: `**GeM पोर्टलवर विक्रेता (Seller) नोंदणी प्रक्रिया:**\n\n` +
          `1. **आवश्यक कागदपत्रे**:\n` +
          `   - आधार व पॅन कार्ड\n` +
          `   - सक्रिय GSTIN नोंदणी प्रमाणपत्र\n` +
          `   - उद्यम नोंदणी प्रमाणपत्र (MSME सवलतींसाठी)\n` +
          `   - बँक पासबुक किंवा रद्द केलेला धनादेश (Cancelled Cheque)\n` +
          `   - Class-3 DSC टोकन\n\n` +
          `2. **कॉशन मनी ठेव रक्कम**:\n` +
          `   - **टर्नओव्हर ₹१ कोटीपेक्षा कमी**: ₹५,०००\n` +
          `   - **टर्नओव्हर ₹१ ते ₹१० कोटी**: ₹१०,०००\n` +
          `   - **टर्नओव्हर ₹१० कोटींपेक्षा जास्त**: ₹२५,०००\n\n` +
          `3. **कॅटलॉग अपलोड**: उत्पादनांची माहिती जोडा, MRP पेक्षा कमी दर ठेवा आणि पुरवठा क्षेत्र निश्चित करा.`
    }
  },

  // 8. CRAC & 10-Day Payment Timeline
  {
    id: 'crac_payment',
    keywords: ['crac', 'payment', 'timeline', 'consignee receipt', 'delayed payment', 'pfms', '10 days', 'पेमेंट', 'भुगतान', 'सीआरएसी'],
    citations: ['GeM General Terms & Conditions (GTC) Clause 12', 'MoF OM on Timely Payments on GeM'],
    actions: [
      { id: 'act_buyer', label: 'View Buyer Contract Ledger', action: 'NAVIGATE_BUYER', icon: 'PlusCircle' },
      { id: 'act_bidder', label: 'Check Bidder Invoices', action: 'NAVIGATE_BIDDER', icon: 'Award' }
    ],
    responses: {
      en: `**CRAC (Consignee Receipt & Acceptance Certificate) & 10-Day Payment Protocol:**\n\n` +
          `1. **Provisional Receipt Certificate (PRC)**: Consignee issues PRC within **48 hours** of physical goods arrival at the site.\n\n` +
          `2. **Mandatory 10-Day CRAC Window**: Consignee must complete technical inspection and generate CRAC within **10 calendar days** of delivery [GTC Clause 12].\n\n` +
          `3. **Auto-CRAC Deemed Approval**: If the consignee does not accept or reject goods within 10 days, the GeM portal triggers **Auto-CRAC (Deemed Acceptance)**, approving the delivery automatically.\n\n` +
          `4. **10-Day Payment Disbursement**: Buyers must disburse 100% payment within **10 days of CRAC generation** via PFMS / Treasury integration.\n\n` +
          `5. **Penal Interest for Delay**: Government buyers delaying payments beyond 10 days of CRAC are liable to pay **1% monthly penal interest** directly to the seller.`,
      hi: `**CRAC (कंसाइनी प्राप्ति व स्वीकृति प्रमाण पत्र) और 10-दिवसीय भुगतान नियम:**\n\n` +
          `1. **अस्थायी प्राप्ति (PRC)**: सामान प्राप्त होने के 48 घंटों के भीतर कंसाइनी PRC जारी करता है।\n\n` +
          `2. **10 दिनों में CRAC अनिवार्य**: माल की जांच पूरी करके डिलीवरी के **10 दिनों के भीतर CRAC जारी करना कानूनी रूप से अनिवार्य** है।\n\n` +
          `3. **ऑटो-CRAC (Auto-CRAC)**: यदि खरीदार 10 दिनों में माल स्वीकार या अस्वीकार नहीं करता, तो पोर्टल **स्वतः ऑटो-CRAC जारी कर देता है**।\n\n` +
          `4. **10 दिनों में भुगतान**: CRAC बनने के 10 दिनों के भीतर PFMS के जरिए विक्रेता के बैंक खाते में पूरा भुगतान होना चाहिए।\n\n` +
          `5. **देरी पर 1% ब्याज**: यदि खरीदार भुगतान में 10 दिन से अधिक देरी करता है, तो विक्रेता को **1% प्रति माह की दर से ब्याज** देय होता है।`,
      mr: `**CRAC आणि १० दिवसांत देयकांचे नियम (Payment Rules):**\n\n` +
          `1. **PRC पावती**: माल पोहोचल्यानंतर ४८ तासांत PRC दिली जाते.\n\n` +
          `2. **१० दिवसांत CRAC अनिवार्य**: मालाची तपासणी करून १० दिवसांच्या आत CRAC देणे बंधनकारक आहे.\n\n` +
          `3. **Auto-CRAC**: जर खरेदीदाराने १० दिवसांत नकार दिला नाही, तर पोर्टल आपोआप **Auto-CRAC मंजूर करते**.\n\n` +
          `4. **१० दिवसांत १००% पेमेंट**: CRAC दिल्यानंतर पुढील १० दिवसांत PFMS द्वारे पूर्ण पेमेंट जमा केले जाते.\n\n` +
          `5. **विलंबासाठी १% व्याज**: पेमेंटला उशीर झाल्यास सरकारी खरेदीदाराला **१% मासिक दराने दंडनीय व्याज** विक्रेत्यास द्यावे लागते.`
    }
  },

  // 9. Buyer Tender Publishing Workflow
  {
    id: 'buyer_workflow',
    keywords: ['buyer', 'create tender', 'publish tender', 'publish bid', 'boq', 'procurement officer', 'क्रेता', 'टेंडर बनाना', 'खरेदीदार', 'निविदा प्रसिद्ध करा'],
    citations: ['GeM Buyer Manual 2024', 'GFR 2017 Chapter 6'],
    actions: [
      { id: 'act_buyer', label: 'Create New Bid / Tender', action: 'NAVIGATE_BUYER', icon: 'PlusCircle' },
      { id: 'act_tenders', label: 'View Published Bids', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**Government Buyer Workflow: Creating & Publishing Tenders on GeM:**\n\n` +
          `1. **Account Roles**: Ensure Primary User (HOD) has delegated Buyer, Consignee, and PAO/DDO roles.\n` +
          `2. **Define Procurement Scope**: Select verified product/service category, enter Bill of Quantities (BOQ) specifications, and attach terms.\n` +
          `3. **Set Compliance Criteria**:\n` +
          `   - Define MII minimum requirement (Class-I only or Class-I & II)\n` +
          `   - Specify minimum annual turnover and past experience criteria\n` +
          `   - Mandate required compliance documents (GST, PAN, UDYAM, CA Statement)\n` +
          `4. **Publish Bid**: Bids must remain open for **minimum 10 to 21 days** for public participation.\n` +
          `5. **Autonomous Evaluation**: Review AI compliance dossiers and award L1 contract to winning compliant vendor.`,
      hi: `**सरकारी क्रेता (Buyer) के लिए GeM पर टेंडर बनाने और प्रकाशित करने की प्रक्रिया:**\n\n` +
          `1. **भूमिका सत्यापन**: प्राथमिक उपयोगकर्ता (HOD) द्वारा अधिकृत क्रेता और कंसाइनी क्रेडेंशियल्स सुनिश्चित करें।\n` +
          `2. **टेंडर विवरण**: श्रेणी का चयन करें, BOQ मात्रा और तकनीकी विशिष्टताएं दर्ज करें।\n` +
          `3. **अनुपालन मानदंड निर्धारित करें**:\n` +
          `   - मेक इन इंडिया स्थानीय सामग्री (Class-I / Class-II) आवश्यकता\n` +
          `   - न्यूनतम टर्नओवर और अनुभव वर्ष\n` +
          `   - अनिवार्य दस्तावेज (PAN, GSTIN, UDYAM, CA स्टेटमेंट)\n` +
          `4. **टेंडर प्रकाशित करें**: बोलीदाताओं के आवेदन के लिए न्यूनतम 10 से 21 दिनों का समय दें।\n` +
          `5. **AI समीक्षा व L1 चयन**: हमारे AI डोजियर की मदद से सबसे कम दर वाले पात्र L1 विक्रेता को आर्डर जारी करें।`,
      mr: `**सरकारी खरेदीदारांसाठी GeM वर टेंडर तयार करण्याची प्रक्रिया:**\n\n` +
          `1. **नोंदणी**: HOD खात्याद्वारे नियुक्त खरेदीदार खात्यातून लॉगिन करा.\n` +
          `2. **तपशील जोडा**: श्रेणी निवडून BOQ तपशील आणि तांत्रिक अटी टाका.\n` +
          `3. **अटी निश्चित करा**: मेक इन इंडिया %, किमान टर्नओव्हर आणि आवश्यक कागदपत्रे जोडा.\n` +
          `4. **निविदा प्रसिद्ध करा**: बोलीदारांसाठी किमान १० ते २१ दिवस मुदत द्या.\n` +
          `5. **L1 निवड**: AI पडताळणी अहवाल तपासून सर्वात कमी दराच्या L1 विक्रेत्याला कंत्राट द्या.`
    }
  },

  // 10. Land Border Restrictions (Rule 144(xi))
  {
    id: 'land_border',
    keywords: ['border', '144(xi)', 'land border', 'china', 'chinese', 'land border sharing', 'foreign bidder', 'competent authority', 'सीमावर्ती देश', 'जमीन सीमा', 'सीमा सामायिक'],
    citations: ['GFR 2017 Rule 144(xi)', 'Ministry of Finance OM F.No.6/18/2019-PPD'],
    actions: [
      { id: 'act_verify', label: 'Verify Bidder Eligibility', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' }
    ],
    responses: {
      en: `**Restrictions on Procurement from Land Border Countries [GFR Rule 144(xi)]:**\n\n` +
          `• Any bidder from a country sharing a land border with India is eligible to bid on GeM **ONLY if registered with the Competent Authority (DPIIT Registration Committee)**.\n` +
          `• Political clearance from the Ministry of External Affairs (MEA) and security clearance from the Ministry of Home Affairs (MHA) are mandatory.\n` +
          `• All bidders must submit an affirmative compliance declaration in every tender.\n` +
          `• False declarations result in immediate bid rejection, contract cancellation, and statutory debarment.`,
      hi: `**भारत के साथ भूमि सीमा साझा करने वाले देशों से खरीद पर प्रतिबंध [GFR 144(xi)]:**\n\n` +
          `• भारत के साथ सीमा साझा करने वाले देशों का कोई भी विक्रेता GeM पर तभी बोली लगा सकता है जब वह **DPIIT सक्षम प्राधिकारी से पंजीकृत हो**।\n` +
          `• विदेश मंत्रालय (MEA) और गृह मंत्रालय (MHA) से सुरक्षा मंजूरी अनिवार्य है।\n` +
          `• प्रत्येक टेंडर में सभी बोलीदाताओं द्वारा स्व-घोषणा प्रमाण पत्र देना अनिवार्य है।`,
      mr: `**जमीन सीमा सामायिक करणाऱ्या देशांकडून खरेदीवरील निर्बंध [GFR 144(xi)]:**\n\n` +
          `• भारताशी भू-सीमा जोडलेल्या देशांतील कंपन्यांना GeM वर बोली लावण्यासाठी **DPIIT नोंदणी समितीची पूर्वपरवानगी** आवश्यक आहे.\n` +
          `• गृह मंत्रालय व परराष्ट्र मंत्रालयाची सुरक्षा मंजुरी अनिवार्य आहे.`
    }
  },

  // 11. Global Tender Enquiry (GTE) Ban
  {
    id: 'gte_ban',
    keywords: ['gte', 'global tender', '200 crore', '200 cr', 'ग्लोबल टेंडर', 'जागतिक निविदा'],
    citations: ['GFR 2017 Rule 161(iv)', 'Cabinet Aatmanirbhar Bharat Directive'],
    actions: [
      { id: 'act_schemes', label: 'Explore Make in India Initiatives', action: 'NAVIGATE_SCHEMES', icon: 'Award' }
    ],
    responses: {
      en: `**Ban on Global Tender Enquiries (GTE) up to ₹200 Crores [GFR Rule 161(iv)]:**\n\n` +
          `• In alignment with the Aatmanirbhar Bharat initiative, **no Global Tender Enquiries can be floated for procurements below ₹200 Crores**.\n` +
          `• All tenders below ₹200 Cr are strictly reserved for domestic Indian suppliers.\n` +
          `• Exceptional cases require prior personal approval from the Secretary (Expenditure), Ministry of Finance.`,
      hi: `**₹200 करोड़ तक के टेंडरों में ग्लोबल टेंडर (GTE) पर प्रतिबंध [Rule 161(iv)]:**\n\n` +
          `• आत्मनिर्भर भारत अभियान के तहत, ₹200 करोड़ से कम मूल्य की किसी भी सरकारी खरीद के लिए **वैश्विक निविदाएं (GTE) जारी करने पर पूर्ण प्रतिबंध** है।\n` +
          `• ₹200 करोड़ तक की सभी खरीद केवल भारतीय घरेलू निर्माताओं के लिए आरक्षित है।`,
      mr: `**₹२०० कोटींपर्यंतच्या खरेदीसाठी ग्लोबल टेंडरवर बंदी [Rule 161(iv)]:**\n\n` +
          `• आत्मनिर्भर भारताच्या धोरणानुसार, ₹२०० कोटींपेक्षा कमी किमतीच्या खरेदीसाठी **कोणतेही ग्लोबल टेंडर (GTE) काढण्यास बंदी** आहे.\n` +
          `• ही सर्व कामे केवळ भारतीय देशांतर्गत कंपन्यांसाठी राखीव आहेत.`
    }
  },

  // 12. EMD & e-PBG Performance Security
  {
    id: 'emd_pbg',
    keywords: ['pbg', 'performance security', 'bank guarantee', 'security deposit', 'beng', 'ईएमडी', 'सुरक्षा जमा'],
    citations: ['GFR 2017 Rule 170 & 171', 'DoE Guidelines on Security Deposits'],
    actions: [
      { id: 'act_verify', label: 'Verify EMD Status', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' }
    ],
    responses: {
      en: `**EMD and Performance Security (e-PBG) Regulations on GeM:**\n\n` +
          `1. **Earnest Money Deposit (EMD)**: Typically **2% to 5%** of estimated value. All MSEs and DPIIT Startups are **100% exempt** [Rule 170(i)].\n\n` +
          `2. **Performance Bank Guarantee (e-PBG)**: Successful L1 awardee must submit **3% to 5%** of total contract value within 15 days of order.\n\n` +
          `3. **Validity Period**: e-PBG must remain valid for **contract duration + 60 days** beyond warranty/completion obligation.\n\n` +
          `4. **Refund**: EMD is refunded to unsuccessful bidders within 30 days of contract award.`,
      hi: `**GeM पर EMD और परफॉर्मेंस सिक्योरिटी (e-PBG) के नियम:**\n\n` +
          `1. **ईएमडी (बयाना राशि)**: अनुमानित मूल्य का **2% से 5%**। MSME और स्टार्टअप्स को 100% छूट प्राप्त है।\n` +
          `2. **e-PBG (परफॉर्मेंस गारंटी)**: सफल L1 विक्रेता को कुल अनुबंध मूल्य का **3% से 5%** जमा करना होता है।\n` +
          `3. **वैधता**: अनुबंध समाप्ति और वारंटी अवधि के बाद कम से कम **60 दिनों तक वैध** रहनी चाहिए।`,
      mr: `**EMD आणि e-PBG परफॉरमन्स गॅरंटी नियम:**\n\n` +
          `1. **EMD (बयाणा रक्कम)**: २% ते ५% असते. MSME आणि स्टार्टअप्सना पूर्ण सूट आहे.\n` +
          `2. **e-PBG**: काम मिळाल्यावर कंत्राट मूल्याच्या **३% ते ५% बँक हमी** द्यावी लागते.\n` +
          `3. **मुदत**: काम पूर्ण झाल्यावर वॉरंटीनंतर किमान ६० दिवस वैध असावी लागते.`
    }
  },

  // 13. Categories & Products
  {
    id: 'categories',
    keywords: ['category', 'categories', 'furniture', 'computers', 'hardware', 'oxygen', 'medical', 'services', 'cloud', 'श्रेणी', 'उत्पाद'],
    citations: ['GeM Category Master Catalog 2026'],
    actions: [
      { id: 'act_cat', label: 'Browse Category Catalog', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
    ],
    responses: {
      en: `**GeM Verified Product & Service Categories:**\n\n` +
          `• **IT & Hardware**: AI Workstations, High-Density Servers, SAN Storage Arrays, Laptops, Network Firewalls.\n` +
          `• **Medical & Healthcare**: D-Type Oxygen Cylinders, ICU Ventilators, Hospital Modular Beds, Diagnostic Reagents.\n` +
          `• **Modular Furniture**: Executive Mesh Chairs, Linear Office Workstations, Conference Tables.\n` +
          `• **Specialized Services**: Cloud & Hosting Infrastructure, Vehicle Hiring & Transport, Security Manpower, Sanitation & Housekeeping.\n\n` +
          `*All categories include pre-configured Bureau of Indian Standards (BIS) and GFR compliance criteria.*`,
      hi: `**GeM पर सत्यापित उत्पाद व सेवा श्रेणियां:**\n\n` +
          `• **IT व हार्डवेयर**: AI वर्कस्टेशन, सर्वर, SAN स्टोरेज, लैपटॉप, नेटवर्क फायरवॉल।\n` +
          `• **चिकित्सा व स्वास्थ्य**: D-टाइप ऑक्सीजन सिलेंडर, वेंटिलेटर, अस्पताल बेड, डायग्नोस्टिक किट।\n` +
          `• **फर्नीचर**: मॉड्यूलर ऑफिस वर्कस्टेशन, एग्जीक्यूटिव कुर्सियां।\n` +
          `• **सेवाएं**: क्लाउड होस्टिंग, वाहन हायरिंग, सुरक्षा गार्ड और हाउसकीपिंग।`,
      mr: `**GeM वरील सत्यापित उत्पादने व सेवा श्रेणी:**\n\n` +
          `• **IT हार्डवेअर**: AI वर्कस्टेशन्स, सर्व्हर्स, स्टोरेज, लॅपटॉप्स.\n` +
          `• **वैद्यकीय उपकरणे**: ऑक्सिजन सिलिंडर, व्हेंटिलेटर, हॉस्पिटल बेड्स.\n` +
          `• **फर्निचर**: मॉड्यूलर वर्कस्टेशन्स, चेअर्स.\n` +
          `• **सेवा**: क्लाउड होस्टिंग, वाहन भाड्याने देणे, सुरक्षा रक्षक व स्वच्छता सेवा.`
    }
  }
];

/**
 * Intelligent domain response matcher that evaluates query context,
 * resolves preinstalled chip queries or custom typed text,
 * and returns rich, localized answers.
 */
export function getSmartGeMResponse(query, language = 'en') {
  const cleanQuery = (query || '').trim();
  const qLower = cleanQuery.toLowerCase();
  const lang = ['hi', 'mr', 'en'].includes(language) ? language : 'en';

  // Helper for safe word-boundary matching on short acronyms like 'ra', 'h1', 'l1', etc.
  const hasKeyword = (kw, text) => {
    const trimmed = kw.trim();
    if (!trimmed) return false;
    if (trimmed.length <= 3) {
      const reg = new RegExp(`(^|[^a-zA-Z0-9])${trimmed}([^a-zA-Z0-9]|$)`, 'i');
      return reg.test(text);
    }
    return text.includes(trimmed);
  };

  // 1. Scored weighted match with knowledge topics
  let bestTopic = null;
  let highestScore = 0;

  for (const topic of GEMMY_KNOWLEDGE_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (hasKeyword(kw, qLower)) {
        score += kw.length >= 6 ? 10 : (kw.length >= 4 ? 5 : 2);
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && highestScore > 0) {
    return {
      reply: bestTopic.responses[lang] || bestTopic.responses.en,
      citations: bestTopic.citations,
      actions: bestTopic.actions,
      model: 'GeMMy-AI-RuleEngine-v2.5'
    };
  }

  // 2. Greetings and polite interaction
  if (qLower.match(/^(hi|hello|hey|namaste|greetings|hola|good\s+(morning|afternoon|evening)|नमस्कार|नमस्ते|हॅलो)/i)) {
    if (lang === 'hi') {
      return {
        reply: `**नमस्ते! मैं 'Ask GeMMy' हूँ — आपका GeM AI अधिप्राप्ति व GFR अनुपालन सहायक।**\n\n` +
               `मैं सरकारी खरीद, GFR 2017 नियमों, मेक इन इंडिया, बिड मूल्यांकन और रिवर्स ऑक्शन से संबंधित आपके सभी प्रश्नों के उत्तर दे सकता हूँ।\n\n` +
               `**आप मुझसे पूछ सकते हैं:**\n` +
               `• GeM पर डायरेक्ट परचेस और L1 तुलना की सीमाएं क्या हैं?\n` +
               `• MSME और स्टार्टअप्स के लिए EMD में क्या छूट है?\n` +
               `• AI कार्टेल डिटेक्शन कैसे काम करता है?\n` +
               `• क्लास-I और क्लास-II मेक इन इंडिया आपूर्तिकर्ता के नियम क्या हैं?`,
        citations: ['GFR 2017', 'GeM Guidelines 2024'],
        actions: [
          { id: 'act_v', label: 'लाइव बिड सत्यापन सैंडबॉक्स', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
          { id: 'act_t', label: 'सक्रिय टेंडर देखें', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
        ],
        model: 'GeMMy-AI-v2.5'
      };
    } else if (lang === 'mr') {
      return {
        reply: `**नमस्कार! मी 'Ask GeMMy' — आपला GeM AI खरेदी सहाय्यक आहे.**\n\n` +
               `मी सरकारी खरेदी, GFR 2017 नियम, मेक इन इंडिया धोरण, बिड पडताळणी आणि रिव्हर्स ऑक्शनशी संबंधित आपल्या सर्व प्रश्नांची अचूक उत्तरे देतो.\n\n` +
               `**तुम्ही मला विचारू शकता:**\n` +
               `• GeM वर थेट खरेदी आणि L1 मर्यादा काय आहेत?\n` +
               `• MSME आणि स्टार्टअप्सना EMD मध्ये काय सवलती मिळतात?\n` +
               `• AI कार्टेल डिटेक्टर मिलीभगत कशी शोधतो?\n` +
               `• Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम काय आहेत?`,
        citations: ['GFR 2017', 'GeM Guidelines 2024'],
        actions: [
          { id: 'act_v', label: 'थेट बिड पडताळणी सँडबॉक्स', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
          { id: 'act_t', label: 'थेट निविदा शोधा', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
        ],
        model: 'GeMMy-AI-v2.5'
      };
    } else {
      return {
        reply: `**Hello! I am 'Ask GeMMy (Powered by AI)' — your GeM Procurement Intelligence Assistant.**\n\n` +
               `I provide verified, end-to-end guidance on Government e-Marketplace procurement, GFR 2017 compliance, DPIIT Make in India criteria, and automated bid forensics.\n\n` +
               `**Popular questions you can explore:**\n` +
               `• GFR Rule 149 Direct Purchase & L1 comparison thresholds\n` +
               `• Class-I & Class-II Make in India local content percentages\n` +
               `• EMD & turnover exemptions for MSMEs and DPIIT Startups\n` +
               `• Anti-cartel graph detection & reverse auction timer rules\n` +
               `• Live bid verification testing in the Sandbox`,
        citations: ['GFR 2017 Rule 149', 'GeM Guidelines 2024'],
        actions: [
          { id: 'act_v', label: 'Live Bid Verification Sandbox', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
          { id: 'act_t', label: 'Browse Active Tenders', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
        ],
        model: 'GeMMy-AI-v2.5'
      };
    }
  }

  // 3. Fallback with context guidance
  if (lang === 'hi') {
    return {
      reply: `**प्रश्न: "${cleanQuery}" के संबंध में GeM अधिप्राप्ति निर्देश:**\n\n` +
             `GeM पोर्टल पर सभी सरकारी खरीद **सामान्य वित्तीय नियमावली (GFR 2017)** और DPIIT के दिशा-निर्देशों द्वारा संचालित होती हैं:\n\n` +
             `• **खरीद सीमाएं**: ₹25,000 तक डायरेक्ट परचेस, ₹5 लाख तक L1 तुलना, और ₹5 लाख से ऊपर अनिवार्य बिडिंग/RA [GFR 149] लागू होता है।\n` +
             `• **स्थानीय वरीयता**: मेक इन इंडिया Class-I (≥50% सामग्री) विक्रेताओं को 20% का खरीद वरीयता मार्जिन मिलता है।\n` +
             `• **छूट**: वैध UDYAM वाले MSEs और मान्यता प्राप्त स्टार्टअप्स को EMD और पूर्व अनुभव से छूट प्राप्त है।\n\n` +
             `*क्या आप किसी विशेष नियम, बिड सत्यापन या टेंडर श्रेणी के बारे में विस्तार से जानना चाहते हैं?*`,
      citations: ['GFR 2017 Rule 149', 'GeM GTC 2024'],
      actions: [
        { id: 'act_v', label: 'लाइव बिड सत्यापन सैंडबॉक्स', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
        { id: 'act_t', label: 'टेंडर खोजें', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
      ],
      model: 'GeMMy-AI-v2.5'
    };
  } else if (lang === 'mr') {
    return {
      reply: `**प्रश्न: "${cleanQuery}" बाबत GeM सरकारी खरेदी मार्गदर्शक:**\n\n` +
             `GeM पोर्टलवरील सर्व खरेदी **सामान्य वित्तीय नियम (GFR 2017)** आणि DPIIT धोरणांनुसार होते:\n\n` +
             `• **खरेदी मर्यादा**: ₹२५,००० पर्यंत थेट खरेदी, ₹५ लाखांपर्यंत L1 तुलना, आणि ₹५ लाखांपेक्षा जास्त रकमेसाठी अनिवार्य निविदा किंवा रिव्हर्स ऑक्शन लागू होते.\n` +
             `• **स्थानिक प्राधान्य**: Make in India Class-I (≥५०% स्थानिक सामग्री) पुरवठादारांना २०% खरेदी प्राधान्य मिळते.\n` +
             `• **सवलती**: नोंदणीकृत सूक्ष्म/लघु उद्योगांना (MSEs) EMD मधून १००% सूट आहे.\n\n` +
             `*आपणास कोणत्याही विशिष्ट नियमाबद्दल किंवा निविदा पडताळणीबद्दल अधिक जाणून घ्यायचे आहे का?*`,
      citations: ['GFR 2017 Rule 149', 'GeM GTC 2024'],
      actions: [
        { id: 'act_v', label: 'थेट बिड पडताळणी सँडबॉक्स', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
        { id: 'act_t', label: 'निविदा शोधा', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
      ],
      model: 'GeMMy-AI-v2.5'
    };
  } else {
    return {
      reply: `**GeM Procurement Guidance for: "${cleanQuery}":**\n\n` +
             `All procurement on the Government e-Marketplace is governed by **General Financial Rules (GFR 2017)** and statutory DPIIT orders:\n\n` +
             `• **Procurement Thresholds**: Up to ₹25,000 via Direct Purchase, ₹25,000 to ₹5,00,000 via L1 comparison of 3 OEMs, and above ₹5,00,000 via mandatory electronic bidding / Reverse Auction [GFR Rule 149].\n` +
             `• **Make in India**: Class-I local suppliers (≥50% local content) receive a 20% margin of purchase preference over non-local suppliers.\n` +
             `• **MSME Benefits**: 100% EMD waiver and prior turnover/experience relaxation are available for UDYAM-registered MSEs and DPIIT Startups.\n` +
             `• **Payment Protection**: Buyers must issue CRAC within 10 days of delivery and settle payments within 10 days via PFMS, or face 1% monthly penal interest.\n\n` +
             `*Would you like more specific assistance with bidding, compliance verification, or reverse auction rules?*`,
      citations: ['GFR 2017 Rule 149', 'GeM GTC 2024', 'DPIIT MII Policy'],
      actions: [
        { id: 'act_v', label: 'Live Bid Verification Sandbox', action: 'OPEN_VERIFIER', icon: 'ShieldCheck' },
        { id: 'act_t', label: 'Browse Active Tenders', action: 'NAVIGATE_TENDERS', icon: 'FileText' }
      ],
      model: 'GeMMy-AI-v2.5'
    };
  }
}
