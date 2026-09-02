import io
import sys
from services.sarvam_service import clean_for_speech, clean_for_display

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

sample_markdown = """
### 1. AB-PMJAY Benefits
**Ayushman Bharat** provides up to ₹5,00,000 health cover.
- Free cashless hospital treatment
- Covers 1,900+ procedures
Visit https://pmjay.gov.in or [Official Portal](https://beneficiary.nha.gov.in) to apply.
"""

print("=== ORIGINAL TEXT ===")
print(sample_markdown)

print("=== CLEANED FOR DISPLAY ===")
display_out = clean_for_display(sample_markdown)
print(display_out)

print("\n=== CLEANED FOR SPEECH (TTS) ===")
speech_out = clean_for_speech(sample_markdown)
print(speech_out)

# Assertions
assert "https://" not in speech_out, "Raw URL present in speech text!"
assert "**" not in speech_out, "Markdown asterisks present in speech text!"
assert "###" not in speech_out, "Markdown heading hashes present in speech text!"
assert "https://" not in display_out, "Raw URL present in display text!"

print("\n[OK] All text cleaning tests passed!")
