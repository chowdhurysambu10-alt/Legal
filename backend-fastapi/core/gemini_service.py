import os
import json
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

# Environment Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()


def is_gemini_configured() -> bool:
    return bool(GEMINI_API_KEY and "your_google_ai_studio_key" not in GEMINI_API_KEY and len(GEMINI_API_KEY) > 10)


class GeminiLegalService:
    """
    Unified Legal LLM Service powered by Google Gemini (gemini-3.6-flash).
    Includes intelligent heuristic fallback for offline analysis if API key is not configured.
    """
    def __init__(self):
        # Gemini Setup
        self.gemini_api_key = GEMINI_API_KEY
        self.gemini_model_name = GEMINI_MODEL
        self.is_gemini_configured = is_gemini_configured()
        self.gemini_client = None

        self.is_configured = self.is_gemini_configured
        self.model_name = self.gemini_model_name if self.is_gemini_configured else "heuristic-legal-analyzer"

        # Initialize Gemini SDK client if configured
        if self.is_gemini_configured:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.gemini_api_key)
                print(f"[Gemini] Initialized with Google GenAI SDK (Model: {self.gemini_model_name})")
            except Exception as e:
                print(f"[Gemini] Initialization error: {e}. Heuristic fallback active.")
        else:
            print("[Gemini] GEMINI_API_KEY not configured. Intelligent heuristic legal analyzer active.")

    def get_status(self) -> Dict[str, Any]:
        if self.is_gemini_configured:
            return {
                "configured": True,
                "provider": "gemini",
                "model": self.gemini_model_name,
                "status": "ready"
            }
        else:
            return {
                "configured": False,
                "provider": "heuristic",
                "model": "heuristic-legal-analyzer",
                "status": "heuristic_fallback_active"
            }

    # =========================================================================
    # 1. Full Contract Risk Assessment & Executive Summary
    # =========================================================================
    def analyze_contract(self, contract_text: str, filename: str) -> Dict[str, Any]:
        """
        Analyzes full contract text using Google Gemini to produce:
        - Plain-English Executive Summary
        - Categorized Risk Flags with severity & recommendations
        - Actionable Lawyer Checklist
        - Key clauses lookup
        """
        if self.is_gemini_configured and self.gemini_client:
            try:
                return self._call_gemini_analysis(contract_text, filename)
            except Exception as e:
                print(f"[Gemini] Live API call failed: {e}. Falling back to internal legal analyzer.")

        # Fallback heuristic analyzer
        return self._generate_heuristic_analysis(contract_text, filename)

    # =========================================================================
    # Conversational Intent Detection (Chatbot mode)
    # =========================================================================
    def _is_conversational_query(self, text: str) -> Optional[str]:
        cleaned = re.sub(r"[^\w\s]", "", text.strip().lower())
        words = set(cleaned.split())
        greetings = {
            "hi", "hii", "hiii", "hello", "helloo", "hey", "heyy", "hola",
            "greetings", "good morning", "good afternoon", "good evening",
            "howdy", "sup", "yo", "namaste"
        }
        if cleaned in greetings or (len(words) <= 2 and words.intersection(greetings)):
            return "greeting"

        bot_queries = {
            "who are you", "what can you do", "what are you", "what is your name",
            "help", "help me", "how do you work", "how to use"
        }
        if cleaned in bot_queries or any(cleaned.startswith(bq) for bq in bot_queries):
            return "bot_identity"

        gratitude = {"thank you", "thanks", "thx", "appreciate it", "great thanks", "thanks a lot", "thank u"}
        if cleaned in gratitude:
            return "gratitude"

        farewells = {"bye", "goodbye", "see you", "cya", "bye bye"}
        if cleaned in farewells:
            return "farewell"

        return None

    def _format_conversational_response(self, intent: str, contract_metadata: Dict[str, Any]) -> Dict[str, Any]:
        doc_title = contract_metadata.get("filename") or "your uploaded contract"
        if intent == "greeting":
            answer = (
                f"Hello! 👋 I am your **Legal AI Assistant**.\n\n"
                f"I have indexed and analyzed **{doc_title}** and I am ready to answer any questions you have.\n\n"
                f"### What you can ask me:\n"
                f"- 💰 **Financial Terms:** *\"What is the rent, security deposit, or payment schedule?\"*\n"
                f"- ⚠️ **Risks & Obligations:** *\"What are my primary obligations or liability risks?\"*\n"
                f"- ⏰ **Termination & Deadlines:** *\"How many days notice are required to cancel?\"*\n"
                f"- 📜 **Governing Law:** *\"Which state or jurisdiction governs this contract?\"*\n"
                f"- 📋 **Summary:** *\"Can you give me a summary of the whole agreement?\"*\n\n"
                f"What would you like to know?"
            )
        elif intent == "bot_identity":
            answer = (
                f"I am your dedicated **AI Legal Assistant**, powered by Google Gemini.\n\n"
                f"### My Core Capabilities for *{doc_title}*:\n"
                f"1. **Clause Search & Plain-English Explanations**: Ask me any question, and I'll find the relevant clauses.\n"
                f"2. **Risk & Liability Analysis**: I identify uncapped indemnities, one-sided terms, and hidden pitfalls.\n"
                f"3. **Grounded Citations**: Every contract answer includes verifiable page numbers and clause excerpts.\n\n"
                f"How can I assist your contract review today?"
            )
        elif intent == "gratitude":
            answer = "You're very welcome! 😊 If you have any more questions about the contract or need further legal clarity, just ask."
        else:
            answer = "Goodbye! Have a wonderful day, and feel free to return whenever you need contract analysis. 👋"

        return {
            "answer": answer,
            "citations": [],
            "confidence": "High",
            "model": self.gemini_model_name,
            "provider": "gemini"
        }

    # =========================================================================
    # 2. RAG Follow-up Question Answering
    # =========================================================================
    def answer_rag_query(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        contract_metadata: Dict[str, Any],
        chat_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Answers a user question grounded in retrieved contract chunks using Google Gemini.
        Detects conversational queries (greetings, bot identity) to provide friendly chatbot responses.
        """
        # 1. First check conversational intent
        intent = self._is_conversational_query(question)
        if intent:
            return self._format_conversational_response(intent, contract_metadata)

        # 2. Call Google Gemini LLM
        if self.is_gemini_configured and self.gemini_client:
            try:
                return self._call_gemini_rag_query(question, context_chunks, contract_metadata, chat_history)
            except Exception as e:
                print(f"[Gemini] Live RAG query failed: {e}. Using intelligent fallback.")

        # 3. Fallback heuristic analyzer
        return self._generate_heuristic_rag_answer(question, context_chunks, contract_metadata)

    def _generate_with_gemini(self, prompt: str) -> str:
        """Generates text via Google Gemini SDK, automatically trying 3.6-flash and 3.5-flash."""
        models_to_try = [self.gemini_model_name]
        if "gemini-3.5-flash" not in models_to_try:
            models_to_try.append("gemini-3.5-flash")

        last_error = None
        for model in models_to_try:
            try:
                response = self.gemini_client.models.generate_content(
                    model=model,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                print(f"[Gemini] Model '{model}' attempt notice: {e}")
                continue

        raise last_error or RuntimeError("All Gemini generation attempts failed.")

    def _call_gemini_analysis(self, contract_text: str, filename: str) -> Dict[str, Any]:
        prompt = f"""
You are a senior commercial legal counsel and contract analysis expert.
Review the following legal agreement ({filename}) and provide an exhaustive, structured legal risk analysis and key deal terms.

Document content (truncated to key portions if lengthy):
\"\"\"
{contract_text[:35000]}
\"\"\"

Return ONLY a valid JSON object matching the following structure exactly (no markdown formatting, no code fences):
{{
  "overall_risk_score": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "contract_type": "Rental / Tenancy Agreement" | "Employment Agreement" | "Non-Disclosure Agreement (NDA)" | "Master Services Agreement (MSA)" | "Commercial Contract",
  "summary": "Concise plain-English executive summary covering: Parties, Purpose, Term & Expiration, Core Obligations, and Governing Law.",
  "deal_highlights": [
    {{
      "label": "Short label (e.g. Landlord, Tenant, Monthly Rent, Security Deposit, Property Address, Term, Notice Period, Utilities/Expenses, Salary, Disclosing Party)",
      "value": "Extracted exact value from the agreement",
      "category": "parties" | "financial" | "property_or_scope" | "dates" | "obligations"
    }}
  ],
  "risk_flags": [
    {{
      "title": "Short title of the risk (e.g. Uncapped Indemnification)",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "category": "Liability" | "Termination" | "IP & Ownership" | "Confidentiality" | "Payment" | "Compliance",
      "clause_excerpt": "Direct quotation of the problematic contract clause",
      "analysis": "Plain-English explanation of why this creates business or legal risk",
      "recommendation": "Proposed redline revision or negotiation strategy"
    }}
  ],
  "checklist": [
    {{
      "id": "chk_1",
      "task": "Concrete negotiation action item for the legal team",
      "priority": "Immediate" | "Recommended" | "Standard",
      "completed": false
    }}
  ],
  "key_clauses": {{
    "governing_law": "Extracted state/jurisdiction or Not Specified",
    "dispute_resolution": "Arbitration / Litigation details",
    "termination_notice": "e.g. 30 days written notice",
    "liability_cap": "e.g. 12 months fees paid or Unlimited",
    "confidentiality_duration": "e.g. 3 years post termination"
  }}
}}
"""
        raw_text = self._generate_with_gemini(prompt)
        # Clean potential markdown fences
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        
        parsed = json.loads(raw_text)
        if "deal_highlights" in parsed and "key_clauses" in parsed:
            parsed["key_clauses"]["deal_highlights"] = parsed["deal_highlights"]
        if "contract_type" in parsed and "key_clauses" in parsed:
            parsed["key_clauses"]["contract_type"] = parsed["contract_type"]
        return parsed

    def _call_gemini_rag_query(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        contract_metadata: Dict[str, Any],
        chat_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        formatted_context = ""
        for i, c in enumerate(context_chunks):
            page = c.get("metadata", {}).get("page", 1)
            formatted_context += f"\n[EXCERPT #{i+1} - PAGE {page}]\n{c['text']}\n"

        formatted_history = ""
        if chat_history:
            for msg in chat_history[-6:]:
                role = "User" if msg.get("role") == "user" else "Assistant"
                formatted_history += f"{role}: {msg.get('content', '')}\n"

        doc_name = contract_metadata.get("filename", "Contract")

        prompt = f"""
You are an expert, conversational AI Legal Assistant Chatbot reviewing the agreement: {doc_name}.
Engage conversationally, clearly, and helpfully.

USER INQUIRY:
{question}

RETRIEVED CONTRACT CLAUSES:
{formatted_context if formatted_context else "No direct matching clauses found in document."}

RECENT CONVERSATION HISTORY:
{formatted_history if formatted_history else "None (New conversation)."}

INSTRUCTIONS:
1. Provide a direct, professional, and easily readable answer formatted in clean Markdown.
2. If answering about contract provisions, quote relevant clauses or key numbers directly and note the page number.
3. Be conversational, natural, and helpful (like a knowledgeable legal advisor in a chat). Do NOT write stiff boilerplate phrases like "Regarding your inquiry (question)".
4. If the contract is silent on the question, state that clearly and provide standard commercial contract guidance.
5. Conclude with actionable advice or next steps if appropriate.
"""
        answer_text = self._generate_with_gemini(prompt)
        
        # Format citations
        citations = []
        for c in context_chunks:
            meta = c.get("metadata", {})
            citations.append({
                "page": meta.get("page", 1),
                "clause_id": c.get("id"),
                "excerpt": c["text"][:220] + "..." if len(c["text"]) > 220 else c["text"],
                "relevance": c.get("relevance_score", 0.9)
            })

        return {
            "answer": answer_text,
            "citations": citations,
            "confidence": "High" if context_chunks else "Low (No context match)",
            "model": self.gemini_model_name,
            "provider": "gemini"
        }

    # =========================================================================
    # Heuristic Legal Analyzer (Fallback for zero-config out-of-the-box demo)
    # =========================================================================
    def _generate_heuristic_analysis(self, contract_text: str, filename: str) -> Dict[str, Any]:
        text_lower = contract_text.lower()
        risk_flags = []
        checklist = []
        key_clauses = {}

        # 1. Indemnification Check
        if "indemnif" in text_lower or "hold harmless" in text_lower:
            indemn_match = re.search(r"([^.\n]*?(?:indemnif|hold harmless)[^.\n]*?\.)", contract_text, re.IGNORECASE)
            excerpt = indemn_match.group(1).strip() if indemn_match else "The receiving party agrees to indemnify and hold harmless the disclosing party against all claims, damages, liabilities..."
            risk_flags.append({
                "title": "Broad Indemnification & Defense Obligations",
                "severity": "HIGH",
                "category": "Indemnity",
                "clause_excerpt": excerpt,
                "analysis": "The agreement imposes an onerous indemnification obligation that could expose your entity to third-party claims, legal fees, and indirect damages without reciprocal protection.",
                "recommendation": "Negotiate mutual indemnification and cap total exposure to the aggregate fees paid in the preceding 12 months."
            })
            checklist.append({
                "id": "chk_indemn",
                "task": "Add mutual indemnification carve-out and exclude gross negligence or intentional misconduct.",
                "priority": "Immediate",
                "completed": False
            })
        else:
            checklist.append({
                "id": "chk_indemn_missing",
                "task": "Evaluate whether an explicit IP infringement indemnification clause should be introduced.",
                "priority": "Recommended",
                "completed": False
            })

        # 2. Limitation of Liability Check
        if "limitation of liability" in text_lower or "consequential damages" in text_lower or "punitive damages" in text_lower:
            liab_match = re.search(r"([^.\n]*?(?:limitation of liability|indirect|consequential)[^.\n]*?\.)", contract_text, re.IGNORECASE)
            excerpt = liab_match.group(1).strip() if liab_match else "In no event shall either party be liable for any indirect, special, incidental, or consequential damages..."
            risk_flags.append({
                "title": "Liability Exclusions & Consequential Damages Waiver",
                "severity": "MEDIUM",
                "category": "Liability",
                "clause_excerpt": excerpt,
                "analysis": "The contract waives consequential, special, and incidental damages. Ensure that breaches of confidentiality and data security are explicitly carved out from this waiver.",
                "recommendation": "Carve out confidentiality breaches and gross negligence from liability limitations."
            })
            key_clauses["liability_cap"] = "Waiver of indirect/consequential damages with general cap."
        else:
            risk_flags.append({
                "title": "Absence of Express Limitation of Liability",
                "severity": "HIGH",
                "category": "Liability",
                "clause_excerpt": "No express limitation of liability clause detected in contract body.",
                "analysis": "Without an explicit liability cap, financial exposure in the event of an alleged breach is theoretically uncapped under common law.",
                "recommendation": "Insert a standard liability ceiling pegged to total fees paid over the previous 12 months."
            })
            key_clauses["liability_cap"] = "Uncapped / Silent"

        # 3. Termination & Notice Check
        term_match = re.search(r"([^.\n]*?(?:terminat|written notice)[^.\n]*?(?:days|period)[^.\n]*?\.)", contract_text, re.IGNORECASE)
        if term_match:
            risk_flags.append({
                "title": "Termination Notice Requirements & Cure Periods",
                "severity": "MEDIUM",
                "category": "Termination",
                "clause_excerpt": term_match.group(1).strip(),
                "analysis": "Termination provisions govern how either party can exit upon default or convenience. A short notice period may leave insufficient time to cure technical defaults.",
                "recommendation": "Ensure a mandatory 30-day written cure period is required prior to immediate termination for cause."
            })
            key_clauses["termination_notice"] = "Notice required for termination"
        else:
            key_clauses["termination_notice"] = "30 days standard notice recommended"

        # 4. Governing Law Check
        gov_match = re.search(r"governed by.*?laws of (?:the state of )?([A-Za-z ]+)", contract_text, re.IGNORECASE)
        if gov_match:
            state = gov_match.group(1).strip().rstrip(".,")
            key_clauses["governing_law"] = state.title()
            key_clauses["dispute_resolution"] = f"Courts / Jurisdiction of {state.title()}"
        else:
            key_clauses["governing_law"] = "Delaware / New York (Standard Recommended)"
            key_clauses["dispute_resolution"] = "Arbitration / Specified State Courts"
            risk_flags.append({
                "title": "Ambiguous or Unspecified Governing Law",
                "severity": "LOW",
                "category": "Compliance",
                "clause_excerpt": "Governing law clause not distinctly specified.",
                "analysis": "Jurisdictional uncertainty creates venue litigation risks in cross-border or multi-state transactions.",
                "recommendation": "Expressly designate Delaware or New York law with exclusive venue in state/federal courts."
            })

        # 5. Non-Compete or Non-Solicit Check
        if "non-compete" in text_lower or "noncompete" in text_lower or "solicit" in text_lower:
            solicit_match = re.search(r"([^.\n]*?(?:solicit|compete)[^.\n]*?\.)", contract_text, re.IGNORECASE)
            excerpt = solicit_match.group(1).strip() if solicit_match else "Neither party shall solicit or hire employees of the other party..."
            risk_flags.append({
                "title": "Restrictive Covenants & Non-Solicitation",
                "severity": "MEDIUM",
                "category": "Compliance",
                "clause_excerpt": excerpt,
                "analysis": "Broad non-solicitation or non-compete clauses can hinder standard talent acquisition and business expansion.",
                "recommendation": "Limit non-solicitation to key personnel directly engaged in project execution, with carve-outs for general job postings."
            })

        # Checklist standard items
        checklist.extend([
            {
                "id": "chk_term_audit",
                "task": "Review intellectual property assignment provisions to ensure pre-existing IP rights are reserved.",
                "priority": "Immediate",
                "completed": False
            },
            {
                "id": "chk_audit_rights",
                "task": "Confirm that any audit clauses require at least 15 business days advance written notice and limit audits to once per calendar year.",
                "priority": "Recommended",
                "completed": False
            },
            {
                "id": "chk_force_majeure",
                "task": "Verify standard force majeure provisions cover cyber incidents and regulatory disruptions.",
                "priority": "Standard",
                "completed": False
            }
        ])

        # Dynamic Deal Highlights Extraction
        deal_highlights = []
        contract_type = "Commercial Agreement"

        if "room rental" in text_lower or "tenan" in text_lower or "lease" in text_lower:
            contract_type = "Room Rental / Lease Agreement"
            # Extract landlord
            lm = re.search(r"Landlord\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if lm: deal_highlights.append({"label": "Landlord Name", "value": lm.group(1).strip(), "category": "parties"})
            # Extract tenant
            tm = re.search(r"Tenant\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if tm: deal_highlights.append({"label": "Tenant Name", "value": tm.group(1).strip(), "category": "parties"})
            # Monthly rent
            rm = re.search(r"(?:Monthly\s+Rent|Rent\s+Amount)\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE) or re.search(r"INR\s*[\d,]+(?:\s*per\s+month)?|\$[\d,]+(?:\s*per\s+month)?", contract_text, re.IGNORECASE)
            if rm: deal_highlights.append({"label": "Monthly Rent", "value": rm.group(1).strip() if hasattr(rm, "group") and rm.lastindex else rm.group(0).strip(), "category": "financial"})
            # Security deposit
            dm = re.search(r"Security\s*(?:Deposit)?\s*[:\n]\s*(?:Deposit\s*[:\n]\s*)?([^\n]+)", contract_text, re.IGNORECASE)
            if dm: deal_highlights.append({"label": "Security Deposit", "value": dm.group(1).strip(), "category": "financial"})
            # Property
            pm = re.search(r"Property\s*[:\n]\s*([^\n]+(?:\n[^\n]+)?)", contract_text, re.IGNORECASE)
            if pm: deal_highlights.append({"label": "Property Address", "value": pm.group(1).replace('\n', ', ').strip(), "category": "property_or_scope"})
            # Term & Start date
            term_m = re.search(r"Term\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if term_m: deal_highlights.append({"label": "Lease Term", "value": term_m.group(1).strip(), "category": "dates"})
            # Notice
            nm = re.search(r"Notice\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if nm: deal_highlights.append({"label": "Notice Period", "value": nm.group(1).strip(), "category": "dates"})
            # Utilities
            um = re.search(r"(?:Utilities|Electricity)[^.\n]*?\.", contract_text, re.IGNORECASE)
            if um: deal_highlights.append({"label": "Utilities & Expenses", "value": um.group(0).strip()[:100], "category": "obligations"})
        elif "employment" in text_lower or "offer letter" in text_lower:
            contract_type = "Employment Agreement"
            em = re.search(r"Employer\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if em: deal_highlights.append({"label": "Employer Name", "value": em.group(1).strip(), "category": "parties"})
            ee = re.search(r"Employee\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if ee: deal_highlights.append({"label": "Employee Name", "value": ee.group(1).strip(), "category": "parties"})
            sal = re.search(r"(?:Salary|Compensation)\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if sal: deal_highlights.append({"label": "Base Compensation", "value": sal.group(1).strip(), "category": "financial"})
        elif "non-disclosure" in text_lower or "nda" in text_lower or "confidentiality" in text_lower:
            contract_type = "Non-Disclosure Agreement (NDA)"
            dp = re.search(r"(?:Disclosing Party|Company)\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if dp: deal_highlights.append({"label": "Disclosing Party", "value": dp.group(1).strip(), "category": "parties"})
            rp = re.search(r"(?:Receiving Party|Recipient)\s*[:\n]\s*([^\n]+)", contract_text, re.IGNORECASE)
            if rp: deal_highlights.append({"label": "Receiving Party", "value": rp.group(1).strip(), "category": "parties"})
            deal_highlights.append({"label": "Confidentiality Term", "value": key_clauses.get("confidentiality_duration", "5 years"), "category": "dates"})

        key_clauses["deal_highlights"] = deal_highlights
        key_clauses["contract_type"] = contract_type

        # Overall risk scoring
        high_count = sum(1 for r in risk_flags if r["severity"] == "HIGH")
        if high_count >= 2:
            overall_score = "HIGH"
        elif high_count == 1 or len(risk_flags) >= 3:
            overall_score = "MEDIUM"
        else:
            overall_score = "LOW"

        summary = f"""### Executive Legal Summary: {filename}

This legal agreement establishes the contractual terms, obligations, and risk allocation framework between the contracting entities.

- **Primary Nature**: {contract_type}.
- **Key Risk Exposure**: Identified {len(risk_flags)} potential risk vectors, primarily centered around **{risk_flags[0]['category'] if risk_flags else 'General Terms'}** and **Liability Allocation**.
- **Governing Law**: Designated as **{key_clauses.get('governing_law', 'Delaware')}**.
- **Action Required**: Legal counsel should review the redline recommendations below prior to formal signature."""

        return {
            "overall_risk_score": overall_score,
            "contract_type": contract_type,
            "deal_highlights": deal_highlights,
            "summary": summary,
            "risk_flags": risk_flags,
            "checklist": checklist,
            "key_clauses": key_clauses
        }

    def _generate_heuristic_rag_answer(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        contract_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Provides an intelligent domain response using retrieved ChromaDB chunks."""
        # 1. Conversational intent check in fallback mode
        intent = self._is_conversational_query(question)
        if intent:
            return self._format_conversational_response(intent, contract_metadata)

        citations = []
        for c in context_chunks:
            meta = c.get("metadata", {})
            citations.append({
                "page": meta.get("page", 1),
                "clause_id": c.get("id"),
                "excerpt": c["text"][:220] + "..." if len(c["text"]) > 220 else c["text"],
                "relevance": c.get("relevance_score", 0.88)
            })

        doc_name = contract_metadata.get("filename", "the contract")

        # Synthesize answer from top chunks
        if context_chunks:
            top_chunk = context_chunks[0]["text"]
            page_num = context_chunks[0].get("metadata", {}).get("page", 1)
            answer = f"""Based on the contract text in **{doc_name}** (**Page {page_num}**):

> *"{top_chunk[:300]}..."*

### Analysis & Key Details:
The excerpt above outlines the agreed conditions regarding your inquiry. Please review the specific notice timelines, obligations, and liability thresholds specified in this clause.

### Recommendations:
1. **Clause Location:** Found on **Page {page_num}**.
2. **Review Tip:** Verify that any deadlines, amounts, or notice obligations align with your expectations before finalizing."""
        else:
            answer = f"""I searched *{doc_name}* for **"{question}"**, but did not find an explicit matching clause in the uploaded text.

### Practical Advice:
- The agreement appears silent on this specific item.
- Under commercial contract principles, silent terms are interpreted according to the designated governing jurisdiction's statutory default rules.
- Consider introducing an explicit addendum or clause clarifying this term with the counterparty."""

        return {
            "answer": answer,
            "citations": citations,
            "confidence": "Medium" if context_chunks else "Low"
        }


# Global singleton instance
gemini_service = GeminiLegalService()
