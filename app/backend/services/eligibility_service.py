import logging
from typing import Any

logger = logging.getLogger(__name__)


def evaluate_scheme_eligibility(profile: dict[str, Any]) -> list[dict[str, Any]]:
    """Evaluates the primary core healthcare schemes against the extracted UserProfile.
    Grounded in the 8-PDF trusted corpus and curated health scheme metadata.

    Primary Healthcare Schemes Evaluated:
    - PM-JAY (Ayushman Bharat Hospital Assurance)
    - JSY (Janani Suraksha Yojana Maternity Assistance)
    - PMMVY (Pradhan Mantri Matru Vandana Yojana DBT)
    - JSSK (Janani Shishu Suraksha Karyakram Zero-Expense Care)
    - PMSMA (Pradhan Mantri Surakshit Matritva Abhiyan Free ANC)
    - RBSK (Rashtriya Bal Swasthya Karyakram Child Health Screening)

    Classification rules:
    - 'potentially_eligible': All documented required criteria are either satisfied or
      supported by profile evidence, with official database verification pending.
    - 'needs_more_information': One or more essential criteria cannot be determined from profile.
    - 'not_currently_eligible': Known profile data explicitly contradicts a mandatory criterion.
    - 'unable_to_determine': The available evidence cannot support a reliable classification.
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

    if age is not None and age >= 70:
        pmjay_matched.append("Senior citizen aged 70+ qualifies for universal PMJAY Vay Vandana cover")
        pmjay_status = "potentially_eligible"
        pmjay_score = 0.95
        pmjay_reason = "As a senior citizen (70+), you qualify for universal ₹5 Lakh health cover under PMJAY Vay Vandana regardless of income."
    elif category in ["SC", "ST", "BPL"]:
        pmjay_matched.append(f"Category {category} aligns with priority deprivation criteria under SECC 2011")
        pmjay_missing.append("Official SECC 2011 beneficiary list / Ayushman card verification required")
        pmjay_status = "potentially_eligible"
        pmjay_score = 0.85
        pmjay_reason = "Your profile aligns with SECC priority criteria. Official beneficiary database verification is required."
    else:
        pmjay_missing.append("SECC 2011 database enrollment / BPL / RSBY card verification required")
        pmjay_missing.append("State health card linkage check needed")
        pmjay_status = "needs_more_information"
        pmjay_score = 0.50
        pmjay_reason = "PM-JAY covers families identified in the SECC 2011 database or holding an eligible ration card."

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
        jsy_reason = "JSY is a safe motherhood intervention designed exclusively for pregnant women."
    elif pregnancy is False:
        jsy_status = "not_currently_eligible"
        jsy_score = 0.10
        jsy_reason = "Requires active pregnancy and institutional delivery registration."
    elif pregnancy is True:
        if age is not None and age < 19:
            jsy_status = "not_currently_eligible"
            jsy_score = 0.15
            jsy_reason = f"JSY guidelines specify a minimum age of 19 years for cash assistance (profile age: {age})."
        elif age is not None and age >= 19:
            jsy_matched.append("Verified pregnancy status for institutional delivery")
            jsy_matched.append(f"Age {age} meets minimum age criteria (19+)")
            jsy_missing.append("Mother and Child Protection (MCP) card registration needed")
            jsy_status = "potentially_eligible"
            jsy_score = 0.95
            jsy_reason = "Provides direct DBT cash assistance (₹1,400 Rural / ₹1,000 Urban) for institutional delivery at public health facilities."
        else:
            jsy_matched.append("Verified pregnancy status for institutional delivery")
            jsy_missing.append("Age verification required (must be 19+ years)")
            jsy_missing.append("Mother and Child Protection (MCP) card registration needed")
            jsy_status = "needs_more_information"
            jsy_score = 0.60
            jsy_reason = "Pregnancy identified, but age must be verified (19+ years required for cash assistance)."
    else:
        jsy_missing.append("Active pregnancy status not specified in document")
        jsy_missing.append("Mother and Child Protection (MCP) card registration needed")
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
    elif pregnancy is False:
        pmmvy_status = "not_currently_eligible"
        pmmvy_score = 0.10
        pmmvy_reason = "Requires active pregnancy or lactating mother status for first live birth or second girl child."
    elif pregnancy is True:
        if income is not None and income > 800000:
            pmmvy_status = "not_currently_eligible"
            pmmvy_score = 0.15
            pmmvy_reason = f"PMMVY income ceiling is ₹8 Lakh per year (profile annual income: ₹{income:,})."
        else:
            pmmvy_matched.append("Verified pregnant woman / lactating mother status")
            if income is not None and income <= 800000:
                pmmvy_matched.append("Family income within ₹8 Lakh/year ceiling")
            pmmvy_missing.append("Live birth order verification (1st child or 2nd girl child)")
            pmmvy_missing.append("Government / PSU regular employment exclusion check")
            pmmvy_status = "potentially_eligible"
            pmmvy_score = 0.95
            pmmvy_reason = "Provides ₹5,000 (1st child) or ₹6,000 (2nd girl child) direct DBT maternity benefit."
    else:
        pmmvy_missing.append("Pregnancy / lactating status not provided in document")
        pmmvy_missing.append("Live birth order verification needed")
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
        jssk_matched.append("Zero user charges for diagnostics, drugs, C-sections, and food")
        jssk_status = "potentially_eligible"
        jssk_score = 0.95
        jssk_reason = "Guarantees completely cashless delivery, medicines, and diagnostics in all public health institutions without age or income restrictions."
    elif child_age is not None:
        if child_age <= 1:
            jssk_matched.append(f"Sick infant under 1 year of age (child age: {child_age}) eligible for zero-cost care")
            jssk_status = "potentially_eligible"
            jssk_score = 0.95
            jssk_reason = "Guarantees free treatment, diagnostics, and transport for sick infants up to 1 year of age."
        else:
            jssk_status = "not_currently_eligible"
            jssk_score = 0.10
            jssk_reason = f"JSSK neonatal coverage is limited to infants up to 1 year of age (child age: {child_age})."
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

    # ── 5. Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) ────────────────
    pmsma_matched = []
    pmsma_missing = []

    if is_male:
        pmsma_status = "not_currently_eligible"
        pmsma_score = 0.10
        pmsma_reason = "PMSMA is an antenatal care program exclusively for pregnant women."
    elif pregnancy is False:
        pmsma_status = "not_currently_eligible"
        pmsma_score = 0.10
        pmsma_reason = "Requires active pregnancy for specialized antenatal checkup entitlements."
    elif pregnancy is True:
        pmsma_matched.append("Verified pregnant woman status for specialized ANC checkups")
        pmsma_matched.append("Free specialist consultations and diagnostic tests on 9th of every month")
        pmsma_status = "potentially_eligible"
        pmsma_score = 0.95
        pmsma_reason = "Provides free assured comprehensive antenatal clinic checkup and specialist consultation on the 9th of every month at public facilities."
    else:
        pmsma_missing.append("Pregnancy status not specified in document")
        pmsma_status = "needs_more_information"
        pmsma_score = 0.40
        pmsma_reason = "Offers free comprehensive ANC checkup on the 9th of every month if you are currently expecting."

    results.append({
        "schemeId": "pmsma",
        "schemeName": "PM Surakshit Matritva Abhiyan (PMSMA)",
        "status": pmsma_status,
        "relevanceScore": pmsma_score,
        "reason": pmsma_reason,
        "matchedCriteria": pmsma_matched,
        "missingCriteria": pmsma_missing,
        "confidence": "high" if pregnancy is not None else "low",
    })

    # ── 6. Rashtriya Bal Swasthya Karyakram (RBSK) ─────────────────────────
    rbsk_matched = []
    rbsk_missing = []

    if child_age is not None:
        if child_age <= 18:
            rbsk_matched.append(f"Child age ({child_age} years) is within the eligible screening age window (0–18 years)")
            rbsk_status = "potentially_eligible"
            rbsk_score = 0.95
            rbsk_reason = "Provides free child health screening and early intervention treatment for 30 selected health conditions (4Ds) up to 18 years."
        else:
            rbsk_status = "not_currently_eligible"
            rbsk_score = 0.10
            rbsk_reason = f"RBSK child health coverage is limited to children and adolescents up to 18 years (child age: {child_age})."
    elif age is not None:
        if age <= 18:
            rbsk_matched.append(f"Age {age} is within the child and adolescent screening group (0–18 years)")
            rbsk_status = "potentially_eligible"
            rbsk_score = 0.90
            rbsk_reason = "Provides free health screening for defects, deficiencies, diseases, and developmental delays up to 18 years."
        elif age > 18 and pregnancy is False:
            rbsk_status = "not_currently_eligible"
            rbsk_score = 0.10
            rbsk_reason = "RBSK is an early childhood and adolescent health program (0–18 years)."
        else:
            rbsk_missing.append("Child in household (0–18 years) age verification required")
            rbsk_status = "needs_more_information"
            rbsk_score = 0.40
            rbsk_reason = "Provides free early health screening for children and adolescents aged 0 to 18 years."
    else:
        rbsk_missing.append("Child or adolescent age verification (0–18 years) required")
        rbsk_status = "needs_more_information"
        rbsk_score = 0.40
        rbsk_reason = "Provides free early health screening for children and adolescents aged 0 to 18 years."

    results.append({
        "schemeId": "rbsk",
        "schemeName": "Rashtriya Bal Swasthya Karyakram (RBSK)",
        "status": rbsk_status,
        "relevanceScore": rbsk_score,
        "reason": rbsk_reason,
        "matchedCriteria": rbsk_matched,
        "missingCriteria": rbsk_missing,
        "confidence": "high" if (child_age is not None or (age is not None and age <= 18)) else "medium",
    })

    return results
