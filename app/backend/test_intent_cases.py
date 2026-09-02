import io
import sys
import os
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

load_dotenv()

from services.sarvam_service import detect_intent, process_arogyavani_pipeline

cases = [
    ("A", "I have fever", "general", False),
    ("B", "Which scheme helps pregnant women?", "scheme_rag", True),
    ("C", "What benefits does Janani Suraksha Yojana provide?", "scheme_rag", True),
    ("D", "I have headache", "general", False),
]

print("=" * 60)
print("TESTING SCHEME VS GENERAL INTENT ROUTING CASES")
print("=" * 60)

for code, query, expected_mode, expect_schemes in cases:
    print(f"\n--- Case {code}: \"{query}\" ---")
    intent = detect_intent(query)
    print(f"Detected internal intent: {intent}")
    
    # Run through pipeline
    english_text, response_text, audio_base64, mode, schemes, sources = process_arogyavani_pipeline(
        user_text=query,
        detected_language="en-IN"
    )
    
    print(f"Result mode: \"{mode}\" (Expected: \"{expected_mode}\")")
    print(f"Schemes count: {len(schemes)}")
    if schemes:
        print(f"Matched schemes: {[s['schemeId'] for s in schemes]}")
    print(f"Sources count: {len(sources)}")
    print(f"Response snippet: \"{response_text[:120].strip()}...\"")
    
    # Assertions
    assert mode == expected_mode, f"Case {code} FAILED: mode '{mode}' != expected '{expected_mode}'"
    if expect_schemes:
        assert len(schemes) > 0, f"Case {code} FAILED: expected schemes > 0"
        assert len(sources) > 0, f"Case {code} FAILED: expected sources > 0"
    else:
        assert len(schemes) == 0, f"Case {code} FAILED: expected schemes == 0"
        assert len(sources) == 0, f"Case {code} FAILED: expected sources == 0"
    
    print(f"Result: PASS [OK]")

print("\n" + "=" * 60)
print("ALL 4 INTENT CASES A, B, C, D PASSED [OK]")
print("=" * 60)
