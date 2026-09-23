import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

os.makedirs("sample_contracts", exist_ok=True)

def generate_pdf(filename, title, sections):
    filepath = os.path.join("sample_contracts", filename)
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=45
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    elements = [
        Paragraph(title, title_style),
        Spacer(1, 10)
    ]

    for heading, text in sections:
        elements.append(Paragraph(heading, h2_style))
        elements.append(Paragraph(text, body_style))
        elements.append(Spacer(1, 4))

    doc.build(elements)
    print(f"Generated PDF: {filepath}")

# Sample Contract 1: MSA
msa_sections = [
    ("PREAMBLE & PARTIES", "This Master Services Agreement ('Agreement') is made effective as of October 1, 2026 ('Effective Date'), by and between CyberCore Systems Inc., a Delaware corporation ('Company'), and Vertex Analytics LLC, a California limited liability company ('Contractor')."),
    ("1. SCOPE OF SERVICES", "Contractor shall provide data engineering, infrastructure integration, and cybersecurity advisory services in accordance with sequentially executed Statements of Work ('SOW'). Contractor warrants that all work product will adhere to high industry benchmarks and comply with applicable laws."),
    ("2. PAYMENT TERMS & AUDIT", "Invoices shall be rendered monthly and paid within thirty (30) calendar days. Unpaid amounts after 45 days incur a late penalty of 1.5% per month. Company retains the right to audit Contractor's billing records once annually upon ten (10) days prior written notice."),
    ("3. INTELLECTUAL PROPERTY RIGHTS", "All deliverables, software modifications, inventions, and patentable developments created under this Agreement shall constitute 'work made for hire' and remain the sole exclusive property of Company. Contractor retains pre-existing tools but grants Company an irrevocable, perpetual, royalty-free license to use said tools."),
    ("4. CONFIDENTIALITY & TRADE SECRETS", "The receiving party agrees to safeguard confidential data using at least the same degree of care as it uses for its own proprietary records, but not less than reasonable care. Obligations of confidentiality shall survive termination for five (5) years, while technical trade secrets shall survive in perpetuity."),
    ("5. INDEMNIFICATION & UNLIMITED DEFENSE", "Contractor agrees to indemnify, defend, and hold harmless Company, its affiliates, directors, officers, and employees against any and all liabilities, losses, damages, claims, and expenses (including reasonable outside attorneys' fees) arising out of third-party IP infringement claims, negligence, or breach of warranties."),
    ("6. LIMITATION OF LIABILITY & CARVEOUTS", "NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES. EXCEPT FOR INDEMNIFICATION LIABILITIES UNDER SECTION 5 AND WILLFUL BREACH OF CONFIDENTIALITY UNDER SECTION 4, AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID DURING THE PRIOR 12 MONTHS."),
    ("7. NON-SOLICITATION COVENANT", "During the active term and for twelve (12) months following termination, Contractor shall not solicit or hire any employee or contractor of Company without prior written permission."),
    ("8. GOVERNING LAW & JURISDICTION", "This Agreement is governed by the laws of the State of Delaware. Any dispute arising out of or relating to this agreement shall be settled through binding JAMS arbitration in Wilmington, Delaware.")
]

# Sample Contract 2: NDA
nda_sections = [
    ("MUTUAL NON-DISCLOSURE AGREEMENT", "This Mutual Non-Disclosure Agreement ('Agreement') is entered into on September 15, 2026, by and between Zenith Ventures Corp. ('Party A') and Horizon AI Technologies Inc. ('Party B') for the purpose of exploring potential strategic commercial partnerships."),
    ("1. DEFINITION OF CONFIDENTIAL INFORMATION", "Confidential Information includes all non-public technical, financial, and operational information marked as proprietary or that reasonably should be understood to be confidential given the circumstances of disclosure."),
    ("2. EXCLUSIONS FROM CONFIDENTIALITY", "Confidential Information does not include information that: (a) becomes publicly known through no breach of receiving party; (b) was already known prior to disclosure; (c) is independently developed without reference to disclosing party's data."),
    ("3. NON-USE AND RESTRICTION ON DISCLOSURE", "Receiving party shall hold the information in strict confidence and shall not use it for any purpose outside the authorized evaluation scope without explicit written consent."),
    ("4. REMEDIES & INJUNCTIVE RELIEF", "The parties acknowledge that unauthorized disclosure may cause irreparable injury for which monetary damages are inadequate, entitling the disclosing party to seek injunctive relief without bond."),
    ("5. DURATION & RETURN OF MATERIALS", "This Agreement shall remain in effect for three (3) years from execution. Upon written request, all copies of confidential files must be promptly returned or certified destroyed."),
    ("6. GOVERNING JURISDICTION", "This Agreement shall be governed and interpreted according to the laws of the State of New York, with exclusive forum in the state or federal courts of Manhattan, New York.")
]

if __name__ == "__main__":
    generate_pdf("Sample_Master_Services_Agreement.pdf", "MASTER SERVICES AGREEMENT", msa_sections)
    generate_pdf("Sample_Mutual_NDA.pdf", "MUTUAL NON-DISCLOSURE AGREEMENT", nda_sections)
    print("PDF generation complete!")
