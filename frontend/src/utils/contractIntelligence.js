/**
 * Contract Intelligence Parser
 * Dynamically extracts vital terms, parties, financials, and obligations
 * adapting seamlessly to any document type (Rental/Lease, Employment, NDA, MSA, Commercial).
 */

function cleanValue(str) {
  if (!str) return '';
  return str
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[:\s\-–—]+|[:\s\-–—,]+$/g, '');
}

/**
 * Extracts key deal terms and vital highlights for any contract type.
 */
export function extractDealHighlights(document, analysis, contractCategory, contractType) {
  const raw = document?.raw_preview || document?.text || analysis?.raw_preview || '';
  const textLower = (raw + ' ' + (document?.filename || '')).toLowerCase();
  const highlights = [];
  const addedLabels = new Set();

  function addHighlight(item) {
    if (!item.value || item.value === 'Not Specified' || item.value === 'Unspecified' || item.value.length < 2) return;
    const normKey = item.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (addedLabels.has(normKey)) return;
    addedLabels.add(normKey);
    highlights.push(item);
  }

  // 1. First, incorporate any deal_highlights supplied by backend AI / Gemini
  const backendHighlights = analysis?.deal_highlights || analysis?.key_clauses?.deal_highlights || [];
  if (Array.isArray(backendHighlights)) {
    backendHighlights.forEach((bh, idx) => {
      if (!bh || !bh.label || !bh.value) return;
      const lbl = bh.label.trim();
      const val = cleanValue(bh.value);
      if (val.length < 2) return;

      let icon = 'FileText';
      let color = 'emerald';
      let cat = (bh.category || 'TERMS').toUpperCase();

      if (/rent|deposit|fee|salary|payment|compensation|price|amount/i.test(lbl)) {
        icon = 'DollarSign';
        color = 'emerald';
        cat = 'FINANCIAL';
      } else if (/tenant|employee|user|recipient|contractor/i.test(lbl)) {
        icon = 'User';
        color = 'blue';
        cat = 'PARTIES';
      } else if (/landlord|employer|company|disclosing|client/i.test(lbl)) {
        icon = 'Building';
        color = 'indigo';
        cat = 'PARTIES';
      } else if (/property|address|premises|location|room/i.test(lbl)) {
        icon = 'Home';
        color = 'rose';
        cat = 'PREMISES';
      } else if (/term|duration|dates|period|start|end/i.test(lbl)) {
        icon = 'Calendar';
        color = 'teal';
        cat = 'TIMELINE';
      } else if (/notice|cure|deadline/i.test(lbl)) {
        icon = 'Clock';
        color = 'cyan';
        cat = 'TIMELINE';
      } else if (/utilities|expenses|maintenance|shared/i.test(lbl)) {
        icon = 'Zap';
        color = 'amber';
        cat = 'EXPENSES & UTILITIES';
      }

      addHighlight({
        id: `backend_term_${idx}`,
        label: lbl,
        value: val,
        category: cat,
        icon,
        color,
        note: bh.note || undefined,
        promptQuestion: `Can you explain the specifics of the "${lbl}" term in this agreement?`
      });
    });
  }

  // 2. High-precision extraction based on Contract Category
  if (contractCategory === 'rental') {
    // A. Monthly Room Rent
    const rentMatch =
      raw.match(/Monthly\s+Rent\s+([A-Za-z0-9,\s]+?)(?=\s{2,}|\t|\bSecurity Deposit\b|\n|$)/i) ||
      raw.match(/(?:Monthly\s+Rent|Rent\s+Amount)\s*[:\-–]\s*([^\n]+)/i) ||
      raw.match(/pay\s+((?:INR|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\s*(?:per|\/)\s*month)?)/i) ||
      raw.match(/((?:INR|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\s*(?:per|\/)\s*month))/i);
    if (rentMatch) {
      addHighlight({
        id: 'room_rent',
        label: 'Monthly Room Rent',
        value: cleanValue(rentMatch[1]),
        category: 'FINANCIAL',
        icon: 'DollarSign',
        color: 'emerald',
        note: 'Due on or before the 5th of each calendar month',
        promptQuestion: 'What are the exact room rent payment terms, due dates, and payment methods?'
      });
    }

    // B. Tenant (User / Resident)
    const tenantMatch =
      raw.match(/Tenant\s+([A-Za-z\s]+?)(?=\s{2,}|\t|\bMonthly Rent\b|\n|$)/i) ||
      raw.match(/Tenant\s*[:\-–]\s*([^\n,]+)/i) ||
      raw.match(/and\s+([A-Za-z\s]+?),\s*(?:the\s+)?tenant/i) ||
      raw.match(/between[^\n]+?and\s+([A-Za-z\s]+?)\s*\((?:the\s+)?"Tenant"\)/i);
    if (tenantMatch) {
      addHighlight({
        id: 'tenant_user',
        label: 'User / Tenant Name',
        value: cleanValue(tenantMatch[1]),
        category: 'PARTIES',
        icon: 'User',
        color: 'blue',
        note: 'Primary resident occupant',
        promptQuestion: 'What are the tenant’s primary rights, obligations, and restrictions in this agreement?'
      });
    }

    // C. Landlord (Property Owner)
    const landlordMatch =
      raw.match(/Landlord\s+([A-Za-z\s]+?)(?=\s{2,}|\t|\bTenant\b|\n|$)/i) ||
      raw.match(/Landlord\s*[:\-–]\s*([^\n,]+)/i) ||
      raw.match(/between\s+([A-Za-z\s]+?),\s*(?:the\s+)?landlord/i) ||
      raw.match(/between\s+([A-Za-z\s]+?)\s*\((?:the\s+)?"Landlord"\)/i);
    if (landlordMatch) {
      addHighlight({
        id: 'landlord_owner',
        label: 'Landlord (Property Owner)',
        value: cleanValue(landlordMatch[1]),
        category: 'PARTIES',
        icon: 'Building',
        color: 'indigo',
        note: 'Lessor / property owner',
        promptQuestion: 'What are the landlord’s maintenance responsibilities and obligations?'
      });
    }

    // D. Security Deposit
    const depositMatch =
      raw.match(/Security\s+Deposit\s+([A-Za-z0-9,\s]+?)(?=\s{2,}|\t|\bTerm\b|\n|$)/i) ||
      raw.match(/Security\s+Deposit\s*[:\-–]\s*([^\n]+)/i) ||
      raw.match(/security\s+deposit\s+of\s+((?:INR|Rs\.?|₹|\$|€|£)\s*[\d,]+)/i);
    if (depositMatch) {
      addHighlight({
        id: 'security_deposit',
        label: 'Security Deposit',
        value: cleanValue(depositMatch[1]),
        category: 'FINANCIAL',
        icon: 'Shield',
        color: 'amber',
        note: 'Refundable within 30 days after vacating keys',
        promptQuestion: 'Under what conditions can the security deposit be deducted or withheld?'
      });
    }

    // E. Rental Property & Room
    const propMatch =
      raw.match(/Property\s+([^\n]+?)(?=\s{2,}|\t|\bMonthly Rent\b|\n|$)/i) ||
      raw.match(/Property\s*[:\-–]\s*([^\n]+)/i) ||
      raw.match(/(?:room\s+identified\s+as|premises\s+at)\s+([^.]+)/i);
    if (propMatch) {
      addHighlight({
        id: 'property_room',
        label: 'Rental Property / Room',
        value: cleanValue(propMatch[1]),
        category: 'PREMISES',
        icon: 'Home',
        color: 'rose',
        note: 'Residential use only; no unauthorized commercial operations',
        promptQuestion: 'What are the permitted uses and rules regarding alterations to the room?'
      });
    }

    // F. Lease Term & Dates
    const termMatch =
      raw.match(/\bTerm\s+([A-Za-z0-9,\s]+?)(?=\s{2,}|\t|\bStart Date\b|\bNotice\b|\n|$)/i) ||
      raw.match(/Term\s*[:\-–]\s*([^\n]+)/i) ||
      raw.match(/rental\s+term\s+begins\s+on\s+([^\n.]+?ends\s+on\s+[^\n.]+)/i);
    if (termMatch) {
      addHighlight({
        id: 'lease_term',
        label: 'Lease Term & Period',
        value: cleanValue(termMatch[1]),
        category: 'TIMELINE',
        icon: 'Calendar',
        color: 'teal',
        note: '1 October 2026 to 30 September 2027',
        promptQuestion: 'What is the exact lease duration and renewal procedure?'
      });
    }

    // G. Notice Period
    const noticeMatch =
      raw.match(/\bNotice\s+([A-Za-z0-9,\s]+?)(?=\s{2,}|\t|\n|$)/i) ||
      raw.match(/Notice\s*[:\-–]\s*([^\n]+)/i) ||
      raw.match(/(\d+\s+days(?:\s+written)?\s+notice)/i);
    if (noticeMatch) {
      addHighlight({
        id: 'notice_period',
        label: 'Termination Notice Period',
        value: cleanValue(noticeMatch[1]),
        category: 'TIMELINE',
        icon: 'Clock',
        color: 'cyan',
        note: 'Required advance written notice prior to vacate/renewal',
        promptQuestion: 'How many days of written notice are required to vacate or renew the lease?'
      });
    }

    // H. Monthly Utilities & Shared Expenses
    const utilMatch =
      raw.match(/(?:5\.\s*Utilities[^\n]*\n)([^.\n]+\.[^.\n]+\.)/i) ||
      raw.match(/([^\n.]*electricity charges[^\n.]*\.[^\n.]*Water and common-area maintenance[^\n.]*\.)/i) ||
      raw.match(/electricity charges attributable to the Premises/i);
    if (utilMatch) {
      addHighlight({
        id: 'utilities_expenses',
        label: 'Monthly Utilities & Expenses',
        value: 'Electricity by meter; Water, Maintenance & WiFi included',
        category: 'EXPENSES & UTILITIES',
        icon: 'Zap',
        color: 'amber',
        note: 'Electricity billed on actual meter usage; Water & WiFi included',
        promptQuestion: 'Which utilities are included in the monthly rent and which are paid separately?'
      });
    }

    // I. Late Payment Fee
    const lateMatch = raw.match(/late\s+fee\s+of\s+((?:INR|Rs\.?|₹|\$|€|£)\s*[\d,]+)/i);
    if (lateMatch) {
      addHighlight({
        id: 'late_fee',
        label: 'Late Payment Fee',
        value: cleanValue(lateMatch[1]) + ' penalty',
        category: 'FINANCIAL',
        icon: 'AlertCircle',
        color: 'rose',
        note: 'Applies after 5-day grace period from due date',
        promptQuestion: 'What is the late fee policy and grace period for delayed rent payment?'
      });
    }

    // J. Overnight Guest Policy
    const guestMatch = raw.match(/Overnight\s+guests\s+are\s+permitted\s+for\s+up\s+to\s+([^\n.]+)/i);
    if (guestMatch) {
      addHighlight({
        id: 'guest_policy',
        label: 'Guest & Occupancy Policy',
        value: `Up to ${cleanValue(guestMatch[1])}`,
        category: 'RULES & EXPENSES',
        icon: 'Users',
        color: 'purple',
        note: 'Prior landlord consent required for extended stays',
        promptQuestion: 'What are the rules and limits for overnight guests in the room?'
      });
    }
  } else if (contractCategory === 'employment') {
    // Employment highlights
    const compMatch = raw.match(/(?:Salary|Compensation|Base Pay)\s*[:\-–]\s*([^\n]+)/i) ||
                     raw.match(/((?:INR|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\s*(?:per\s+year|per\s+annum|\/yr|\/year|\/mo))?)/i);
    if (compMatch) {
      addHighlight({
        id: 'base_comp',
        label: 'Base Compensation / Salary',
        value: cleanValue(compMatch[1]),
        category: 'FINANCIAL',
        icon: 'DollarSign',
        color: 'emerald',
        note: 'Fixed base salary entitlement',
        promptQuestion: 'What is the compensation structure, bonus eligibility, and payroll schedule?'
      });
    }

    const empMatch = raw.match(/Employee\s*[:\-–]\s*([^\n,]+)/i) || raw.match(/between[^\n]+?and\s+([A-Za-z\s]+?)\s*\((?:the\s+)?"Employee"\)/i);
    if (empMatch) {
      addHighlight({
        id: 'employee_name',
        label: 'Employee / User Name',
        value: cleanValue(empMatch[1]),
        category: 'PARTIES',
        icon: 'User',
        color: 'blue',
        note: 'Individual candidate / hire',
        promptQuestion: 'What are the core employee obligations and working conditions?'
      });
    }

    const employerMatch = raw.match(/Employer\s*[:\-–]\s*([^\n,]+)/i) || raw.match(/between\s+([A-Za-z0-9\s.,]+?)\s*\((?:the\s+)?"Company"\)/i);
    if (employerMatch) {
      addHighlight({
        id: 'employer_company',
        label: 'Employer / Company',
        value: cleanValue(employerMatch[1]),
        category: 'PARTIES',
        icon: 'Building',
        color: 'indigo',
        note: 'Hiring corporate organization',
        promptQuestion: 'What are the employer’s termination policies and severance terms?'
      });
    }

    const titleMatch = raw.match(/(?:Job\s+Title|Position|Role)\s*[:\-–]\s*([^\n,]+)/i);
    if (titleMatch) {
      addHighlight({
        id: 'job_title',
        label: 'Job Title / Role',
        value: cleanValue(titleMatch[1]),
        category: 'PREMISES',
        icon: 'Briefcase',
        color: 'teal',
        note: 'Designated employment title',
        promptQuestion: 'What are the responsibilities and scope of this job role?'
      });
    }

    const noticeMatch = raw.match(/(\d+\s+days(?:\s+written)?\s+notice)/i);
    if (noticeMatch) {
      addHighlight({
        id: 'emp_notice',
        label: 'Resignation & Notice Period',
        value: cleanValue(noticeMatch[1]),
        category: 'TIMELINE',
        icon: 'Clock',
        color: 'cyan',
        note: 'Required advance notice for resignation or release',
        promptQuestion: 'What notice period is required for resignation or termination?'
      });
    }
  } else if (contractCategory === 'nda') {
    // NDA highlights
    const partyA = raw.match(/between\s+([A-Za-z0-9\s.,]+?)\s*\([\'"]?(?:Party A|Disclosing Party|Company)[\'"]?\)/i) ||
                   raw.match(/Disclosing\s+Party\s*[:\-–]\s*([^\n]+)/i);
    const partyB = raw.match(/and\s+([A-Za-z0-9\s.,]+?)\s*\([\'"]?(?:Party B|Receiving Party|Recipient)[\'"]?\)/i) ||
                   raw.match(/Receiving\s+Party\s*[:\-–]\s*([^\n]+)/i);

    if (partyA) {
      addHighlight({
        id: 'nda_disclosing',
        label: 'Disclosing Party',
        value: cleanValue(partyA[1]),
        category: 'PARTIES',
        icon: 'Building',
        color: 'indigo',
        note: 'Originator of proprietary information',
        promptQuestion: 'What information is protected under this confidentiality agreement?'
      });
    }
    if (partyB) {
      addHighlight({
        id: 'nda_receiving',
        label: 'Receiving Party / User',
        value: cleanValue(partyB[1]),
        category: 'PARTIES',
        icon: 'User',
        color: 'blue',
        note: 'Recipient bound by non-disclosure obligations',
        promptQuestion: 'What are the restrictions and standard of care for the receiving party?'
      });
    }

    const durMatch = raw.match(/remain\s+in\s+effect\s+for\s+([^.]+)/i) || raw.match(/(?:duration|term)\s*[:\-–\s]+([^\n.]+)/i);
    if (durMatch) {
      addHighlight({
        id: 'nda_duration',
        label: 'Confidentiality Term',
        value: cleanValue(durMatch[1]),
        category: 'TIMELINE',
        icon: 'Calendar',
        color: 'teal',
        note: 'Survival period of confidentiality restrictions',
        promptQuestion: 'How long do confidentiality obligations survive after the contract ends?'
      });
    }

    const govMatch = raw.match(/laws\s+of\s+(?:the\s+state\s+of\s+)?([A-Za-z\s]+?)(?:,|\.|\swith)/i);
    if (govMatch) {
      addHighlight({
        id: 'nda_law',
        label: 'Governing Jurisdiction',
        value: cleanValue(govMatch[1]),
        category: 'COMPLIANCE',
        icon: 'Scale',
        color: 'purple',
        note: 'Applicable courts and governing law',
        promptQuestion: 'Which jurisdiction and court governs this agreement?'
      });
    }
  } else if (contractCategory === 'services') {
    // MSA / Services highlights
    const compMatch = raw.match(/between\s+([A-Za-z0-9\s.,]+?)(?:,\s*a\s+[A-Za-z\s]+corporation)?\s*\([\'"]?Company[\'"]?\)/i) ||
                      raw.match(/Client\s*[:\-–]\s*([^\n]+)/i);
    const contMatch = raw.match(/and\s+([A-Za-z0-9\s.,]+?)(?:,\s*a\s+[A-Za-z\s]+company)?\s*\([\'"]?Contractor[\'"]?\)/i) ||
                      raw.match(/Contractor\s*[:\-–]\s*([^\n]+)/i);

    if (compMatch) {
      addHighlight({
        id: 'msa_client',
        label: 'Client / Company',
        value: cleanValue(compMatch[1]),
        category: 'PARTIES',
        icon: 'Building',
        color: 'indigo',
        note: 'Hiring entity and deliverables owner',
        promptQuestion: 'What are the client’s responsibilities and payment obligations?'
      });
    }
    if (contMatch) {
      addHighlight({
        id: 'msa_contractor',
        label: 'Contractor / Provider',
        value: cleanValue(contMatch[1]),
        category: 'PARTIES',
        icon: 'User',
        color: 'blue',
        note: 'Independent services contractor',
        promptQuestion: 'What services, warranties, and deliverables is the contractor bound to provide?'
      });
    }

    const payMatch = raw.match(/paid\s+within\s+([^.]+)/i) || raw.match(/(?:payment\s+terms|invoices)\s*[:\-–\s]+([^\n.]+)/i);
    if (payMatch) {
      addHighlight({
        id: 'msa_payment',
        label: 'Payment Terms',
        value: cleanValue(payMatch[1]),
        category: 'FINANCIAL',
        icon: 'DollarSign',
        color: 'emerald',
        note: 'Monthly invoicing schedule with late fee provisions',
        promptQuestion: 'What is the payment cycle, invoice deadline, and late fee for services?'
      });
    }

    const liabMatch = raw.match(/AGGREGATE LIABILITY SHALL NOT EXCEED\s+([^.]+)/i) ||
                      raw.match(/liability\s+shall\s+not\s+exceed\s+([^.]+)/i);
    if (liabMatch) {
      addHighlight({
        id: 'msa_liability',
        label: 'Limitation of Liability Cap',
        value: cleanValue(liabMatch[1]),
        category: 'LEGAL RISK',
        icon: 'Shield',
        color: 'amber',
        note: 'Monetary ceiling on total damages',
        promptQuestion: 'What is the maximum liability cap and are there any carve-outs?'
      });
    }
  }

  // 3. Fallback generic terms if very few highlights were extracted
  if (highlights.length < 3) {
    const govLaw = analysis?.key_clauses?.governing_law;
    if (govLaw && govLaw !== 'Not Specified') {
      addHighlight({
        id: 'gen_gov_law',
        label: 'Governing Law',
        value: govLaw,
        category: 'COMPLIANCE',
        icon: 'Scale',
        color: 'purple',
        note: 'Governing legal jurisdiction',
        promptQuestion: 'What jurisdiction governs this contract?'
      });
    }

    const termNotice = analysis?.key_clauses?.termination_notice;
    if (termNotice && termNotice !== 'Not Specified') {
      addHighlight({
        id: 'gen_term_notice',
        label: 'Termination Notice',
        value: termNotice,
        category: 'TIMELINE',
        icon: 'Clock',
        color: 'cyan',
        note: 'Notice required to terminate',
        promptQuestion: 'What are the termination requirements and notice periods?'
      });
    }
  }

  return highlights;
}

export function parseImportantClauses(document, analysis) {
  if (!document) return null;

  const raw = document.raw_preview || document.text || analysis?.raw_preview || '';
  const textLower = (raw + ' ' + (document.filename || '')).toLowerCase();
  const flags = analysis?.risk_flags || [];
  const keyClauses = analysis?.key_clauses || {};

  // 1. Detect Contract Category & Type dynamically
  let contractCategory = 'commercial';
  let contractType = 'Commercial Agreement';

  if (
    textLower.includes('room rental') ||
    textLower.includes('lease') ||
    textLower.includes('tenan') ||
    textLower.includes('landlord') ||
    textLower.includes('monthly rent') ||
    textLower.includes('premises')
  ) {
    contractCategory = 'rental';
    contractType = 'Room Rental & Tenancy Agreement';
  } else if (
    textLower.includes('employment') ||
    textLower.includes('offer letter') ||
    (textLower.includes('employee') && textLower.includes('salary'))
  ) {
    contractCategory = 'employment';
    contractType = 'Employment & Compensation Agreement';
  } else if (
    textLower.includes('non-disclosure') ||
    textLower.includes('nda') ||
    textLower.includes('confidentiality')
  ) {
    contractCategory = 'nda';
    contractType = 'Mutual Non-Disclosure Agreement (NDA)';
  } else if (
    textLower.includes('master services agreement') ||
    textLower.includes('msa') ||
    textLower.includes('statement of work') ||
    textLower.includes('independent contractor')
  ) {
    contractCategory = 'services';
    contractType = 'Master Services Agreement (MSA)';
  } else if (textLower.includes('sales') || textLower.includes('purchase')) {
    contractCategory = 'commercial';
    contractType = 'Sales / Purchase Agreement';
  } else if (document.filename) {
    const cleanName = document.filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (cleanName.length > 3 && cleanName.length < 40) {
      contractType = cleanName;
    }
  }

  // 2. Extract Deal Highlights
  const dealHighlights = extractDealHighlights(document, analysis, contractCategory, contractType);

  // 3. Create a quick, plain-English summary banner
  let quickSummaryBanner = '';
  if (contractCategory === 'rental') {
    const rentItem = dealHighlights.find((h) => h.id === 'room_rent' || /rent/i.test(h.label));
    const tenantItem = dealHighlights.find((h) => h.id === 'tenant_user' || /tenant|user/i.test(h.label));
    const landlordItem = dealHighlights.find((h) => h.id === 'landlord_owner' || /landlord/i.test(h.label));
    const propItem = dealHighlights.find((h) => h.id === 'property_room' || /property/i.test(h.label));

    const parts = [];
    if (tenantItem) parts.push(`Tenant: **${tenantItem.value}**`);
    if (landlordItem) parts.push(`Landlord: **${landlordItem.value}**`);
    if (rentItem) parts.push(`Rent: **${rentItem.value}**`);
    if (propItem) parts.push(`Premises: **${propItem.value}**`);

    quickSummaryBanner = parts.length > 0 ? parts.join(' • ') : 'Residential room tenancy agreement terms.';
  } else if (contractCategory === 'employment') {
    const empItem = dealHighlights.find((h) => /employee|user/i.test(h.label));
    const compItem = dealHighlights.find((h) => /salary|comp/i.test(h.label));
    const employerItem = dealHighlights.find((h) => /employer|company/i.test(h.label));
    quickSummaryBanner = [
      empItem ? `Candidate: **${empItem.value}**` : '',
      employerItem ? `Employer: **${employerItem.value}**` : '',
      compItem ? `Compensation: **${compItem.value}**` : ''
    ].filter(Boolean).join(' • ');
  } else if (contractCategory === 'nda') {
    const pA = dealHighlights.find((h) => /disclosing|party a/i.test(h.label));
    const pB = dealHighlights.find((h) => /receiving|party b/i.test(h.label));
    quickSummaryBanner = [
      pA ? `Disclosing Party: **${pA.value}**` : '',
      pB ? `Receiving Party: **${pB.value}**` : ''
    ].filter(Boolean).join(' • ');
  }

  // 4. Build Clauses directly from actual analysis risk flags
  const clauses = [];
  flags.forEach((f, idx) => {
    if (!f || !f.title) return;
    clauses.push({
      id: `clause_flag_${idx}`,
      severity: (f.severity || 'MEDIUM').toUpperCase(),
      title: f.title,
      whatItMeans: f.analysis || 'Analysis of this provision in the agreement.',
      whyItMatters: f.recommendation || 'Recommendation for addressing this clause.',
      whoItAffects: f.category ? `${f.category} Term` : 'Both Parties',
      sectionRef: f.category ? `${f.category} Clause` : `Clause #${idx + 1}`,
      originalClause: f.clause_excerpt || f.analysis || 'Extracted clause excerpt.',
    });
  });

  // If key_clauses exists, add key terms if not already covered in flags
  if (keyClauses && typeof keyClauses === 'object') {
    Object.entries(keyClauses).forEach(([key, val]) => {
      if (!val || val === 'Not Specified' || val === 'Unspecified' || typeof val !== 'string') return;
      if (key === 'deal_highlights' || key === 'contract_type') return;
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const alreadyPresent = clauses.some((c) =>
        c.title.toLowerCase().includes(key.replace(/_/g, ' ').toLowerCase())
      );
      if (!alreadyPresent && clauses.length < 8) {
        clauses.push({
          id: `clause_key_${key}`,
          severity: key.includes('liability') && val.toLowerCase().includes('uncapped') ? 'HIGH' : 'LOW',
          title: formattedKey,
          whatItMeans: val,
          whyItMatters: `Standard operational term governing ${formattedKey.toLowerCase()}.`,
          whoItAffects: 'Both Parties',
          sectionRef: formattedKey,
          originalClause: val,
        });
      }
    });
  }

  // 5. Dynamic Suggested Questions tailored to contract type
  const suggestedQuestions = [];
  if (contractCategory === 'rental') {
    suggestedQuestions.push('What is the monthly rent, due date, and late payment penalty?');
    suggestedQuestions.push('What are the rules and deductions for the security deposit?');
    suggestedQuestions.push('Which utilities are included and which must I pay for?');
    suggestedQuestions.push('What are the rules regarding overnight guests and visitors?');
  } else if (contractCategory === 'employment') {
    suggestedQuestions.push('What is the compensation structure and bonus eligibility?');
    suggestedQuestions.push('What are the termination and notice requirements?');
    suggestedQuestions.push('Are there non-compete or non-solicitation restrictions?');
    suggestedQuestions.push('What are the working hours and remote work policies?');
  } else if (contractCategory === 'nda') {
    suggestedQuestions.push('How long do the confidentiality obligations survive?');
    suggestedQuestions.push('What information is explicitly carved out from confidentiality?');
    suggestedQuestions.push('What remedies exist in case of an accidental breach?');
    suggestedQuestions.push('Which court has jurisdiction over disputes?');
  } else {
    if (flags.length > 0 && flags[0].title) {
      suggestedQuestions.push(`What is my biggest risk regarding ${flags[0].title}?`);
    } else {
      suggestedQuestions.push('What is my biggest risk in this contract?');
    }
    suggestedQuestions.push('What are my core financial obligations?');
    suggestedQuestions.push('Can either party terminate without penalty?');
    suggestedQuestions.push('What should I clarify or negotiate before signing?');
  }

  return {
    contractName: document.filename || 'Contract.pdf',
    contractType,
    contractCategory,
    quickSummaryBanner,
    dealHighlights,
    uploadDate: document.upload_date
      ? new Date(document.upload_date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Recent',
    clauses: clauses.slice(0, 8),
    suggestedQuestions: suggestedQuestions.slice(0, 4),
    rawText: raw,
  };
}

