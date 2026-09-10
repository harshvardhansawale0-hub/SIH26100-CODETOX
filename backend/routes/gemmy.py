"""
Ask GeMMy AI Router - Government e-Marketplace (GeM) AI Procurement Assistant
Powered by Groq LLM Inference (qwen/qwen3.8-27b) with robust domain fallback.
Supports English, Hindi, and Marathi.
"""
import os
import json
import re
import urllib.request
import urllib.error
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/gemmy", tags=["Ask GeMMy AI"])

# Models
class ChatMessage(BaseModel):
    role: str  # 'user', 'assistant', 'system'
    content: str

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # "en", "hi", "mr"
    role: Optional[str] = "public"  # "buyer", "bidder", "public", "officer"
    history: Optional[List[ChatMessage]] = []

class ActionCard(BaseModel):
    id: str
    label: str
    action: str  # "NAVIGATE_TENDERS", "OPEN_VERIFIER", "NAVIGATE_AUCTIONS", "NAVIGATE_BUYER", "NAVIGATE_BIDDER", "NAVIGATE_SCHEMES"
    param: Optional[str] = None
    icon: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    language: str
    model: str
    citations: List[str]
    actions: List[ActionCard]
    timestamp: str

SYSTEM_PROMPT = """You are 'Ask GeMMy (Powered by AI)', the premier AI Conversational Procurement Assistant for the Government e-Marketplace (GeM), Ministry of Commerce & Industry, Government of India.

Your core mission: Assist government buyers, sellers, MSMEs, startups, and compliance officers with absolute accuracy on GeM procurement, GFR 2017 rules, DPIIT Make in India policies, anti-cartel vigilance, and platform workflows.

Key Domain Knowledge to strictly apply:
1. GFR 2017 Rule 149 (Mandatory Procurement through GeM):
   - Direct Purchase: Up to Rs 25,000 through any available supplier meeting technical specs.
   - L1 Comparison: Rs 25,000 to Rs 5,00,000 among at least 3 distinct manufacturers/sellers.
   - Mandatory Bidding / Reverse Auction (RA): Above Rs 5,00,000.
2. GFR 2017 Rule 144(xi): Restrictions on procurement from countries sharing a land border with India (prior registration with DPIIT competent authority mandatory).
3. DPIIT Make in India (MII) Order:
   - Class-I Local Supplier: Local content >= 50% (entitled to 20% margin of purchase preference).
   - Class-II Local Supplier: Local content >= 20% and < 50% (eligible to bid, but no purchase preference where domestic capacity exists).
   - Non-Local Supplier: Local content < 20%.
   - Global Tender Enquiry (GTE) banned up to Rs 200 Crores (Rule 161(iv)).
4. MSME & Startup Exemptions:
   - Exemption from prior experience and prior turnover criteria (as per MoF OM & DPIIT guidelines).
   - 100% EMD (Earnest Money Deposit) exemption under GFR Rule 170(i).
   - 25% annual procurement reservation from MSEs (including 4% SC/ST and 3% Women MSEs).
5. Anti-Cartel & Forensic Oversight:
   - Cartels detected via shared Digital Signature Certificates (DSC), common IP/MAC subnets, identical timing, and coordinated price clustering within narrow margins (<0.5%).
6. Reverse Auction (RA):
   - Dynamic auto-extension of 10-15 minutes if bids placed in the last 10 minutes.
   - Elimination rules (H1 bidder elimination if >=4 qualified bidders).
7. Payment & CRAC:
   - Consignee Receipt and Acceptance Certificate (CRAC) must be issued within 10 days of delivery.
   - Automatic bill processing and interest for delayed payments beyond 10 days.

Language Policy:
- If language is 'hi' or user writes in Hindi: Respond in high quality, polite, fluent HINDI (Devanagari script).
- If language is 'mr' or user writes in Marathi: Respond in high quality, polite, fluent MARATHI (Devanagari script).
- If language is 'en': Respond in fluent, professional ENGLISH.
- Include official legal citations in brackets, e.g. [GFR 2017 Rule 149(i)], [DPIIT Order P-45021], [MSME Act 2006].
- Format cleanly with bullet points, bold highlights, and brief actionable summaries.
"""

def detect_actions(query: str, reply: str, language: str) -> List[ActionCard]:
    """Identify smart platform action shortcuts from query context."""
    actions = []
    q_lower = query.lower()
    
    # Check for live bid verification / test sandbox intent
    if any(k in q_lower for k in ["verify", "sandbox", "check bid", "fraud", "ocr", "shortfall", "score", "दोष", "तपासा", "पडताळणी", "सत्यापन"]):
        label = "Live Bid Verification Sandbox"
        if language == "hi":
            label = "लाइव बिड सत्यापन सैंडबॉक्स खोलें"
        elif language == "mr":
            label = "थेट बिड पडताळणी सँडबॉक्स उघडा"
        actions.append(ActionCard(id="action_verify", label=label, action="OPEN_VERIFIER", icon="ShieldCheck"))

    # Check for tenders search
    if any(k in q_lower for k in ["tender", "bid", "search", "oxygen", "medical", "it", "कॉन्ट्रॅक्ट", "निविदा", "टेंडर"]):
        label = "Explore Live Tenders"
        if language == "hi":
            label = "लाइव टेंडर देखें"
        elif language == "mr":
            label = "थेट निविदा शोधा"
        actions.append(ActionCard(id="action_tenders", label=label, action="NAVIGATE_TENDERS", icon="FileText"))

    # Check for auction or cartel analysis
    if any(k in q_lower for k in ["cartel", "auction", "reverse auction", "ra", "collusion", "सिंडिकेट", "लिलाव", "कार्टेल"]):
        label = "Reverse Auction & Cartel Graph"
        if language == "hi":
            label = "रिवर्स ऑक्शन व कार्टेल ग्राफ"
        elif language == "mr":
            label = "रिव्हर्स ऑक्शन आणि कार्टेल ग्राफ"
        actions.append(ActionCard(id="action_auctions", label=label, action="NAVIGATE_AUCTIONS", icon="TrendingDown"))

    # Check for MSME schemes
    if any(k in q_lower for k in ["msme", "startup", "saras", "scheme", "women", "उद्यम", "योजना"]):
        label = "MSME & Startup Initiatives"
        if language == "hi":
            label = "एमएसएमई व स्टार्टअप योजनाएं"
        elif language == "mr":
            label = "एमएसएमई आणि स्टार्टअप उपक्रम"
        actions.append(ActionCard(id="action_schemes", label=label, action="NAVIGATE_SCHEMES", icon="Award"))

    # Check for buyer / publishing tender
    if any(k in q_lower for k in ["buyer", "publish", "create tender", "खरेदीदार", "बायर्स"]):
        label = "Buyer Portal & Create Tender"
        if language == "hi":
            label = "खरीदार पोर्टल व नया टेंडर"
        elif language == "mr":
            label = "खरेदीदार पोर्टल आणि नवीन निविदा"
        actions.append(ActionCard(id="action_buyer", label=label, action="NAVIGATE_BUYER", icon="PlusCircle"))

    return actions

def get_offline_response(query: str, language: str) -> Dict[str, Any]:
    """High-accuracy fallback knowledge engine for GeM & GFR procurement rules."""
    def has_kw(k: str) -> bool:
        if len(k) <= 3:
            return bool(re.search(rf"\b{re.escape(k)}\b", q_lower))
        return k in q_lower

    # Check for Greetings / Identity
    if any(has_kw(k) for k in ["hi", "hello", "hey", "namaste", "who are you", "who r u", "about you", "नमस्ते", "नमस्कार", "कोण आहेस"]):
        if language == "hi":
            reply = (
                "**नमस्ते! मैं 'Ask GeMMy (AI)' हूँ — GeM अधिप्राप्ति सहायक।**\n\n"
                "मैं सरकारी खरीद, GFR 2017 नियमों, DPIIT मेक इन इंडिया, बिड मूल्यांकन और रिवर्स ऑक्शन से संबंधित आपके सभी प्रश्नों के सटीक उत्तर देता हूँ।\n\n"
                "**आप मुझसे पूछ सकते हैं:**\n"
                "• GeM पर डायरेक्ट परचेस और L1 की सीमाएं क्या हैं?\n"
                "• मेक इन इंडिया Class-I व Class-II सप्लायर के नियम क्या हैं?\n"
                "• MSME और स्टार्टअप्स के लिए EMD व टर्नओवर में क्या छूट है?\n"
                "• रिवर्स ऑक्शन (RA) के नियम और 10-मिनट विस्तार कैसे काम करता है?\n"
                "• GeM AI एंटी-कार्टेल डिटेक्शन मिलीभगत कैसे पकड़ता है?"
            )
        elif language == "mr":
            reply = (
                "**नमस्कार! मी 'Ask GeMMy (AI)' — आपला GeM खरेदी सहाय्यक आहे.**\n\n"
                "मी सरकारी खरेदी, GFR 2017 नियम, मेक इन इंडिया धोरण, बिड पडताळणी आणि रिव्हर्स ऑक्शनशी संबंधित सर्व प्रश्नांची अचूक उत्तरे देतो.\n\n"
                "**तुम्ही मला विचारू शकता:**\n"
                "• GeM वर थेट खरेदी आणि L1 मर्यादा काय आहेत?\n"
                "• Make in India Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम काय आहेत?\n"
                "• MSME आणि स्टार्टअप्सना EMD मध्ये काय सवलती मिळतात?\n"
                "• रिव्हर्स ऑक्शन (RA) चे नियम आणि वेळ विस्तार कसा चालतो?\n"
                "• AI कार्टेल डिटेक्टर मिलीभगत कशी शोधतो?"
            )
        else:
            reply = (
                "**Hello! I am 'Ask GeMMy (Powered by AI)' — your GeM Procurement Intelligence Assistant.**\n\n"
                "I provide verified, end-to-end guidance on Government e-Marketplace procurement, GFR 2017 compliance, DPIIT Make in India criteria, and automated bid forensics.\n\n"
                "**Popular questions you can explore:**\n"
                "• GFR Rule 149 Direct Purchase & L1 comparison thresholds\n"
                "• Class-I & Class-II Make in India local content percentages\n"
                "• EMD & turnover exemptions for MSMEs and DPIIT Startups\n"
                "• Reverse Auction elimination rules & auto-extension\n"
                "• Anti-cartel graph detection & DSC/IP clustering\n"
                "• Live bid verification testing in the Sandbox"
            )
        return {
            "reply": reply,
            "citations": ["GFR 2017", "GeM Guidelines 2024"],
            "model": "GeMMy-AI-v2.5"
        }

    # 1. GFR Rule 149 / Direct Purchase
    if any(has_kw(k) for k in ["149", "direct purchase", "procurement limit", "threshold", "25000", "500000", "खरेदी मर्यादा", "डायरेक्ट", "थेट खरेदी"]):
        if language == "hi":
            reply = (
                "**GeM पर GFR 2017 नियम 149 के अंतर्गत खरीद सीमाएं:**\n\n"
                "1. **डायरेक्ट परचेस (Direct Purchase - ₹25,000 तक)**: सरकारी क्रेता बिना किसी कोटेशन के GeM पर उपलब्ध किसी भी योग्य विक्रेता से सीधे खरीद कर सकते हैं [GFR Rule 149(i)]।\n\n"
                "2. **L1 मूल्य तुलना (₹25,000 से ₹5,00,000 तक)**: कम से कम 3 अलग-अलग निर्माताओं (OEMs) के उत्पादों की तकनीकी तुलना करके सबसे कम दर (L1) वाले विक्रेता को आर्डर देना अनिवार्य है [GFR Rule 149(ii)]।\n\n"
                "3. **अनिवार्य बिडिंग / रिवर्स ऑक्शन (₹5,00,000 से अधिक)**: ₹5 लाख से अधिक की सभी सरकारी खरीद के लिए GeM पर खुली इलेक्ट्रॉनिक बोली (Bidding) या रिवर्स ऑक्शन (RA) अनिवार्य है [GFR Rule 149(iii)]।"
            )
        elif language == "mr":
            reply = (
                "**GeM पोर्टलवर GFR 2017 नियम 149 नुसार खरेदी मर्यादा:**\n\n"
                "1. **थेट खरेदी (Direct Purchase - ₹२५,००० पर्यंत)**: सरकारी खरेदीदार कोणत्याही पात्र विक्रेत्याकडून थेट कोटेशनशिवाय खरेदी करू शकतात [GFR Rule 149(i)].\n\n"
                "2. **L1 किंमत तुलना (₹२५,००० ते ₹५,००,००० पर्यंत)**: किमान ३ वेगवेगळ्या उत्पादकांच्या (OEMs) उत्पादनांची तुलना करून सर्वात कमी (L1) किमतीत खरेदी करणे बंधनकारक आहे [GFR Rule 149(ii)].\n\n"
                "3. **अनिवार्य निविदा / रिव्हर्स ऑक्शन (₹५,००,००० पेक्षा जास्त)**: ₹५ लाखांपेक्षा जास्त खरेदीसाठी GeM वर खुली इलेक्ट्रॉनिक निविदा किंवा रिव्हर्स ऑक्शन (RA) अनिवार्य आहे [GFR Rule 149(iii)]."
            )
        else:
            reply = (
                "**Procurement Thresholds under GFR 2017 Rule 149 on GeM:**\n\n"
                "1. **Direct Purchase (Up to ₹25,000)**: Any government buyer can purchase goods/services directly through any available GeM supplier meeting technical specifications and delivery terms without floating tenders [GFR Rule 149(i)].\n\n"
                "2. **L1 Price Comparison (₹25,000 to ₹5,00,000)**: Buyers must compare products of at least **3 distinct manufacturers/sellers** on GeM meeting identical specifications and place the order with the lowest compliant (L1) bidder [GFR Rule 149(ii)].\n\n"
                "3. **Mandatory Bidding / Reverse Auction (Above ₹5,00,000)**: Procurements exceeding ₹5 Lakhs must strictly be conducted through **open electronic bidding or Reverse Auction (RA)** on the portal [GFR Rule 149(iii)].\n\n"
                "*Note: For automobiles, the direct purchase limit is extended up to ₹30 Lakhs subject to DGS&D/GeM rate contracts.*"
            )
        citations = ["GFR 2017 Rule 149", "GeM Procurement Manual 2024"]

    # 2. Make in India / DPIIT Local Content
    elif any(k in q_lower for k in ["make in india", "dpiit", "local content", "class 1", "class-i", "class 2", "class-ii", "non-local", "मेक इन इंडिया", "स्थानिक सामग्री"]):
        if language == "hi":
            reply = (
                "**DPIIT मेक इन इंडिया (MII) स्थानीय सामग्री और वरीयता नियम:**\n\n"
                "• **Class-I स्थानीय आपूर्तिकर्ता (स्थानीय सामग्री ≥ 50%)**:\n"
                "  - इन्हें टेंडर में **20% खरीद वरीयता मार्जिन (Purchase Preference)** मिलता है।\n"
                "  - यदि L1 बोलीदाता गैर-स्थानीय है, तो L1+20% के दायरे में आने वाले Class-I सप्लायर को L1 दर पर आर्डर पाने का पहला अवसर मिलता है।\n\n"
                "• **Class-II स्थानीय आपूर्तिकर्ता (स्थानीय सामग्री ≥ 20% और < 50%)**:\n"
                "  - ये बोली लगा सकते हैं लेकिन इन्हें खरीद वरीयता (Preference Margin) का लाभ नहीं मिलता।\n\n"
                "• **Non-Local आपूर्तिकर्ता (स्थानीय सामग्री < 20%)**:\n"
                "  - ₹200 करोड़ तक के सभी टेंडरों में इनके भाग लेने पर पूर्ण प्रतिबंध है (GTE प्रतिबंध [Rule 161(iv)])।"
            )
        elif language == "mr":
            reply = (
                "**DPIIT मेक इन इंडिया (MII) स्थानिक सामग्री धोरण:**\n\n"
                "• **Class-I स्थानिक पुरवठादार (स्थानिक सामग्री ≥ ५०%)**:\n"
                "  - यांना निविदेमध्ये **२०% खरेदी प्राधान्य मार्जिन (Purchase Preference)** मिळते.\n"
                "  - जर L1 पुरवठादार स्थानिक नसेल, तर L1+20% मधील Class-I पुरवठादारास L1 दराने काम स्वीकारण्याची संधी दिली जाते.\n\n"
                "• **Class-II स्थानिक पुरवठादार (स्थानिक सामग्री ≥ २०% आणि < ५०%)**:\n"
                "  - हे निविदेत भाग घेऊ शकतात, परंतु यांना खरेदी प्राधान्य मिळत नाही.\n\n"
                "• **Non-Local पुरवठादार (स्थानिक सामग्री < २०%)**:\n"
                "  - ₹२०० कोटींपर्यंतच्या सर्व सरकारी खरेदीमध्ये यांच्यावर पूर्ण बंदी आहे (GTE बंदी [Rule 161(iv)])."
            )
        else:
            reply = (
                "**DPIIT Public Procurement (Preference to Make in India) Policy:**\n\n"
                "• **Class-I Local Supplier (Local Content ≥ 50%)**:\n"
                "  - Receives **20% Margin of Purchase Preference** (L1 + 20% window).\n"
                "  - If lowest bid (L1) is non-local, Class-I supplier within L1+20% is invited to match L1 price for contract award.\n\n"
                "• **Class-II Local Supplier (Local Content ≥ 20% and < 50%)**:\n"
                "  - Eligible to participate in domestic tenders where local availability exists, but **no purchase preference** is granted.\n\n"
                "• **Non-Local Supplier (Local Content < 20%)**:\n"
                "  - Banned from participating in government tenders up to **₹200 Crores** under Global Tender Enquiry (GTE) restrictions [Rule 161(iv)].\n\n"
                "*Verification: Self-certification permitted up to ₹10 Cr; CA/Cost Auditor audited declaration mandatory above ₹10 Cr.*"
            )
        citations = ["DPIIT Order P-45021/2/2017-PP", "Public Procurement Order 2017", "GFR Rule 161(iv)"]

    # 3. MSME & Startup Exemptions
    elif any(k in q_lower for k in ["msme", "startup", "emd", "turnover", "udyam", "relax", "waiver", "उद्यम", "स्टार्टअप", "सूट", "छूट"]):
        if language == "hi":
            reply = (
                "**GeM पर MSMEs और DPIIT स्टार्टअप्स को मिलने वाली प्रमुख छूट:**\n\n"
                "1. **ईएमडी (EMD) 100% छूट**: वैध UDYAM पंजीकरण वाले सभी MSEs और मान्यता प्राप्त DPIIT स्टार्टअप्स को बयाना राशि (EMD) से पूर्ण छूट प्राप्त है [GFR 170(i)]।\n\n"
                "2. **पूर्व टर्नओवर व अनुभव में छूट**: सरकारी खरीदार एमएसएमई/स्टार्टअप्स के लिए पूर्व टर्नओवर और न्यूनतम कार्य अनुभव की शर्तों को शिथिल कर सकते हैं [GFR 173(i)]।\n\n"
                "3. **25% वार्षिक खरीद आरक्षण**: केंद्रीय मंत्रालयों और CPSEs के लिए अपनी कुल वार्षिक खरीद का न्यूनतम 25% MSEs से करना अनिवार्य है (जिसमें 4% SC/ST और 3% महिला उद्यमियों के लिए आरक्षित है)।\n\n"
                "4. **L1+15% मूल्य मिलान**: यदि L1 विक्रेता गैर-MSE है और कोई MSE L1+15% के दायरे में है, तो उसे L1 मूल्य मिलान करने पर 25% तक का ऑर्डर मिलता है।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर MSME आणि DPIIT स्टार्टअप्सना मिळणाऱ्या विशेष सवलती:**\n\n"
                "1. **EMD १००% फी माफी**: वैध UDYAM नोंदणी असलेल्या सर्व सूक्ष्म व लघु उद्योगांना (MSEs) आणि DPIIT स्टार्टअप्सना बयाणा रक्कम (EMD) भरण्यापासून १००% सूट आहे [GFR 170(i)].\n\n"
                "2. **टर्नओव्हर आणि अनुभव सवलत**: गुणवत्ता व तांत्रिक क्षमता पूर्ण असल्यास पूर्वीच्या टर्नओव्हर आणि अनुभवाच्या अटी शिथिल केल्या जातात [GFR 173(i)].\n\n"
                "3. **२५% अनिवार्य खरेदी**: सर्व केंद्रीय मंत्रालये आणि CPSEs साठी एकूण वार्षिक खरेदीच्या किमान २५% खरेदी MSEs कडून करणे सक्तीचे आहे.\n\n"
                "4. **L1+15% प्राधान्य**: L1+15% मर्यादेतील पात्र MSE ला L1 किंमत जुळवल्यास एकूण ऑर्डर्सपैकी २५% पुरवठ्याची संधी मिळते."
            )
        else:
            reply = (
                "**Privileges & Exemptions for MSMEs and Startups on GeM:**\n\n"
                "1. **100% EMD Waiver**: All MSEs registered with valid UDYAM and recognized DPIIT Startups are completely exempted from Earnest Money Deposit (EMD) [GFR Rule 170(i)].\n\n"
                "2. **Prior Turnover & Experience Relaxation**: Buyers can exempt startups and MSEs from prior turnover and experience criteria provided they demonstrate technical capability and quality standards [GFR Rule 173(i)].\n\n"
                "3. **25% Annual Procurement Quota**: Central Ministries, Departments, and CPSEs are mandated to procure a minimum of **25%** of annual requirements from MSEs (including 4% for SC/ST and 3% for Women entrepreneurs).\n\n"
                "4. **L1+15% Purchase Preference**: If L1 is a non-MSE, any MSE falling within L1+15% price band is invited to match L1 price for up to 25% of tender quantity."
            )
        citations = ["Public Procurement Policy for MSEs Order 2012", "GFR 2017 Rule 170(i)", "DPIIT Notification 2021"]

    # 4. Reverse Auction (RA) Rules
    elif any(has_kw(k) for k in ["reverse auction", "ra", "elimination", "decrement", "auto-extension", "auction", "लिलाव", "रिव्हर्स ऑक्शन", "रिवर्स ऑक्शन"]):
        if language == "hi":
            reply = (
                "**GeM पर रिवर्स ऑक्शन (Reverse Auction - RA) संचालन नियम:**\n\n"
                "1. **बोलीदाता पात्रता व 50% एलिमिनेशन**: केवल तकनीकी रूप से योग्य (Technically Qualified) विक्रेता ही RA में प्रवेश करते हैं। यदि 6 से अधिक विक्रेता योग्य हों, तो सबसे ऊंची बोली लगाने वाले 50% विक्रेताओं को RA से बाहर (Eliminate) कर दिया जाता है।\n\n"
                "2. **ऑटो-एक्सटेंशन नियम**: यदि RA समाप्त होने के अंतिम **10 मिनट** में कोई नई न्यूनतम बोली (Lowest Bid) आती है, तो ऑक्शन की अवधि स्वतः **30 मिनट** के लिए आगे बढ़ जाती है।\n\n"
                "3. **न्यूनतम मूल्य कमी (Minimum Decrement)**: बोलीदाता को पिछली सबसे कम बोली से निर्धारित न्यूनतम कटौती (उदा. 0.5% या 1%) से कम पर ही नई बोली लगानी होती है।\n\n"
                "4. **L1 टाई-ब्रेकर**: यदि दो बोलीदाता समान दर प्रस्तुत करते हैं, तो GeM एल्गोरिदम विक्रेता रेटिंग, डिलीवरी रिकॉर्ड और रैंडम रन टाइम पर फैसला करता है।"
            )
        elif language == "mr":
            reply = (
                "**GeM पोर्टलवर रिव्हर्स ऑक्शन (RA) नियम आणि कार्यपद्धती:**\n\n"
                "1. **५०% एलिमिनेशन नियम**: जर तांत्रिकदृष्ट्या पात्र बोलीदारांची संख्या ६ पेक्षा जास्त असेल, तर ५०% जास्त दर असलेले बोलीदार थेट बाद (Eliminate) केले जातात.\n\n"
                "2. **वेळ विस्तार (Auto-Extension)**: लिलाव संपण्याच्या शेवटच्या **१० मिनिटांत** नवीन सर्वात कमी बोली आल्यास, लिलावाची वेळ आपोआप **३० मिनिटांनी** वाढवली जाते.\n\n"
                "3. **किमान कपात (Min Decrement)**: नवीन बोली आधीच्या सर्वात कमी किमतीपेक्षा किमान ठरवून दिलेल्या फरकाने (उदा. ०.५% किंवा १%) कमी असणे सक्तीचे आहे.\n\n"
                "4. **पारदर्शकता**: स्पर्धकांना एकमेकांची नावे दिसत नाहीत, फक्त चालू सर्वात कमी किंमत (Current L1) दिसते."
            )
        else:
            reply = (
                "**GeM Reverse Auction (RA) Rules & Mechanics:**\n\n"
                "1. **50% Bidder Elimination (H1 Elimination)**: When the number of technically qualified bidders exceeds 6, the top 50% highest-priced bidders (H1 onwards) are systematically eliminated prior to RA commencement.\n\n"
                "2. **Auto-Extension Rule**: If a competitive lower bid is submitted in the **last 10 minutes** of the auction window, the auction timer automatically extends by **30 minutes** (up to a maximum extension cap).\n\n"
                "3. **Minimum Decrement Requirement**: Bidders can only place bids lower than the current L1 by at least the configured minimum decrement step (typically 0.5% to 1.0% of total value).\n\n"
                "4. **Anonymity & Transparency**: Bidders only observe the current leading L1 price; rival identities and corporate names remain strictly masked until contract award."
            )
        citations = ["GeM Reverse Auction Policy 2024", "GFR Rule 149(iii)"]

    # 5. Anti-Cartel & Collusion Detection
    elif any(k in q_lower for k in ["cartel", "collusion", "fraud", "anomaly", "syndicate", "dsc", "subnet", "सिंडिकेट", "मिलीभगत", "फर्जीवाड़ा", "घोटाळा", "कार्टेल"]):
        if language == "hi":
            reply = (
                "**GeM AI एंटी-कार्टेल और मिलीभगत पहचान प्रणाली:**\n\n"
                "1. **डिजिटल हस्ताक्षर (DSC Token) ऑडिट**: यदि अलग-अलग प्रतिस्पर्धी कंपनियों की बोलियां एक ही DSC डोंगल या एक ही अधिकृत हस्ताक्षरकर्ता द्वारा अपलोड की जाती हैं, तो सिस्टम तुरंत अलर्ट जारी करता है।\n\n"
                "2. **नेटवर्क IP व सबनेट क्लस्टरिंग**: यदि दो या अधिक प्रतिस्पर्धी एक ही इंटरनेट IP पते, वाई-फाई नेटवर्क या समान भू-स्थान से बोलियां सबमिट करते हैं, तो उन्हें 'Collusion Risk' के तहत फ्लैग किया जाता है।\n\n"
                "3. **मूल्य स्पेसिंग सिंडिकेटिंग**: जब सभी आपूर्तिकर्ता एक गुप्त समझौते के तहत बेंचमार्क से 0.1% - 0.4% के अंतर पर बोली लगाते हैं ताकि हर टेंडर में बारी-बारी से काम बांटा जा सके।\n\n"
                "4. **कम्पटीशन एक्ट 2002**: पकड़े जाने पर CCI द्वारा टर्नओवर का 10% तक जुर्माना और 3 वर्ष तक GeM डिबारमेंट (ब्लैकलिस्ट) की कार्रवाई की जाती है।"
            )
        elif language == "mr":
            reply = (
                "**GeM AI अँटी-कार्टेल आणि फॉरेन्सिक पाळत प्रणाली:**\n\n"
                "1. **DSC डिजिटल स्वाक्षरी तपासणी**: दोन वेगवेगळ्या प्रतिस्पर्धी कंपन्यांच्या निविदा एकाच डिजिटल टोकनद्वारे सबमिट केल्या गेल्यास प्रणाली त्वरित इशारा देते.\n\n"
                "2. **IP आणि नेटवर्क क्लस्टरिंग**: एकाच IP पत्त्यावरून किंवा एकाच ठिकाणाहून दाखल केलेल्या प्रतिस्पर्धी बिड्स कार्टेल म्हणून फ्लॅग केल्या जातात.\n\n"
                "3. **किंमत संगनमत (Price Clustering)**: जर बोलीदारांनी आपापसात ठरवून अगदी थोड्या फरकाने (०.१% ते ०.४%) दर भरले असतील, तर AI न्युरल नेटवर्क ते त्वरित पकडते.\n\n"
                "4. **कारवाई**: स्पर्धा कायदा २००२ अंतर्गत कंपन्यांना काळ्या यादीत टाकले जाते आणि दंडात्मक कारवाई केली जाते."
            )
        else:
            reply = (
                "**GeM AI Anti-Cartel & Forensic Surveillance Engine:**\n\n"
                "1. **DSC Token Signature Audit**: Flags tenders where ostensibly competing vendors upload bids signed with identical or interlinked Digital Signature Certificates.\n\n"
                "2. **IP / Subnet Clustering**: Identifies collusion when competing bidders submit tenders from the same IP address, identical browser fingerprint, or overlapping network subnet.\n\n"
                "3. **Price Margin Rotation Clustering**: Neural models detect artificial quote clustering (e.g. artificial 0.1% to 0.4% margin ladders) configured to rotate contracts among cartel members.\n\n"
                "4. **Statutory Penalties**: Violators face debarment across all Indian government procurement for up to 3 years and referral to the Competition Commission of India (CCI) under Section 3(3) of Competition Act 2002."
            )
        citations = ["Competition Act 2002 Sec 3(3)", "GeM Forensic Vigilance Directive", "CVC Guidelines"]

    # 6. Live Bid Verifier Sandbox
    elif any(k in q_lower for k in ["verify", "verifier", "sandbox", "shortfall", "compliance score", "score", "audit", "सत्यापन", "सैंडबॉक्स", "पडताळणी"]):
        if language == "hi":
            reply = (
                "**GeM AI लाइव बिड सत्यापन सैंडबॉक्स (Verification Sandbox):**\n\n"
                "1. **7-पॉइंट AI अनुपालन जांच**: यह टूल आपके टेंडर दस्तावेजों की 7 महत्वपूर्ण बिंदुओं पर जांच करता है: EMD छूट, MII क्लास-I घोषणापत्र, पैन/जीएसटी एक्टिव स्थिति, बैंक सॉल्वेंसी, CA नेटवर्थ और लैंड बॉर्डर अनुपालन।\n\n"
                "2. **शॉर्टफॉल नोटिस की रोकथाम**: सबमिशन से पहले संभावित विसंगतियों की पहचान करके यह खरीदार द्वारा टेंडर निरस्त होने से बचाता है।\n\n"
                "3. **स्कोरिंग प्रणाली**: 90+ स्कोर 'उच्च अनुपालन', 75-89 'मध्यम जोखिम', और 75 से नीचे 'गंभीर त्रुटि' को दर्शाता है।\n\n"
                "आप नीचे दिए गए बटन पर क्लिक करके **लाइव बिड सत्यापन सैंडबॉक्स** तुरंत खोल सकते हैं!"
            )
        elif language == "mr":
            reply = (
                "**GeM AI थेट बिड पडताळणी सँडबॉक्स (Bid Verification Sandbox):**\n\n"
                "1. **७-सूत्रीय AI तपासणी**: हे साधन आपल्या निविदा कागदपत्रांची ७ मुख्य निकषांवर तपासणी करते: EMD सवलत, MII स्थानिक सामग्री, GST/PAN वैधता, CA नेटवर्थ, आणि बँक हमी.\n\n"
                "2. **त्रुटी निवारण**: निविदा दाखल करण्यापूर्वीच त्रुटी ओळखून शॉर्टफॉल नोटीस किंवा अपात्रता टाळण्यास मदत करते.\n\n"
                "3. **बिड स्कोअर**: ९०+ स्कोअर सुरक्षित अनुपालन दर्शवतो, तर ७५ पेक्षा कमी स्कोअर असल्यास कागदपत्रे दुरुस्त करणे आवश्यक असते.\n\n"
                "खालील बटणावर क्लिक करून आपण **थेट बिड पडताळणी सँडबॉक्स** उघडू शकता!"
            )
        else:
            reply = (
                "**GeM AI Live Bid Verification Sandbox:**\n\n"
                "1. **7-Point Compliance Audit**: Automatically evaluates bid documents against statutory requirements: EMD validity/waiver, Make in India Class-I declaration, GSTIN/PAN active status, CA Net Worth certificate, and Land Border Rule 144(xi) compliance.\n\n"
                "2. **Shortfall Prevention**: Identifies missing annexures or defective certificates before bid submission, preventing rejection during technical evaluation.\n\n"
                "3. **Predictive Compliance Score**: Scores from 0 to 100, where 90+ indicates Low Risk (Procurement Ready), 75-89 Medium Risk, and <75 High Rejection Risk.\n\n"
                "You can launch the **Live Bid Verification Sandbox** directly using the action button below!"
            )
        citations = ["GeM Bid Evaluation Protocol 2024", "GFR Rule 173"]

    # 7. Seller Registration & Cataloging
    elif any(k in q_lower for k in ["seller registration", "vendor registration", "register as seller", "catalog", "caution money", "oem panel", "विक्रेता पंजीकरण", "विक्रेता नोंदणी"]):
        if language == "hi":
            reply = (
                "**GeM पर नया विक्रेता (Seller) पंजीकरण और कैटलॉग गाइड:**\n\n"
                "1. **प्राथमिक दस्तावेज**: कंपनी/फर्म पैन कार्ड, आधार लिंक मोबाइल नंबर, सक्रिय GSTIN, बैंक खाता विवरण और उद्योग आधार / UDYAM प्रमाण पत्र।\n\n"
                "2. **कॉशन मनी (Caution Money Deposit)**: टर्नओवर के आधार पर GeM पर सुरक्षा निधि जमा करनी होती है:\n"
                "   - ₹1 करोड़ तक टर्नओवर: ₹5,000\n"
                "   - ₹1 करोड़ से ₹10 करोड़: ₹10,000\n"
                "   - ₹10 करोड़ से अधिक: ₹25,000\n\n"
                "3. **उत्पाद कैटलॉग व OEM अनुमोदन**: ब्रांडेड उत्पाद बेचने के लिए OEM डैशबोर्ड से अनुमोदन आवश्यक है, अथवा विक्रेता पुनर्विक्रेता (Reseller) के रूप में सूचीबद्ध हो सकता है।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर विक्रेता (Seller) नोंदणी आणि उत्पादन कॅटलॉग प्रक्रिया:**\n\n"
                "1. **आवश्यक कागदपत्रे**: कंपनी PAN, आधार, सक्रिय GSTIN, बँक खाते तपशील, आणि UDYAM नोंदणी प्रमाणपत्र.\n\n"
                "2. **कॉशन मनी (Caution Money)**: वार्षिक टर्नओव्हरनुसार सुरक्षा ठेव GeM कडे जमा करावी लागते:\n"
                "   - ₹१ कोटींपर्यंत: ₹५,०००\n"
                "   - ₹१ ते ₹१० कोटी: ₹१०,०००\n"
                "   - ₹१० कोटींपेक्षा जास्त: ₹२५,०००\n\n"
                "3. **उत्पादन यादी (Catalog Upload)**: उत्पादनांची तांत्रिक वैशिष्ट्ये, BIS/ISO प्रमाणपत्रे आणि किमती पोर्टलवर अपलोड कराव्यात."
            )
        else:
            reply = (
                "**GeM Vendor Registration & Product Cataloging Guide:**\n\n"
                "1. **Prerequisites**: Corporate/Proprietor PAN, Aadhaar linked to authorized signatory, active GSTIN, bank IFSC/account, and UDYAM registration (for MSEs).\n\n"
                "2. **Caution Money Deposit**: Mandated for all active sellers based on prior turnover:\n"
                "   - Turnover < ₹1 Crore: **₹5,000**\n"
                "   - Turnover ₹1 Cr – ₹10 Cr: **₹10,000**\n"
                "   - Turnover > ₹10 Cr: **₹25,000**\n\n"
                "3. **OEM vs Reseller Cataloging**: OEMs can register proprietary brands and publish product pairs. Resellers map onto approved OEM catalogs with authorization codes."
            )
        citations = ["GeM Seller Handbook 2024", "Caution Money Advisory 2023"]

    # 8. CRAC & 10-Day Payment Terms
    elif any(k in q_lower for k in ["crac", "consignee receipt", "10-day", "10 day", "payment timeline", "penal interest", "पावती", "भुगतान", "पेमेंट"]):
        if language == "hi":
            reply = (
                "**GeM पर CRAC निरीक्षण और 10-दिवसीय अनिवार्य भुगतान नियम:**\n\n"
                "1. **CRAC (Consignee Receipt and Acceptance Certificate)**: माल प्राप्त होने पर खरीदार/कंसाइनी को **10 कैलेंडर दिनों** के भीतर CRAC जारी करना अनिवार्य है।\n\n"
                "2. **ऑटो-CRAC (Auto-Generation)**: यदि खरीदार 10 दिनों में निरीक्षण पूरा नहीं करता या आपत्ति दर्ज नहीं करता, तो 10वें दिन GeM पोर्टल द्वारा ऑटो-CRAC जारी कर दिया जाता है।\n\n"
                "3. **10 दिनों में भुगतान**: CRAC जारी होने के बाद खरीदार विभाग को अगले **10 दिनों** के भीतर PFMS/GeM पूल खाते के जरिए विक्रेता को 100% भुगतान करना अनिवार्य है।\n\n"
                "4. **1% प्रतिमाह दंडात्मक ब्याज**: समय पर भुगतान न करने पर खरीदार विभाग पर प्रति माह **1% दंडात्मक ब्याज** लागू होता है जो सीधे विक्रेता को देय होता है।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर CRAC आणि १० दिवसांत पेमेंटचे कायदेविषयक नियम:**\n\n"
                "1. **CRAC प्रमाणपत्र**: माल पोहचल्यानंतर खरेदीदाराने **१० दिवसांच्या** आत CRAC (स्वीकृती प्रमाणपत्र) देणे बंधनकारक आहे.\n\n"
                "2. **ऑटो-CRAC**: जर खरेदीदाराने १० दिवसांत कोणतीही तक्रार नोंदवली नाही, तर पोर्टल आपोआप ऑटो-CRAC तयार करते.\n\n"
                "3. **१० दिवसांत पेमेंट**: CRAC जारी झाल्यानंतर पुढील **१० दिवसांत** विक्रेत्याच्या बँक खात्यात रक्कम जमा करणे सक्तीचे आहे.\n\n"
                "4. **१% दंडनीय व्याज**: विहित मुदतीत पैसे न दिल्यास खरेदीदार विभागावर दरमहा **१% दराने व्याजदंड** आकारला जातो."
            )
        else:
            reply = (
                "**CRAC Inspection & 10-Day Payment Timelines on GeM:**\n\n"
                "1. **Mandatory CRAC Issuance**: Consignees must inspect delivered consignments and issue the **Consignee Receipt and Acceptance Certificate (CRAC)** within **10 calendar days** of physical delivery.\n\n"
                "2. **Auto-CRAC Mechanism**: If the buyer fails to log an inspection rejection within 10 days, the portal automatically generates Auto-CRAC, deeming goods accepted.\n\n"
                "3. **10-Day Payment Settlement**: Buyers are legally required to disburse 100% payment through PFMS/GeM Pool Account within **10 days** of CRAC generation.\n\n"
                "4. **1% Monthly Penal Interest**: Late payments attract a statutory **1% per month penal interest** charged directly against the buyer department and credited to the vendor."
            )
        citations = ["Department of Expenditure OM No. F.6/18/2019-PPD", "GeM SLA Terms 2024"]

    # 9. Buyer Tender Publishing / Creation
    elif any(k in q_lower for k in ["publish tender", "create tender", "create bid", "float tender", "boq", "नया टेंडर", "टेंडर जारी", "खरेदीदार पोर्टल"]):
        if language == "hi":
            reply = (
                "**GeM पर खरीदार (Buyer) द्वारा नया टेंडर प्रकाशित करने की प्रक्रिया:**\n\n"
                "1. **कैटलॉग चयन व BOQ**: खरीदार अनुमोदित उत्पाद श्रेणी चुनते हैं या जटिल आवश्यकताओं के लिए BOQ (Bill of Quantities) बिड बनाते हैं।\n\n"
                "2. **GFR व MII अनुपालन**: टेंडर में स्थानीय सामग्री (Class-I / Class-II) आवश्यकता, EMD राशि (1% से 5%), और डिलीवरी अवधि निर्धारित की जाती है।\n\n"
                "3. **बिड अवधि**: टेंडर पोर्टल पर न्यूनतम **10 से 21 दिनों** के लिए खुला रहना चाहिए ताकि सभी पात्र विक्रेताओं को समान अवसर मिले।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर खरेदीदाराने (Buyer) नवीन निविदा प्रकाशित करण्याची पद्धत:**\n\n"
                "1. **BOQ आणि श्रेणी निवड**: खरेदीदार आवश्यक उत्पादन श्रेणी निवडतात किंवा सविस्तर BOQ निविदा तयार करतात.\n\n"
                "2. **नियम निश्चिती**: EMD रक्कम (१% ते ५%), Make in India निकष, आणि वितरणाचा कालावधी ठरवला जातो.\n\n"
                "3. **प्रकाशन कालावधी**: निविदा GeM पोर्टलवर किमान **१० ते २१ दिवस** खुली राहणे बंधनकारक आहे."
            )
        else:
            reply = (
                "**Buyer Workflow for Creating & Publishing Bids on GeM:**\n\n"
                "1. **Category & BOQ Formulation**: Buyers select certified product categories or create custom Bill of Quantities (BOQ) bids with explicit technical specifications.\n\n"
                "2. **Rule Enforcement**: Set statutory parameters: EMD requirement (1% - 5%), Make in India Class-I eligibility, MSE purchase preference, and delivery schedules.\n\n"
                "3. **Publishing Timeline**: Electronic bids must remain open for bidding for a mandatory window of **10 to 21 calendar days**.\n\n"
                "You can access the **Buyer Portal** to draft or view tenders using the action button below!"
            )
        citations = ["GFR 2017 Rule 149", "GeM Buyer SOP 2024"]

    # 10. Land Border Sharing Rule 144(xi)
    elif any(k in q_lower for k in ["land border", "144(xi)", "china", "border country", "जमीन सीमा", "सुरक्षा मंजूरी"]):
        if language == "hi":
            reply = (
                "**GFR 2017 नियम 144(xi) — भारत के साथ स्थल सीमा साझा करने वाले देशों के नियम:**\n\n"
                "1. **अनिवार्य पंजीकरण**: भारत की स्थल सीमा से लगे देशों (उदा. चीन, म्यांमार आदि) का कोई भी बोलीदाता तब तक किसी भी सरकारी टेंडर में भाग नहीं ले सकता जब तक वह **सक्षम प्राधिकारी (DPIIT)** के पास पंजीकृत न हो।\n\n"
                "2. **गृह व विदेश मंत्रालय से सुरक्षा मंजूरी**: ऐसे विक्रेताओं के पास गृह मंत्रालय (MHA) और विदेश मंत्रालय (MEA) से राजनीतिक एवं सुरक्षा अनापत्ति (Security Clearance) होना अनिवार्य है।\n\n"
                "3. **सब-कॉन्ट्रैक्टिंग पर भी रोक**: मुख्य ठेकेदार किसी ऐसे उप-ठेकेदार को काम नहीं सौंप सकता जो इन नियमों का उल्लंघन करता हो।"
            )
        elif language == "mr":
            reply = (
                "**GFR 2017 नियम 144(xi) — भारताशी जमीन सीमा जोडलेल्या देशांचे निर्बंध:**\n\n"
                "1. **अनिवार्य नोंदणी**: भारताशी जमिनीची सीमा जोडलेल्या देशांतील बोलीदारांना **DPIIT** कडे नोंदणी असल्याशिवाय कोणत्याही सरकारी निविदेत भाग घेता येत नाही.\n\n"
                "2. **सुरक्षा मंजुरी**: गृह मंत्रालय (MHA) आणि परराष्ट्र मंत्रालय (MEA) कडून राजकीय व राष्ट्रीय सुरक्षा मंजुरी सक्तीची आहे.\n\n"
                "3. **उल्लंघनावर बंदी**: अशा पुरवठादारांची निविदा तात्काळ फेटाळली जाते."
            )
        else:
            reply = (
                "**Restrictions under GFR 2017 Rule 144(xi) (Land Border Sharing Countries):**\n\n"
                "1. **Mandatory Registration with DPIIT**: Any bidder from a country sharing a land border with India is eligible to bid in public procurement ONLY if the bidder is registered with the Competent Authority (DPIIT Registration Committee).\n\n"
                "2. **Security Clearance**: Clearance from Ministry of External Affairs (MEA) and Ministry of Home Affairs (MHA) is mandatory.\n\n"
                "3. **Sub-contracting Prohibition**: Prime contractors cannot sub-contract any supply or component to entities violating Rule 144(xi)."
            )
        citations = ["Department of Expenditure Order F.No.6/18/2019-PPD", "GFR Rule 144(xi)"]

    # 11. Global Tender Enquiry (GTE) Ban
    elif any(k in q_lower for k in ["gte", "global tender", "200 crore", "200 cr", "161(iv)", "वैश्विक निविदा"]):
        if language == "hi":
            reply = (
                "**GFR 2017 नियम 161(iv) — ₹200 करोड़ तक ग्लोबल टेंडर (GTE) पर प्रतिबंध:**\n\n"
                "1. **₹200 करोड़ तक पूर्ण घरेलू खरीद**: घरेलू उद्योगों और एमएसएमई को बढ़ावा देने के लिए ₹200 करोड़ से कम मूल्य के किसी भी सरकारी टेंडर के लिए ग्लोबल टेंडर जारी करने की अनुमति नहीं है।\n\n"
                "2. **विशेष छूट की प्रक्रिया**: यदि कोई वस्तु केवल विदेशों में ही बनती है, तो इसके लिए सचिव (समन्वय), कैबिनेट सचिवालय से पूर्व अनुमोदन लेना अनिवार्य होता है।"
            )
        elif language == "mr":
            reply = (
                "**GFR 2017 नियम 161(iv) — ₹२०० कोटींपर्यंत ग्लोबल टेंडरवर (GTE) बंदी:**\n\n"
                "1. **स्थानिक खरेदी बंधनकारक**: ₹२०० कोटींपेक्षा कमी किमतीच्या खरेदीसाठी कोणतीही ग्लोबल निविदा काढता येत नाही.\n\n"
                "2. **सूट मिळवण्याची पद्धत**: जर उत्पादन भारतात उपलब्धच नसेल, तर कॅबिनेट सचिवालयाच्या विशेष समितीची पूर्वपरवानगी घ्यावी लागते."
            )
        else:
            reply = (
                "**Ban on Global Tender Enquiries (GTE) under GFR Rule 161(iv):**\n\n"
                "1. **Mandatory Domestic Procurement up to ₹200 Crores**: No Global Tender Enquiry (GTE) can be floated for procurements with estimated value up to ₹200 Crores without prior Cabinet Secretariat approval.\n\n"
                "2. **Special Exceptions**: Exemptions are granted only on an exceptional basis by the Department of Expenditure for critical high-tech/medical equipment not manufactured domestically."
            )
        citations = ["GFR 2017 Rule 161(iv)", "DoE OM dated 15 May 2020"]

    # 12. EMD & PBG Guarantee Rules
    elif any(k in q_lower for k in ["pbg", "emd guarantee", "performance bank guarantee", "performance security", "security deposit", "पीबीजी", "बयाना"]):
        if language == "hi":
            reply = (
                "**GeM पर EMD और PBG (परफॉर्मेंस बैंक गारंटी) के नियम:**\n\n"
                "1. **EMD (बयाना राशि)**: टेंडर मूल्य का 1% से 5% होती है (MSEs और स्टार्टअप्स को 100% छूट)।\n\n"
                "2. **PBG (परफॉर्मेंस सिक्योरिटी)**: अनुबंध मूल्य का **3% से 5%** होता है। सफल बोलीदाता को अनुबंध जारी होने के 15 दिनों के भीतर ई-पीबीजी (e-PBG) जमा करना होता है।\n\n"
                "3. **वैधता**: PBG की वैधता सभी संविदात्मक दायित्वों और वारंटी अवधि के समाप्त होने के **60 दिनों** बाद तक होनी चाहिए।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर EMD आणि कार्यप्रदर्शन बँक हमी (PBG) नियम:**\n\n"
                "1. **EMD (बयाणा)**: निविदा रकमेच्या १% ते ५% असते (MSEs आणि स्टार्टअप्सना पूर्ण माफी).\n\n"
                "2. **PBG (कार्यप्रदर्शन सुरक्षा)**: कंत्राट मूल्याच्या **३% ते ५%** रक्कम PBG म्हणून जमा करावी लागते.\n\n"
                "3. **वैधता कालावधी**: सर्व वॉरंटी आणि कंत्राट पूर्ततेनंतर पुढील **६० दिवसांपर्यंत** PBG वैध असणे आवश्यक आहे."
            )
        else:
            reply = (
                "**EMD and Performance Security (PBG) Norms on GeM:**\n\n"
                "1. **Earnest Money Deposit (EMD)**: Set between **1% and 5%** of estimated tender value (MSEs and Startups receive 100% waiver under Rule 170).\n\n"
                "2. **Performance Bank Guarantee (PBG)**: Standardized at **3% to 5%** of contract value. Must be submitted as an e-PBG via SFMS within 15 days of order placement.\n\n"
                "3. **Validity Period**: PBG must remain valid for a period of **60 days beyond the date of completion** of all contractual obligations, including warranty."
            )
        citations = ["GFR 2017 Rule 170 & Rule 171", "DoE OM on Performance Security"]

    # 13. Categories & Services
    elif any(k in q_lower for k in ["category", "categories", "catalog", "medical", "it hardware", "cloud", "green", "वर्ग", "श्रेणी"]):
        if language == "hi":
            reply = (
                "**GeM उत्पाद व सेवा श्रेणियां (50,000+ कैटलॉग):**\n\n"
                "1. **वस्तुएं (Goods)**: मेडिकल उपकरण, आईटी हार्डवेयर, सौर ऊर्जा, कार्यालय स्टेशनरी, वाहन और भारी मशीनरी।\n\n"
                "2. **सेवाएं (Services)**: क्लाउड होस्टिंग, मैनपॉवर आउटसोर्सिंग, सुरक्षा सेवाएं, वाहन किराया, सफाई सेवाएं और कैंटीन प्रबंधन।\n\n"
                "3. **ग्रीन प्रोक्योरमेंट**: ऊर्जा कुशल (BEE स्टार रेटेड) उत्पादों के लिए विशेष ग्रीन श्रेणी उपलब्ध है।"
            )
        elif language == "mr":
            reply = (
                "**GeM उत्पादन आणि सेवा वर्ग (५०,०००+ कॅटलॉग):**\n\n"
                "1. **वस्तू (Goods)**: वैद्यकीय उपकरणे, संगणक, सौर ऊर्जा साधने, वाहने आणि फर्निचर.\n\n"
                "2. **सेवा (Services)**: क्लाउड सेवा, सुरक्षा रक्षक, मनुष्यबळ पुरवठा, वाहन भाडे आणि स्वच्छता सेवा.\n\n"
                "3. **हिरवी खरेदी (Green Procurement)**: ऊर्जा बचतीची उत्पादने घेण्यासाठी विशेष मानके निश्चित आहेत."
            )
        else:
            reply = (
                "**GeM Product & Service Taxonomy (50,000+ Categories):**\n\n"
                "1. **Goods Categories**: Medical & diagnostic equipment, IT hardware & software, solar installations, automotive fleets, and furniture.\n\n"
                "2. **Services Categories**: Cloud infrastructure, manpower hiring, vehicle leasing, security surveillance, facility management, and software development.\n\n"
                "3. **Green Procurement**: Mandates for energy efficiency (BEE star ratings) and eco-friendly compliance on priority categories."
            )
        citations = ["GeM Product Taxonomy 2024", "MoEFCC Green Procurement Norms"]

    # 14. Fallback tailored specifically to user's question
    else:
        clean_q = query.strip()
        if language == "hi":
            reply = (
                f"**प्रश्न: \"{clean_q}\" के संबंध में GeM अधिप्राप्ति निर्देश:**\n\n"
                "GeM पोर्टल पर सभी खरीद **सामान्य वित्तीय नियमावली (GFR 2017)** और DPIIT नियमों द्वारा संचालित होती हैं:\n\n"
                "• **खरीद सीमाएं**: ₹25,000 तक डायरेक्ट परचेस, ₹5 लाख तक L1 तुलना, और ₹5 लाख से ऊपर खुली बिडिंग/RA अनिवार्य है [GFR 149]।\n"
                "• **मेक इन इंडिया**: Class-I (≥50% सामग्री) स्थानीय विक्रेताओं को 20% का खरीद वरीयता मार्जिन मिलता है।\n"
                "• **MSME लाभ**: वैध UDYAM वाले MSEs और मान्यता प्राप्त स्टार्टअप्स को EMD और पूर्व टर्नओवर/अनुभव से छूट प्राप्त है।\n"
                "• **भुगतान सुरक्षा**: माल प्राप्ति के 10 दिनों में CRAC जारी होना और 10 दिनों में PFMS द्वारा भुगतान अनिवार्य है।\n\n"
                "*क्या आप किसी विशेष नियम, टेंडर सत्यापन या रिवर्स ऑक्शन के बारे में अधिक जानकारी चाहते हैं?*"
            )
        elif language == "mr":
            reply = (
                f"**प्रश्न: \"{clean_q}\" बाबत GeM सरकारी खरेदी मार्गदर्शक:**\n\n"
                "GeM पोर्टलवरील सर्व खरेदी **सामान्य वित्तीय नियम (GFR 2017)** आणि DPIIT धोरणांनुसार केली जाते:\n\n"
                "• **खरेदी मर्यादा**: ₹२५,००० पर्यंत थेट खरेदी, ₹५ लाखांपर्यंत L1 तुलना, आणि ₹५ लाखांपेक्षा जास्त रकमेसाठी खुली निविदा किंवा रिव्हर्स ऑक्शन अनिवार्य आहे.\n"
                "• **स्थानिक प्राधान्य**: Make in India Class-I पुरवठादारांना २०% खरेदी प्राधान्य मिळते.\n"
                "• **सवलती**: नोंदणीकृत MSEs आणि स्टार्टअप्सना EMD मधून १००% सूट आहे.\n"
                "• **पेमेंट नियम**: CRAC नंतर १० दिवसांत पेमेंट न दिल्यास खरेदीदारावर दरमहा १% दंडनीय व्याज आकारले जाते.\n\n"
                "*आपणास कोणत्याही विशिष्ट नियमाबद्दल किंवा निविदा पडताळणीबद्दल अधिक जाणून घ्यायचे आहे का?*"
            )
        else:
            reply = (
                f"**GeM Procurement Guidance for: \"{clean_q}\":**\n\n"
                "All procurement on the Government e-Marketplace is governed by **General Financial Rules (GFR 2017)** and statutory DPIIT orders:\n\n"
                "• **Procurement Thresholds**: Up to ₹25,000 via Direct Purchase, ₹25,000 to ₹5,00,000 via L1 comparison of 3 OEMs, and above ₹5,00,000 via mandatory electronic bidding / Reverse Auction [GFR Rule 149].\n"
                "• **Make in India**: Class-I local suppliers (≥50% local content) receive a 20% margin of purchase preference over non-local suppliers.\n"
                "• **MSME Benefits**: 100% EMD waiver and prior turnover/experience relaxation are available for UDYAM-registered MSEs and DPIIT Startups.\n"
                "• **Payment Protection**: Buyers must issue CRAC within 10 days of delivery and settle payments within 10 days via PFMS, or face 1% monthly penal interest.\n\n"
                "*Would you like more specific assistance with bidding, compliance verification, or reverse auction rules?*"
            )
        citations = ["GFR 2017 Rule 149", "GeM GTC 2024", "DPIIT MII Policy"]

    return {
        "reply": reply,
        "citations": citations,
        "model": "GeM-RuleEngine-v2.5"
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_gemmy(payload: ChatRequest):
    """
    Main conversational endpoint for Ask GeMMy.
    Calls Groq API (qwen/qwen3.8-27b) with robust system instructions,
    and falls back to rule-based procurement engine on failure.
    """
    user_query = payload.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Query message cannot be empty.")

    target_lang = payload.language or "en"
    groq_api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model_name = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b").strip()

    # Build prompt messages
    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\nTarget User Language: {target_lang.upper()}\nUser Role: {payload.role}"}
    ]

    # Add conversation history context (up to last 6 messages)
    if payload.history:
        for msg in payload.history[-6:]:
            if msg.role in ["user", "assistant"]:
                messages.append({"role": msg.role, "content": msg.content})

    # Add current user message
    messages.append({"role": "user", "content": user_query})

    reply_text = ""
    used_model = model_name
    citations = ["GFR 2017", "GeM Guidelines"]

    # Try Groq API call if key is configured
    if groq_api_key:
        try:
            req_payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.35,
                "max_tokens": 600
            }
            req_data = json.dumps(req_payload).encode("utf-8")
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "GeMMy-AI-Assistant/2.0"
                }
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                if res_body.get("choices") and len(res_body["choices"]) > 0:
                    reply_text = res_body["choices"][0]["message"]["content"]
                    used_model = f"Groq ({model_name})"
                    
                    # Extract citations from brackets if present
                    found_citations = re.findall(r'\[(.*?)\]', reply_text)
                    if found_citations:
                        citations = list(set(found_citations))[:4]
                    else:
                        citations = ["GFR 2017 Rule 149", "GeM Portal Guidelines"]
        except Exception as err:
            print(f"[!] Groq API call failed or timed out: {err}. Using domain fallback engine.")
            reply_text = ""

    # If Groq call failed, timed out, or returned empty, use the rich domain knowledge engine
    if not reply_text:
        fallback = get_offline_response(user_query, target_lang)
        reply_text = fallback["reply"]
        citations = fallback["citations"]
        used_model = fallback["model"]

    # Detect interactive actions based on query and reply
    actions = detect_actions(user_query, reply_text, target_lang)

    from datetime import datetime
    return ChatResponse(
        reply=reply_text,
        language=target_lang,
        model=used_model,
        citations=citations,
        actions=actions,
        timestamp=datetime.now().strftime("%I:%M %p")
    )

@router.get("/suggested-prompts")
def get_suggested_prompts(language: str = "en"):
    """Return localized starter prompt chips for the UI."""
    prompts_by_lang = {
        "en": [
            {"label": "📋 GFR Rule 149 Limits", "query": "What are the GFR 2017 Rule 149 direct purchase and bidding limits on GeM?"},
            {"label": "🛡️ Make in India Class I & II", "query": "Explain DPIIT Make in India Class-I and Class-II supplier criteria and purchase preference."},
            {"label": "🏢 MSME & Startup Exemptions", "query": "What exemptions do MSMEs and Startups receive for EMD and turnover on GeM?"},
            {"label": "⚡ Reverse Auction Rules", "query": "How does Reverse Auction (RA) elimination and timer auto-extension work on GeM?"},
            {"label": "⚖️ Anti-Cartel Detection", "query": "How does GeM AI detect bidder cartels and collusive pricing?"},
            {"label": "🔍 Live Bid Verifier", "query": "How can I verify tender documents and check my AI compliance score?"},
            {"label": "📦 Seller Registration Guide", "query": "How can a new vendor register on GeM and upload product catalogs?"},
            {"label": "💳 CRAC & 10-Day Payments", "query": "What is the CRAC inspection rule and 10-day payment timeline on GeM?"}
        ],
        "hi": [
            {"label": "📋 GFR 149 खरीद सीमाएं", "query": "GeM पर GFR 2017 नियम 149 के अनुसार डायरेक्ट परचेस और बिडिंग की सीमाएं क्या हैं?"},
            {"label": "🛡️ मेक इन इंडिया नियम", "query": "DPIIT मेक इन इंडिया क्लास-I और क्लास-II स्थानीय आपूर्तिकर्ता के नियम समझाइए।"},
            {"label": "🏢 MSME व स्टार्टअप छूट", "query": "MSME और स्टार्टअप्स को GeM पर EMD और टर्नओवर में क्या छूट मिलती है?"},
            {"label": "⚡ रिवर्स ऑक्शन नियम", "query": "GeM पर रिवर्स ऑक्शन में बोली और समय विस्तार के क्या नियम हैं?"},
            {"label": "⚖️ कार्टेल व फर्जीवाड़ा जांच", "query": "GeM AI बोलीदाताओं के कार्टेल और मिलीभगत की पहचान कैसे करता है?"},
            {"label": "🔍 बिड सत्यापन सैंडबॉक्स", "query": "मैं अपने टेंडर दस्तावेजों की जांच और बिड स्कोर कैसे सत्यापित करूँ?"},
            {"label": "📦 विक्रेता पंजीकरण प्रक्रिया", "query": "GeM पर नया विक्रेता पंजीकरण और उत्पाद सूची कैसे दर्ज करें?"},
            {"label": "💳 CRAC व 10-दिवसीय भुगतान", "query": "GeM पर CRAC निरीक्षण और 10 दिनों में भुगतान की प्रक्रिया क्या है?"}
        ],
        "mr": [
            {"label": "📋 GFR 149 खरेदी मर्यादा", "query": "GeM पोर्टलवर GFR 2017 नियम 149 नुसार थेट खरेदी आणि निविदा मर्यादा काय आहेत?"},
            {"label": "🛡️ मेक इन इंडिया धोरण", "query": "DPIIT मेक इन इंडिया Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम स्पष्ट करा."},
            {"label": "🏢 MSME व स्टार्टअप सवलती", "query": "MSME आणि स्टार्टअप्सना GeM वर EMD आणि टर्नओव्हरमध्ये काय सवलती मिळतात?"},
            {"label": "⚡ रिव्हर्स ऑक्शन नियम", "query": "GeM वर रिव्हर्स ऑक्शन (RA) चे नियम आणि वेळ विस्तार कसा चालतो?"},
            {"label": "⚖️ कार्टेल व मिलीभगत तपासणी", "query": "GeM AI बोलीदारांची मिलीभगत आणि कार्टेल कसे शोधते?"},
            {"label": "🔍 थेट बिड पडताळणी", "query": "मी माझ्या निविदा कागदपत्रांची पडताळणी आणि बिड स्कोअर कसा तपासावा?"},
            {"label": "📦 विक्रेता नोंदणी मार्गदर्शक", "query": "GeM वर नवीन विक्रेता नोंदणी आणि उत्पादन कॅटलॉग कसा जोडावा?"},
            {"label": "💳 CRAC आणि १० दिवसांत पेमेंट", "query": "GeM वर CRAC तपासणी आणि १० दिवसांत पेमेंटचे काय नियम आहेत?"}
        ]
    }
    return {"prompts": prompts_by_lang.get(language, prompts_by_lang["en"])}

