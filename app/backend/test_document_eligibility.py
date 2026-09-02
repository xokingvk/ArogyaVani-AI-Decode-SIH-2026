import io
import sys
from services.eligibility_service import evaluate_scheme_eligibility

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

print("=" * 60)
print("TESTING DOCUMENT-BASED ELIGIBILITY ENGINE")
print("=" * 60)

# ── Test A: 45-year-old female in Tamil Nadu (no pregnancy)
profile_a = {
    "name": "Lakshmi Devi",
    "age": 45,
    "gender": "Female",
    "state": "Tamil Nadu",
    "district": "Madurai",
    "category": None,
    "annual_income": None,
    "pregnancy_status": None,
    "child_age": None,
}

res_a = evaluate_scheme_eligibility(profile_a)
print("\n--- Test A: Lakshmi Devi (Age 45, Tamil Nadu) ---")
for s in res_a:
    print(f"[{s['status'].upper()}] {s['schemeName']} - Score: {s['relevanceScore']}")
    if s["matchedCriteria"]:
        print(f"  Matched: {s['matchedCriteria']}")
    if s["missingCriteria"]:
        print(f"  Missing: {s['missingCriteria']}")

# Verify PMJJBY is potentially eligible (age 18-50)
pmjjby = next(s for s in res_a if s["schemeId"] == "pmjjby")
assert pmjjby["status"] == "potentially_eligible", f"Expected PMJJBY potentially_eligible, got {pmjjby['status']}"

# Verify JSY is needs_more_information (not falsely claimed as eligible)
jsy = next(s for s in res_a if s["schemeId"] == "jsy")
assert jsy["status"] == "needs_more_information", f"Expected JSY needs_more_information, got {jsy['status']}"
print("Result: PASS [OK]")

# ── Test B: Insufficient information (Name + State only)
profile_b = {
    "name": "Ravi",
    "state": "Karnataka",
    "age": None,
    "gender": "Male",
    "category": None,
    "annual_income": None,
    "pregnancy_status": None,
    "child_age": None,
}

res_b = evaluate_scheme_eligibility(profile_b)
print("\n--- Test B: Insufficient info (Male, Ravi, Karnataka) ---")
for s in res_b:
    print(f"[{s['status'].upper()}] {s['schemeName']}")

jsy_b = next(s for s in res_b if s["schemeId"] == "jsy")
assert jsy_b["status"] == "not_currently_eligible", f"Expected JSY not_currently_eligible for Male, got {jsy_b['status']}"
print("Result: PASS [OK]")

# ── Test C: Verified pregnancy status
profile_c = {
    "name": "Sunita",
    "age": 24,
    "gender": "Female",
    "state": "Uttar Pradesh",
    "category": "BPL",
    "annual_income": 120000,
    "pregnancy_status": True,
    "child_age": None,
}

res_c = evaluate_scheme_eligibility(profile_c)
print("\n--- Test C: Verified Pregnancy (Sunita, Age 24, BPL, UP) ---")
for s in res_c:
    print(f"[{s['status'].upper()}] {s['schemeName']}")

jsy_c = next(s for s in res_c if s["schemeId"] == "jsy")
pmmvy_c = next(s for s in res_c if s["schemeId"] == "pmmvy")
jssk_c = next(s for s in res_c if s["schemeId"] == "jssk")

assert jsy_c["status"] == "potentially_eligible", f"Expected JSY potentially_eligible, got {jsy_c['status']}"
assert pmmvy_c["status"] == "potentially_eligible", f"Expected PMMVY potentially_eligible, got {pmmvy_c['status']}"
assert jssk_c["status"] == "potentially_eligible", f"Expected JSSK potentially_eligible, got {jssk_c['status']}"
print("Result: PASS [OK]")

print("\n" + "=" * 60)
print("ALL ELIGIBILITY ENGINE TESTS PASSED [OK]")
print("=" * 60)
