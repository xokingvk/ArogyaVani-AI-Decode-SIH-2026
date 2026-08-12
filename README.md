# Gramacare-AI-Decode-SIH-2026

> A multilingual, voice-first AI health assistant helping rural India access government health schemes and basic care guidance — in their own language.

**Problem Statement:** PS1 — AI Rural Health Assistant (Bharat Shakti — AI for Society, Healthcare & Agriculture)

**Status:** ?? Building for [Hackathon Name] 2026

---

## ?? The Problem

Millions of eligible rural Indians don't get the healthcare and government health benefits they're entitled to — not because the schemes don't exist, but because they can't access, understand, or navigate them in their own language. On top of that, people often don't know whether a symptom needs urgent care or can wait — leading to delayed treatment or unnecessary hospital trips.

## ?? Our Solution

GramaCare AI is a voice-first assistant that lets a rural citizen speak in Tamil, Hindi, Telugu, Kannada, or Malayalam and get:

- ? **Scheme eligibility checks** (e.g. Ayushman Bharat) — clear ?/? results with required documents and application steps
- ? **Care-level guidance** — a strict, rule-based triage engine (home care / PHC visit / emergency) with zero AI-generated medical guessing
- ? **Nearest facility finder** — PHC, hospital, or telemedicine centre with live status and directions
- ? **Low-bandwidth friendly** — SMS/USSD fallback and offline caching for unstable rural connectivity

Built as a **force-multiplier for ASHA/ANM workers** — helping them register and guide families faster, not replacing them.

## ??? Architecture

```
[User Voice/Text/Image Input]
            ¦
            ?
   [Bhashini API — Speech-to-Text ? Translation ? Text-to-Speech]
            ¦
            ?
   [LangChain Orchestration Layer]
            ¦
   +--------+----------------+
   ?        ?                ?
[Scheme   [Triage Engine   [Location
 RAG ?     — Rule-based     Request —
 BioMistral 7B] Decision Tree]  Google Maps + PHC Dataset]
   ¦        ¦                ¦
   +-------------------------+
            ¦
            ?
   [ABDM Integration — scheme/health service verification]
            ¦
            ?
   [SMS/Notification — alerts to family, caregivers, frontline workers]
            ¦
            ?
      [Response to User — via Bhashini TTS]
```

**Scheme RAG pipeline:** Government scheme PDFs + WHO Guidelines + ICMR Guidelines ? chunked ? embedded ? stored in FAISS ? retrieved on query ? grounded response via **BioMistral 7B** (medical-domain LLM, source-cited, no hallucination)

**Triage engine:** Standard medical triage protocol ? converted into a strict Python decision tree ? deterministic output, no generative guessing

## ??? Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js, React, HTML, CSS, JavaScript, Tailwind CSS |
| Backend & AI Services | Python (AI/RAG services), Node.js (application & API layer), LangChain (agent/RAG orchestration) |
| Voice & Language | Bhashini API — Speech-to-Text, Translation, Text-to-Speech |
| AI / LLM | **BioMistral 7B** — medical-domain LLM for grounded medical reasoning & response generation |
| RAG & Knowledge | LangChain, FAISS, Hugging Face — retrieval ? context ? grounded generation |
| Knowledge Sources | WHO Guidelines, ICMR Guidelines, Government Scheme Documents |
| Location & PHC Data | Google Maps API (location & routing), PHC Dataset (rural health facilities) |
| Healthcare Integration | ABDM Integration (health services & scheme verification), SMS/Notification (alerts to family, caregivers & frontline workers) |
| Deployment | Vercel |

**Design principles:** Secure & scalable (cloud-ready) · Grounded & reliable (RAG with trusted sources) · Voice-first & multilingual · Healthcare-focused (safe, responsible, impact-driven) · Low-end device ready (optimized for rural smartphones)


## ?? Safety & Guardrails

- **No diagnosis, no prescriptions** — the system never names a disease or medicine
- **Triage is 100% rule-based** — not AI-generated, based on standard medical triage protocols
- **Medical reasoning grounded in trusted sources** — BioMistral 7B responses are generated only from retrieved WHO/ICMR guidelines and official scheme documents, never freeform
- **All scheme answers are cited** — grounded in official documents, never freeform LLM claims
- **Low-confidence fallback** — if no reliable match is found, the system redirects to an official source instead of guessing
- **ABDM-verified scheme/health service data** — reduces risk of outdated or incorrect scheme information

## ?? Team
  **Kamaleshwaran B
  **Vishnuvardhan B
  **Kevin Cris F
  **John Ezra P
  **Sri Harini
  **Poojasri AB


## ?? License

*apache 2.0*