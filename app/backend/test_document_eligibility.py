import io
import sys
from services.eligibility_service import evaluate_scheme_eligibility
from main import build_eligibility_response

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

print("=" * 60)
print("TESTING PRIMARY CORE HEALTHCARE SCHEMES ELIGIBILITY")
print("=" * 60)

# ── Test 1: Pregnant woman aged 17
profile_1 = {
    "name": "Pooja",
    "age": 17,
    "gender": "Female",
    "state": "Bihar",
    "pregnancy_status": True,
}
res_1 = evaluate_scheme_eligibility(profile_1)
print("\n--- Example 1: Pregnant age 17 ---")
for s in res_1:
    print(f"[{s['status'].upper()}] {s['schemeName']} -> {s['reason']}")

jsy_1 = next(s for s in res_1 if s["schemeId"] == "jsy")
jssk_1 = next(s for s in res_1 if s["schemeId"] == "jssk")
pmmvy_1 = next(s for s in res_1 if s["schemeId"] == "pmmvy")
pmsma_1 = next(s for s in res_1 if s["schemeId"] == "pmsma")

assert jsy_1["status"] == "not_currently_eligible", f"JSY should be not_currently_eligible for age 17, got {jsy_1['status']}"
assert jssk_1["status"] == "potentially_eligible", f"JSSK should be potentially_eligible, got {jssk_1['status']}"
assert pmmvy_1["status"] == "potentially_eligible", f"PMMVY should be potentially_eligible, got {pmmvy_1['status']}"
assert pmsma_1["status"] == "potentially_eligible", f"PMSMA should be potentially_eligible, got {pmsma_1['status']}"
print("Result: PASS [OK]")

# ── Test 2: Age 45, pregnancy unknown
profile_2 = {
    "name": "Lakshmi Devi",
    "age": 45,
    "gender": "Female",
    "state": "Tamil Nadu",
    "pregnancy_status": None,
}
res_2 = evaluate_scheme_eligibility(profile_2)
print("\n--- Example 2: Age 45, pregnancy unknown ---")
for s in res_2:
    print(f"[{s['status'].upper()}] {s['schemeName']}")

jsy_2 = next(s for s in res_2 if s["schemeId"] == "jsy")
pmmvy_2 = next(s for s in res_2 if s["schemeId"] == "pmmvy")
jssk_2 = next(s for s in res_2 if s["schemeId"] == "jssk")
pmjay_2 = next(s for s in res_2 if s["schemeId"] == "pmjay")
pmsma_2 = next(s for s in res_2 if s["schemeId"] == "pmsma")

assert jsy_2["status"] == "needs_more_information", f"JSY should be needs_more_information, got {jsy_2['status']}"
assert pmmvy_2["status"] == "needs_more_information", f"PMMVY should be needs_more_information, got {pmmvy_2['status']}"
assert jssk_2["status"] == "needs_more_information", f"JSSK should be needs_more_information, got {jssk_2['status']}"
assert pmjay_2["status"] == "needs_more_information", f"PM-JAY should be needs_more_information, got {pmjay_2['status']}"
assert pmsma_2["status"] == "needs_more_information", f"PMSMA should be needs_more_information, got {pmsma_2['status']}"
print("Result: PASS [OK]")

# ── Test 3: Senior Citizen aged 72
profile_3 = {
    "name": "Ramanathan",
    "age": 72,
    "gender": "Male",
    "state": "Tamil Nadu",
    "pregnancy_status": None,
}
res_3 = evaluate_scheme_eligibility(profile_3)
print("\n--- Example 3: Age 72 ---")
for s in res_3:
    print(f"[{s['status'].upper()}] {s['schemeName']}")

pmjay_3 = next(s for s in res_3 if s["schemeId"] == "pmjay")
jsy_3 = next(s for s in res_3 if s["schemeId"] == "jsy")
pmsma_3 = next(s for s in res_3 if s["schemeId"] == "pmsma")

assert pmjay_3["status"] == "potentially_eligible", f"PM-JAY should be potentially_eligible for age 72, got {pmjay_3['status']}"
assert jsy_3["status"] == "not_currently_eligible", f"JSY should be not_currently_eligible for male, got {jsy_3['status']}"
assert pmsma_3["status"] == "not_currently_eligible", f"PMSMA should be not_currently_eligible for male, got {pmsma_3['status']}"
print("Result: PASS [OK]")

# ── Test 4: Child aged 6 (RBSK)
profile_4 = {
    "name": "Aarav",
    "age": 6,
    "gender": "Male",
    "state": "Karnataka",
}
res_4 = evaluate_scheme_eligibility(profile_4)
print("\n--- Example 4: Child age 6 (RBSK) ---")
for s in res_4:
    print(f"[{s['status'].upper()}] {s['schemeName']}")

rbsk_4 = next(s for s in res_4 if s["schemeId"] == "rbsk")
assert rbsk_4["status"] == "potentially_eligible", f"RBSK should be potentially_eligible for child age 6, got {rbsk_4['status']}"
print("Result: PASS [OK]")

print("\n" + "=" * 60)
print("ALL PRIMARY CORE HEALTHCARE SCHEME TESTS PASSED [OK]")
print("=" * 60)
