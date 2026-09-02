import logging
from typing import Any

logger = logging.getLogger(__name__)


def evaluate_scheme_eligibility(profile: dict[str, Any]) -> list[dict[str, Any]]:
    """Evaluates all curated government schemes against the extracted UserProfile.
    Uses conservative, rule-oriented evaluation grounded in trusted document criteria.
    Never claims definitive eligibility when key criteria are missing.
    """
    age = profile.get("age")
    gender = (profile.get("gender") or "").strip().lower()
    state = profile.get("state")
    category = (profile.get("category") or "").strip().upper()
    income = profile.get("annual_income")
    pregnancy = profile.get("pregnancy_status")
    child_age = profile.get("child_age")

    is_female = gender in ["female", "woman", "f"]
    is_male = gender in ["male", "man", "m"]

    results: list[dict[str, Any]] = []

    # ── 1. Ayushman Bharat PM-JAY ──────────────────────────────────────────
    pmjay_matched = []
    pmjay_missing = []
    pmjay_status = "relevant"
    pmjay_score = 0.75
    pmjay_reason = "PM-JAY provides ₹5 Lakh/year cashless hospitalization cover across empanelled hospitals."

    if age is not None and age >= 70:
        pmjay_matched.append("Senior citizen aged 70+ qualifies for universal PMJAY Vay Vandana cover")
        pmjay_status = "potentially_eligible"
        pmjay_score = 0.95
        pmjay_reason = "As a senior citizen (70+), you may be eligible for universal ₹5 Lakh health cover under PMJAY Vay Vandana."
    elif category in ["SC", "ST", "BPL"]:
        pmjay_matched.append(f"Category {category} aligns with priority deprivation criteria under SECC 2011")
        pmjay_status = "potentially_eligible"
        pmjay_score = 0.90
        pmjay_reason = "Your profile aligns with SECC priority categories for PM-JAY coverage."
    elif income is not None and income <= 250000:
        pmjay_matched.append("Income meets low-income household threshold")
        pmjay_status = "potentially_eligible"
        pmjay_score = 0.85
    else:
        pmjay_missing.append("Ration card / SECC 2011 beneficiary list verification required")
        pmjay_missing.append("Income or RSBY card status verification needed")
        pmjay_status = "relevant"
        pmjay_score = 0.70
        pmjay_reason = "PM-JAY may apply if your family is listed in the SECC 2011 database or holds an eligible ration card."

    results.append({
        "schemeId": "pmjay",
        "schemeName": "Ayushman Bharat — PMJAY",
        "status": pmjay_status,
        "relevanceScore": pmjay_score,
        "reason": pmjay_reason,
        "matchedCriteria": pmjay_matched,
        "missingCriteria": pmjay_missing,
        "confidence": "high" if pmjay_matched else "medium",
    })

    # ── 2. Janani Suraksha Yojana (JSY) ────────────────────────────────────
    jsy_matched = []
    jsy_missing = []

    if is_male:
        jsy_status = "not_currently_eligible"
        jsy_score = 0.10
        jsy_reason = "JSY is a safe motherhood scheme designed exclusively for pregnant women."
    elif pregnancy is True:
        jsy_matched.append("Verified pregnancy / institutional delivery intent")
        if age is not None and age >= 19:
            jsy_matched.append(f"Age {age} meets minimum age requirement (19+)")
        jsy_status = "potentially_eligible"
        jsy_score = 0.95
        jsy_reason = "Provides direct DBT cash assistance (₹1,400 Rural / ₹1,000 Urban) for institutional delivery."
    elif pregnancy is False:
        jsy_status = "not_currently_eligible"
        jsy_score = 0.10
        jsy_reason = "Requires active pregnancy and institutional delivery registration."
    else:
        # Pregnancy unknown
        jsy_missing.append("Active pregnancy status not specified in document")
        jsy_missing.append("MCP card registration details needed")
        jsy_status = "needs_more_information"
        jsy_score = 0.40
        jsy_reason = "JSY provides cash assistance for institutional delivery if you are currently pregnant."

    results.append({
        "schemeId": "jsy",
        "schemeName": "Janani Suraksha Yojana (JSY)",
        "status": jsy_status,
        "relevanceScore": jsy_score,
        "reason": jsy_reason,
        "matchedCriteria": jsy_matched,
        "missingCriteria": jsy_missing,
        "confidence": "high" if pregnancy is not None else "low",
    })

    # ── 3. Pradhan Mantri Matru Vandana Yojana (PMMVY) ────────────────────
    pmmvy_matched = []
    pmmvy_missing = []

    if is_male:
        pmmvy_status = "not_currently_eligible"
        pmmvy_score = 0.10
        pmmvy_reason = "PMMVY is a maternity wage compensation scheme for pregnant women and lactating mothers."
    elif pregnancy is True:
        pmmvy_matched.append("Verified pregnant woman / lactating mother status")
        if income is not None and income <= 800000:
            pmmvy_matched.append("Family income within ₹8 Lakh/year ceiling")
        pmmvy_status = "potentially_eligible"
        pmmvy_score = 0.95
        pmmvy_reason = "Provides ₹5,000 (1st child) or ₹6,000 (2nd girl child) direct maternity cash benefit."
    elif pregnancy is False:
        pmmvy_status = "not_currently_eligible"
        pmmvy_score = 0.10
        pmmvy_reason = "Requires pregnancy or lactating mother status for first or second live birth."
    else:
        pmmvy_missing.append("Pregnancy / lactating status not provided in document")
        pmmvy_missing.append("Child birth order (1st child / 2nd girl child) required")
        pmmvy_status = "needs_more_information"
        pmmvy_score = 0.40
        pmmvy_reason = "PMMVY offers financial maternity compensation if you are an expecting or new mother."

    results.append({
        "schemeId": "pmmvy",
        "schemeName": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "status": pmmvy_status,
        "relevanceScore": pmmvy_score,
        "reason": pmmvy_reason,
        "matchedCriteria": pmmvy_matched,
        "missingCriteria": pmmvy_missing,
        "confidence": "high" if pregnancy is not None else "low",
    })

    # ── 4. Janani Shishu Suraksha Karyakram (JSSK) ─────────────────────────
    jssk_matched = []
    jssk_missing = []

    if is_male and (child_age is None or child_age > 1):
        jssk_status = "not_currently_eligible"
        jssk_score = 0.10
        jssk_reason = "JSSK covers pregnant women and sick infants up to 1 year of age."
    elif pregnancy is True:
        jssk_matched.append("Universal 100% free delivery in government hospitals")
        jssk_matched.append("Zero user charges for diagnostics, drugs, C-sections, and diet")
        jssk_status = "potentially_eligible"
        jssk_score = 0.95
        jssk_reason = "Guarantees completely cashless delivery, medicine, and food in all government health institutions."
    elif child_age is not None and child_age <= 1:
        jssk_matched.append(f"Sick infant under 1 year of age (child age {child_age}) eligible for zero-cost care")
        jssk_status = "potentially_eligible"
        jssk_score = 0.95
        jssk_reason = "Guarantees free inpatient treatment, diagnostics, and transport for sick infants up to 1 year."
    else:
        jssk_missing.append("Pregnancy status or infant age (under 1 year) needed")
        jssk_status = "needs_more_information"
        jssk_score = 0.40
        jssk_reason = "JSSK provides zero out-of-pocket expenses for delivery and sick infants at government hospitals."

    results.append({
        "schemeId": "jssk",
        "schemeName": "Janani Shishu Suraksha Karyakram (JSSK)",
        "status": jssk_status,
        "relevanceScore": jssk_score,
        "reason": jssk_reason,
        "matchedCriteria": jssk_matched,
        "missingCriteria": jssk_missing,
        "confidence": "high" if (pregnancy is not None or child_age is not None) else "low",
    })

    # ── 5. Mission Indradhanush (Universal Immunization) ────────────────────
    indra_matched = []
    indra_missing = []

    if child_age is not None and child_age <= 5:
        indra_matched.append(f"Child age ({child_age} years) is in the target immunization age window (0–5 years)")
        indra_status = "potentially_eligible"
        indra_score = 0.95
        indra_reason = "Provides 100% free immunization against 12 vaccine-preventable diseases."
    elif pregnancy is True:
        indra_matched.append("Pregnant mother eligible for Tetanus-Diphtheria (Td) immunization")
        indra_status = "potentially_eligible"
        indra_score = 0.90
        indra_reason = "Provides free maternal Td vaccination and digital tracking via the U-WIN portal."
    elif age is not None and age > 10 and pregnancy is False:
        indra_status = "not_currently_eligible"
        indra_score = 0.15
        indra_reason = "Targeted specifically at children under 5 years and pregnant mothers."
    else:
        indra_missing.append("Child age (0–5 years) or pregnancy immunization status required")
        indra_status = "needs_more_information"
        indra_score = 0.45
        indra_reason = "Free universal vaccination against 12 diseases for infants, young children, and expecting mothers."

    results.append({
        "schemeId": "indradhanush",
        "schemeName": "Mission Indradhanush (Universal Immunization)",
        "status": indra_status,
        "relevanceScore": indra_score,
        "reason": indra_reason,
        "matchedCriteria": indra_matched,
        "missingCriteria": indra_missing,
        "confidence": "medium",
    })

    # ── 6. PM Jeevan Jyoti Bima Yojana (PMJJBY) ────────────────────────────
    pmjjby_matched = []
    pmjjby_missing = []

    if age is not None:
        if 18 <= age <= 50:
            pmjjby_matched.append(f"Age {age} is within the eligible range of 18–50 years")
            pmjjby_status = "potentially_eligible"
            pmjjby_score = 0.90
            pmjjby_reason = "You meet the age requirement (18–50) for ₹2 Lakh term life insurance at ₹436/year."
        else:
            pmjjby_status = "not_currently_eligible"
            pmjjby_score = 0.10
            pmjjby_reason = f"PMJJBY enrollment is limited to individuals aged 18 to 50 years (your age: {age})."
    else:
        pmjjby_missing.append("Age verification (must be 18–50 years) required")
        pmjjby_missing.append("Savings bank account with auto-debit consent needed")
        pmjjby_status = "needs_more_information"
        pmjjby_score = 0.50
        pmjjby_reason = "Provides ₹2 Lakh affordable life insurance to bank account holders aged 18–50."

    results.append({
        "schemeId": "pmjjby",
        "schemeName": "PM Jeevan Jyoti Bima Yojana (PMJJBY)",
        "status": pmjjby_status,
        "relevanceScore": pmjjby_score,
        "reason": pmjjby_reason,
        "matchedCriteria": pmjjby_matched,
        "missingCriteria": pmjjby_missing,
        "confidence": "high" if age is not None else "medium",
    })

    # ── 7. PM Garib Kalyan Anna Yojana (PMGKAY) ────────────────────────────
    pmgkay_matched = []
    pmgkay_missing = []

    if category in ["SC", "ST", "BPL"] or (income is not None and income <= 200000):
        pmgkay_matched.append("Priority household demographic indicators identified")
        pmgkay_status = "potentially_eligible"
        pmgkay_score = 0.85
        pmgkay_reason = "Provides 5 kg free monthly food grains per person under NFSA ration cards."
    else:
        pmgkay_missing.append("NFSA Smart Ration Card / Antyodaya (AAY) / Priority Household (PHH) card needed")
        pmgkay_status = "needs_more_information"
        pmgkay_score = 0.50
        pmgkay_reason = "Free food grain distribution is accessible to all NFSA ration card holders."

    results.append({
        "schemeId": "pmgkay",
        "schemeName": "PM Garib Kalyan Anna Yojana (PMGKAY)",
        "status": pmgkay_status,
        "relevanceScore": pmgkay_score,
        "reason": pmgkay_reason,
        "matchedCriteria": pmgkay_matched,
        "missingCriteria": pmgkay_missing,
        "confidence": "medium",
    })

    # ── 8. PMAY-Gramin (Affordable Rural Housing) ─────────────────────────
    pmayg_matched = []
    pmayg_missing = []

    if state is not None and (category in ["SC", "ST", "BPL"] or (income is not None and income <= 200000)):
        pmayg_matched.append("Rural housing eligibility indicator found in profile")
        pmayg_status = "potentially_eligible"
        pmayg_score = 0.80
        pmayg_reason = "Provides ₹1.20L – ₹1.30L direct financial grant for rural pucca house construction."
    else:
        pmayg_missing.append("Gram Panchayat Awaas+ list verification needed")
        pmayg_missing.append("Houseless or kutcha wall house status required")
        pmayg_status = "needs_more_information"
        pmayg_score = 0.40
        pmayg_reason = "Assists rural families living in kutcha houses to build a durable pucca home."

    results.append({
        "schemeId": "pmayg",
        "schemeName": "PMAY-Gramin (Affordable Housing)",
        "status": pmayg_status,
        "relevanceScore": pmayg_score,
        "reason": pmayg_reason,
        "matchedCriteria": pmayg_matched,
        "missingCriteria": pmayg_missing,
        "confidence": "medium",
    })

    return results
