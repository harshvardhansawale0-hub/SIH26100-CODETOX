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
    q_lower = query.lower()
    
    # 1. GFR Rule 149 / Direct Purchase
    if any(k in q_lower for k in ["149", "direct purchase", "limit", "threshold", "direct", "₹25", "25000", "500000", "खरेदी मर्यादा", "मर्यादा"]):
        if language == "hi":
            reply = (
                "**GeM पर GFR 2017 नियम 149 के अंतर्गत खरीद सीमाएं:**\n\n"
                "1. **डायरेक्ट परचेस (Direct Purchase)**: ₹25,000 तक की खरीद बिना किसी कोटेशन के किसी भी योग्य विक्रेता से सीधे की जा सकती है [GFR Rule 149(i)]।\n"
                "2. **L1 तुलना (L1 Comparison)**: ₹25,000 से ₹5,00,000 तक की खरीद कम से कम 3 अलग-अलग निर्माताओं के उत्पादों की तुलना करके L1 मूल्य पर की जाती है [GFR Rule 149(ii)]।\n"
                "3. **अनिवार्य बिडिंग / रिवर्स ऑक्शन**: ₹5,00,000 से अधिक की सभी खरीद केवल खुली बोली (Bidding) या रिवर्स ऑक्शन (RA) द्वारा ही संभव है [GFR Rule 149(iii)]।"
            )
        elif language == "mr":
            reply = (
                "**GeM पोर्टलवर GFR 2017 नियम 149 नुसार खरेदी मर्यादा:**\n\n"
                "1. **थेट खरेदी (Direct Purchase)**: ₹२५,००० पर्यंतची खरेदी कोणत्याही पात्र विक्रेत्याकडून थेट कोटेशनशिवाय करता येते [GFR Rule 149(i)].\n"
                "2. **L1 किंमत तुलना**: ₹२५,००० ते ₹५,००,००० पर्यंतच्या खरेदीसाठी किमान ३ वेगवेगळ्या उत्पादकांच्या उत्पादनांची तुलना करून सर्वात कमी (L1) किमतीत खरेदी करावी लागते [GFR Rule 149(ii)].\n"
                "3. **अनिवार्य निविदा / रिव्हर्स ऑक्शन**: ₹५,००,००० पेक्षा जास्त किमतीच्या खरेदीसाठी GeM वर खुली निविदा (Bidding) किंवा रिव्हर्स ऑक्शन (RA) अनिवार्य आहे [GFR Rule 149(iii)]."
            )
        else:
            reply = (
                "**Procurement Thresholds under GFR 2017 Rule 149 on GeM:**\n\n"
                "1. **Direct Purchase**: Up to **₹25,000** through any available GeM supplier meeting requisite quality, specification, and delivery period without quotations [GFR Rule 149(i)].\n"
                "2. **L1 Price Comparison**: Between **₹25,000 and ₹5,00,000**, buyers must compare at least 3 distinct manufacturers/OEMs on GeM and award to the lowest compliant L1 bidder [GFR Rule 149(ii)].\n"
                "3. **Mandatory Bidding / Reverse Auction (RA)**: All procurements exceeding **₹5,00,000** must strictly be conducted via open electronic bidding or Reverse Auction [GFR Rule 149(iii)]."
            )
        citations = ["GFR 2017 Rule 149", "GeM Procurement Guidelines 2024"]

    # 2. Make in India / DPIIT
    elif any(k in q_lower for k in ["make in india", "dpiit", "local content", "class 1", "class-i", "class 2", "मेक इन इंडिया"]):
        if language == "hi":
            reply = (
                "**DPIIT मेक इन इंडिया (MII) स्थानीय सामग्री नियम:**\n\n"
                "- **Class-I स्थानीय आपूर्तिकर्ता**: स्थानीय सामग्री >= 50%। इन्हें निविदाओं में 20% तक का खरीद वरीयता मार्जिन (Purchase Preference) मिलता है।\n"
                "- **Class-II स्थानीय आपूर्तिकर्ता**: स्थानीय सामग्री >= 20% और < 50%। ये बोली लगा सकते हैं लेकिन जहां घरेलू क्षमता पर्याप्त है वहां वरीयता नहीं मिलती।\n"
                "- **Non-Local आपूर्तिकर्ता**: स्थानीय सामग्री < 20%। ₹200 करोड़ तक के टेंडरों में वैश्विक निविदा (GTE) पर पूर्ण प्रतिबंध है [Rule 161(iv)]।"
            )
        elif language == "mr":
            reply = (
                "**DPIIT मेक इन इंडिया (MII) स्थानिक सामग्री नियम:**\n\n"
                "- **Class-I स्थानिक पुरवठादार**: स्थानिक सामग्री (Local Content) >= ५०% असणे आवश्यक. यांना २०% खरेदी प्राधान्य (Purchase Preference) मिळते.\n"
                "- **Class-II स्थानिक पुरवठादार**: स्थानिक सामग्री >= २०% आणि < ५०%. हे बोली लावू शकतात पण देशांतर्गत क्षमता उपलब्ध असल्यास प्राधान्य मिळत नाही.\n"
                "- **Non-Local पुरवठादार**: स्थानिक सामग्री < २०%. ₹२०० कोटींपर्यंतच्या टेंडरसाठी ग्लोबल टेंडरवर (GTE) बंदी आहे [GFR Rule 161(iv)]."
            )
        else:
            reply = (
                "**DPIIT Public Procurement (Preference to Make in India) Policy:**\n\n"
                "- **Class-I Local Supplier**: Local content **≥ 50%**. Eligible for **20% purchase preference margin** against non-local bidders.\n"
                "- **Class-II Local Supplier**: Local content **≥ 20% and < 50%**. Can participate in tenders where domestic availability allows, without purchase preference.\n"
                "- **Non-Local Supplier**: Local content **< 20%**. Banned from participating in government tenders up to ₹200 Crores under GFR Rule 161(iv) Global Tender Enquiry (GTE) restrictions."
            )
        citations = ["DPIIT Order P-45021/2/2017-PP", "GFR 2017 Rule 161(iv)"]

    # 3. MSME & Startup Exemptions
    elif any(k in q_lower for k in ["msme", "startup", "emd", "turnover", "उद्यम", "स्टार्टअप"]):
        if language == "hi":
            reply = (
                "**GeM पर MSME और स्टार्टअप को मिलने वाली प्रमुख छूट:**\n\n"
                "1. **ईएमडी (EMD) छूट**: सभी पंजीकृत MSEs और मान्यता प्राप्त DPIIT स्टार्टअप्स को बयाना राशि (EMD) जमा करने से 100% छूट है [GFR 170(i)]।\n"
                "2. **पूर्व अनुभव व टर्नओवर छूट**: तकनीकी मानकों को पूरा करने पर पूर्व टर्नओवर और पूर्व अनुभव की शर्तों से छूट दी जा सकती है।\n"
                "3. **25% आरक्षण**: सरकारी विभागों द्वारा वार्षिक खरीद का कम से कम 25% MSEs से करना अनिवार्य है (जिसमें 4% SC/ST और 3% महिला उद्यमी शामिल हैं)।"
            )
        elif language == "mr":
            reply = (
                "**GeM वर MSME आणि स्टार्टअप्ससाठी विशेष सवलती:**\n\n"
                "1. **EMD फी माफी**: सर्व नोंदणीकृत MSEs आणि DPIIT स्टार्टअप्सना बयाणा रक्कम (EMD) भरण्यापासून १००% सूट आहे [GFR Rule 170(i)].\n"
                "2. **अनुभव व टर्नओव्हर सूट**: तांत्रिक निकष पूर्ण करत असल्यास मागील टर्नओव्हर आणि अनुभवाच्या अटींमधून सूट मिळते.\n"
                "3. **२५% आरक्षण**: सरकारी खरेदीमध्ये वार्षिक २५% खरेदी MSEs कडून करणे बंधनकारक आहे (४% SC/ST आणि ३% महिला उद्योजकांसाठी राखीव)."
            )
        else:
            reply = (
                "**Privileges & Exemptions for MSMEs and Startups on GeM:**\n\n"
                "1. **EMD Exemption**: All MSEs holding valid Udyam Registration and recognized DPIIT Startups enjoy **100% Earnest Money Deposit (EMD) waiver** [GFR Rule 170(i)].\n"
                "2. **Prior Experience & Turnover Relaxation**: Government buyers can relax prior turnover and past experience criteria subject to quality compliance.\n"
                "3. **25% Mandatory Procurement Target**: CPSEs and Central Ministries must procure at least **25%** of annual requirements from MSEs (including 4% SC/ST and 3% Women-owned MSEs)."
            )
        citations = ["Public Procurement Policy for MSEs Order 2012", "GFR 2017 Rule 170(i)"]

    # 4. Anti-Cartel & Collusion
    elif any(k in q_lower for k in ["cartel", "collusion", "fraud", "anomaly", "सिंडिकेट", "घोटाळा", "कार्टेल"]):
        if language == "hi":
            reply = (
                "**GeM AI एंटी-कार्टेल और बोली धांधली पहचान प्रणाली:**\n\n"
                "- **डिजिटल हस्ताक्षर (DSC) ऑडिट**: जब दो या दो से अधिक प्रतिस्पर्धी बोलियों को एक ही DSC या अधिकृत हस्ताक्षरकर्ता द्वारा अपलोड किया जाता है।\n"
                "- **नेटवर्क IP और सबनेट क्लस्टरिंग**: एक ही IP पते या नजदीकी समय स्लॉट में दर्ज की गई बोलियों को तुरंत कार्टेल रिस्क फ्लैग किया जाता है।\n"
                "- **मूल्य सिंडिकेटिंग**: जब सभी आपूर्तिकर्ता बेंचमार्क मूल्य से ठीक 0.1% - 0.5% के अंतर पर समान मूल्य उद्धृत करते हैं।\n"
                "आप हमारे **'Reverse Auction & Cartel Graph'** में जाकर इसका लाइव ग्राफिकल विश्लेषण देख सकते हैं!"
            )
        elif language == "mr":
            reply = (
                "**GeM AI अँटी-कार्टेल आणि मिलीभगत शोध प्रणाली:**\n\n"
                "- **DSC स्वाक्षरी तपासणी**: एकाच डिजिटल सिग्नेचर सर्टिफिकेट (DSC) द्वारे अनेक बोली अपलोड केल्यास प्रणाली त्वरित इशारा देते.\n"
                "- **IP सबनेट क्लस्टरिंग**: एकाच इंटरनेट IP पत्त्यावरून सबमिट केलेल्या प्रतिस्पर्धी बिड्स कार्टेल म्हणून फ्लॅग केल्या जातात.\n"
                "- **किंमत सिंडिकेटिंग**: जेव्हा स्पर्धक एकमेकांशी संगनमत करून अगदी थोड्या फरकाने किमती कोट करतात.\n"
                "तुम्ही **'Reverse Auction & Cartel Graph'** टॅबमध्ये जाऊन थेट ग्राफ पाहू शकता!"
            )
        else:
            reply = (
                "**GeM AI Anti-Cartel & Forensic Surveillance Engine:**\n\n"
                "- **Shared DSC Signatures**: Detects if multiple competing bids were digitally signed or uploaded using the identical Digital Signature Certificate token.\n"
                "- **IP / Subnet Clustering**: Flags collusive submissions originating from identical IP addresses or overlapping network subnets.\n"
                "- **Price Margin Clustering**: Neural network identifies artificial quote spacing (e.g. within 0.1% to 0.4%) designed to rotate contracts among cartel members.\n"
                "You can inspect live cartel clusters under the **'Reverse Auction & Cartel Graph'** view!"
            )
        citations = ["Competition Act 2002 Sec 3(3)", "GeM Forensic Vigilance Directive"]

    # 5. General GeM Overview
    else:
        if language == "hi":
            reply = (
                "**नमस्ते! मैं 'Ask GeMMy' हूँ — GeM AI अधिप्राप्ति सहायक।**\n\n"
                "मैं सरकारी खरीद, GFR 2017 नियमों, DPIIT मेक इन इंडिया, बिड मूल्यांकन और रिवर्स ऑक्शन से संबंधित आपके सभी प्रश्नों के उत्तर दे सकता हूँ।\n\n"
                "**आप मुझसे पूछ सकते हैं:**\n"
                "- GeM पर डायरेक्ट परचेस और L1 की सीमाएं क्या हैं?\n"
                "- MSME और स्टार्टअप्स के लिए EMD में क्या छूट है?\n"
                "- AI कार्टेल डिटेक्शन कैसे काम करता है?\n"
                "- क्लास-I और क्लास-II मेक इन इंडिया आपूर्तिकर्ता के नियम क्या हैं?"
            )
        elif language == "mr":
            reply = (
                "**नमस्कार! मी 'Ask GeMMy' — GeM AI खरेदी सहाय्यक आहे.**\n\n"
                "मी सरकारी खरेदी, GFR 2017 नियम, मेक इन इंडिया धोरण, बिड पडताळणी आणि रिव्हर्स ऑक्शनशी संबंधित आपल्या सर्व प्रश्नांची उत्तरे देण्यास तयार आहे.\n\n"
                "**तुम्ही मला विचारू शकता:**\n"
                "- GeM वर थेट खरेदी आणि L1 मर्यादा काय आहेत?\n"
                "- MSME आणि स्टार्टअप्सना EMD मध्ये काय सवलती मिळतात?\n"
                "- AI कार्टेल डिटेक्टर मिलीभगत कशी शोधतो?\n"
                "- Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम काय आहेत?"
            )
        else:
            reply = (
                "**Hello! I am 'Ask GeMMy (Powered by AI)' — your GeM Procurement Intelligence Assistant.**\n\n"
                "I provide end-to-end guidance on Government e-Marketplace procurement, GFR 2017 compliance, DPIIT Make in India criteria, and automated bid forensics.\n\n"
                "**Common topics you can explore:**\n"
                "- GFR Rule 149 Direct Purchase & L1 comparison limits\n"
                "- Class-I & Class-II Make-in-India local content percentages\n"
                "- EMD & turnover exemptions for MSMEs and DPIIT Startups\n"
                "- Anti-cartel graph detection & reverse auction rules\n"
                "- Live bid verification testing in the Sandbox"
            )
        citations = ["GFR 2017", "GeM Guidelines 2024"]

    return {
        "reply": reply,
        "citations": citations,
        "model": "GeM-RuleEngine-v2.0"
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
            {"label": "📋 GFR Rule 149 Limits", "query": "What are the GFR 2017 Rule 149 direct purchase and bidding limits?"},
            {"label": "🛡️ Make in India Class I & II", "query": "Explain DPIIT Make in India Class-I and Class-II supplier criteria."},
            {"label": "🏢 MSME & Startup Exemptions", "query": "What exemptions do MSME and Startups receive for EMD and turnover on GeM?"},
            {"label": "⚖️ Anti-Cartel Detection", "query": "How does GeM AI detect bidder cartels and collusive pricing?"},
            {"label": "⚡ Reverse Auction Rules", "query": "How does Reverse Auction (RA) elimination and timer extension work on GeM?"},
            {"label": "🔍 Live Bid Verifier", "query": "How can I verify my tender documents and check bid compliance score?"}
        ],
        "hi": [
            {"label": "📋 GFR 149 खरीद सीमाएं", "query": "GeM पर GFR 2017 नियम 149 के अनुसार डायरेक्ट परचेस की सीमाएं क्या हैं?"},
            {"label": "🛡️ मेक इन इंडिया नियम", "query": "DPIIT मेक इन इंडिया क्लास-I और क्लास-II स्थानीय आपूर्तिकर्ता के नियम समझाइए।"},
            {"label": "🏢 MSME व स्टार्टअप छूट", "query": "MSME और स्टार्टअप्स को GeM पर EMD और टर्नओवर में क्या छूट मिलती है?"},
            {"label": "⚖️ कार्टेल और फर्जीवाड़ा जांच", "query": "GeM AI बोलीदाताओं के कार्टेल और मिलीभगत की पहचान कैसे करता है?"},
            {"label": "⚡ रिवर्स ऑक्शन नियम", "query": "GeM पर रिवर्स ऑक्शन में बोली और समय विस्तार के क्या नियम हैं?"},
            {"label": "🔍 बिड सत्यापन सैंडबॉक्स", "query": "मैं अपने टेंडर दस्तावेजों की जांच और बिड स्कोर कैसे सत्यापित करूँ?"}
        ],
        "mr": [
            {"label": "📋 GFR 149 खरेदी मर्यादा", "query": "GeM पोर्टलवर GFR 2017 नियम 149 नुसार थेट खरेदी आणि निविदा मर्यादा काय आहेत?"},
            {"label": "🛡️ मेक इन इंडिया धोरण", "query": "DPIIT मेक इन इंडिया Class-I आणि Class-II स्थानिक पुरवठादारांचे नियम स्पष्ट करा."},
            {"label": "🏢 MSME व स्टार्टअप सवलती", "query": "MSME आणि स्टार्टअप्सना GeM वर EMD आणि टर्नओव्हरमध्ये काय सवलती मिळतात?"},
            {"label": "⚖️ कार्टेल व मिलीभगत तपासणी", "query": "GeM AI बोलीदारांची मिलीभगत आणि कार्टेल कसे शोधते?"},
            {"label": "⚡ रिव्हर्स ऑक्शन नियम", "query": "GeM वर रिव्हर्स ऑक्शन (RA) चे नियम आणि वेळ विस्तार कसा चालतो?"},
            {"label": "🔍 थेट बिड पडताळणी", "query": "मी माझ्या निविदा कागदपत्रांची पडताळणी आणि बिड स्कोअर कसा तपासावा?"}
        ]
    }
    return {"prompts": prompts_by_lang.get(language, prompts_by_lang["en"])}
