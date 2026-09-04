import io
import sys
from services.sarvam_service import clean_for_speech, clean_for_display, normalize_response_text

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

print("=" * 60)
print("TESTING AROGYAVANI RESPONSE CLEANERS (DISPLAY & SPEECH)")
print("=" * 60)

test_inputs = [
    ("**Hello**", "Hello", "Hello."),
    ("***Hello***", "Hello", "Hello."),
    ("### Heading", "Heading", "Heading."),
    ("## Heading", "Heading", "Heading."),
    ("# Heading", "Heading", "Heading."),
    ("---", "", ""),
    ("___", "", ""),
    ("`code`", "code", "code."),
    ("```\ncode block\n```", "", ""),
    ("- Fever", "Fever", "Fever."),
    ("* Fever", "Fever", "Fever."),
    ("1. Fever", "1. Fever", "Fever."),
    ("[Official site](https://example.com)", "Official site", "Official site."),
    ("https://example.com", "", ""),
]

for raw, exp_disp, exp_speech in test_inputs:
    disp = clean_for_display(raw)
    speech = clean_for_speech(raw)
    print(f"INPUT: {raw!r:40s} -> DISPLAY: {disp!r:20s} | SPEECH: {speech!r}")
    assert "**" not in disp, f"** found in display: {disp}"
    assert "***" not in disp, f"*** found in display: {disp}"
    assert "###" not in disp, f"### found in display: {disp}"
    assert "##" not in disp, f"## found in display: {disp}"
    assert "#" not in disp, f"# found in display: {disp}"
    assert "---" not in disp, f"--- found in display: {disp}"
    assert "___" not in disp, f"___ found in display: {disp}"
    assert "`" not in disp, f"` found in display: {disp}"
    assert "https://" not in disp, f"URL found in display: {disp}"
    assert "**" not in speech, f"** found in speech: {speech}"
    assert "###" not in speech, f"### found in speech: {speech}"
    assert "`" not in speech, f"` found in speech: {speech}"
    assert "https://" not in speech, f"URL found in speech: {speech}"

# Complex real-world markdown test
sample_markdown = """
### Malaria Symptoms

**Common symptoms:**
- Fever
- Chills
- Headache

**Important:** Seek medical care promptly (call 108 or 104; 90% accuracy).
Visit https://mohfw.gov.in or [National Portal](https://nhm.gov.in) for details.
"""

print("\n=== COMPLEX SAMPLE INPUT ===")
print(sample_markdown)

display_out = clean_for_display(sample_markdown)
print("\n=== CLEANED FOR DISPLAY ===")
print(display_out)

speech_out = clean_for_speech(sample_markdown)
print("\n=== CLEANED FOR SPEECH (TTS) ===")
print(speech_out)

# Assertions on complex sample
for symbol in ["**", "***", "###", "##", "#", "---", "___", "`", "https://"]:
    assert symbol not in display_out, f"Symbol '{symbol}' found in display output!"
    assert symbol not in speech_out, f"Symbol '{symbol}' found in speech output!"

# Verify normal punctuation preserved (. , ? ! : ; ( ) % -)
for punct in [".", ",", ";", "(", ")", "%"]:
    assert punct in display_out, f"Punctuation '{punct}' was incorrectly stripped from display!"

assert "108" in display_out and "104" in display_out
assert "90%" in display_out

print("\n" + "=" * 60)
print("ALL RESPONSE CLEANER TESTS PASSED SUCCESSFULLY! [OK]")
print("=" * 60)

