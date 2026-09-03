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
    (1, "Good morning", "conversational"),
    (2, "Good afternoon", "conversational"),
    (3, "Hello", "conversational"),
    (4, "How are you?", "conversational"),
    (5, "What is your name?", "conversational"),
    (6, "What can you do?", "conversational"),
    (7, "Thank you", "conversational"),
    (8, "Bye", "conversational"),
    (9, "Good morning, I have fever", "healthcare"),
    (10, "Hi, which scheme helps pregnant women?", "scheme"),
]

print("=" * 60)
print("TESTING 10 MASTER PROMPT INTENT CASES")
print("=" * 60)

all_passed = True
for idx, query, expected_intent in test_cases:
    intent = detect_intent(query)
    status = "PASS [OK]" if intent == expected_intent else f"FAIL (Got: {intent})"
    if intent != expected_intent:
        all_passed = False
    print(f"Test {idx:2d}: \"{query}\" -> Detected: '{intent}' (Expected: '{expected_intent}') | {status}")

assert all_passed, "Some intent test cases failed!"
print("=" * 60)
print("ALL 10 INTENT TEST CASES PASSED SUCCESSFULLY!")
print("=" * 60)

