import io
import sys
import os
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

load_dotenv()

from services.sarvam_service import detect_intent

test_cases = [
    # Pure conversational queries
    (1, "Good morning", "conversational"),
    (2, "Good afternoon", "conversational"),
    (3, "Hello", "conversational"),
    (4, "How are you?", "conversational"),
    (5, "What is your name?", "conversational"),
    (6, "What can you do?", "conversational"),
    (7, "Thank you", "conversational"),
    (8, "Bye", "conversational"),

    # Conversational greeting + Health condition -> Healthcare
    (9, "Good morning, I have fever", "healthcare"),
    (10, "Hello, I have malaria", "healthcare"),

    # Health conditions and questions -> Healthcare
    (11, "I have malaria", "healthcare"),
    (12, "I have dengue", "healthcare"),
    (13, "I have typhoid", "healthcare"),
    (14, "I have asthma", "healthcare"),
    (15, "I have fever", "healthcare"),
    (16, "What is malaria?", "healthcare"),
    (17, "What are symptoms of malaria?", "healthcare"),
    (18, "My child has fever", "healthcare"),
    (19, "What causes dengue?", "healthcare"),
    (20, "What should I do for a fever?", "healthcare"),
    (21, "How can I stay safe during dengue?", "healthcare"),
    (22, "What are common asthma symptoms?", "healthcare"),
    (23, "I feel weak and tired", "healthcare"),

    # Safety checks -> medical_advice
    (24, "What medicine should I take for malaria?", "medical_advice"),
    (25, "What tablet should I take for dengue?", "medical_advice"),
    (26, "How much paracetamol should I take?", "medical_advice"),
    (27, "Diagnose my symptoms", "medical_advice"),
    (28, "Do I have malaria?", "medical_advice"),
    (29, "Tell me exactly what treatment I need", "medical_advice"),
    (30, "Which antibiotic should I take?", "medical_advice"),

    # Scheme queries -> scheme
    (31, "Hi, which scheme helps pregnant women?", "scheme"),
    (32, "Which scheme helps pregnant women?", "scheme"),
    (33, "Ayushman Bharat eligibility", "scheme"),

    # Location queries -> location
    (34, "Find a nearby PHC", "location"),
    (35, "Where is the nearest hospital?", "location"),
]

print("=" * 60)
print(f"TESTING {len(test_cases)} MASTER PROMPT INTENT CASES")
print("=" * 60)

all_passed = True
for idx, query, expected_intent in test_cases:
    intent = detect_intent(query)
    status = "PASS [OK]" if intent == expected_intent else f"FAIL (Got: '{intent}')"
    if intent != expected_intent:
        all_passed = False
    print(f"Test {idx:2d}: \"{query}\" -> Detected: '{intent}' (Expected: '{expected_intent}') | {status}")

assert all_passed, "Some intent test cases failed!"
print("=" * 60)
print(f"ALL {len(test_cases)} INTENT TEST CASES PASSED SUCCESSFULLY!")
print("=" * 60)


