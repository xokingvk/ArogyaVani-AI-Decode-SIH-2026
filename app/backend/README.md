# ArogyaVani AI — Backend Service

## Google Cloud Setup (Places API New)

To enable real-time nearby Primary Health Centre (PHC) and government healthcare facility search:

1. **Create or Select a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Select or create a project.

2. **Enable Places API (New):**
   - In Google Cloud Console, navigate to **APIs & Services** > **Library**.
   - Search for **Places API (New)** and click **Enable**.

3. **Create an API Key:**
   - Navigate to **APIs & Services** > **Credentials**.
   - Click **Create Credentials** > **API Key**.

4. **Restrict the API Key:**
   - Edit the created API key.
   - Under **API restrictions**, choose **Restrict key** and select only **Places API (New)**.
   - Under **Application restrictions**, set appropriate server-side restrictions (e.g. IP addresses of your deployed backend) where practical.

5. **Configure Render Environment Variable:**
   - In your Render dashboard, navigate to your backend service settings.
   - Add the environment variable:
     - **Key:** `GOOGLE_MAPS_API_KEY`
     - **Value:** `YOUR_RESTRICTED_GOOGLE_MAPS_API_KEY`
   - Never commit API keys to version control or expose them to frontend code.

---

## Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Server-side API key for Google Places API (New) | *(Required on Render)* |
| `GEMINI_API_KEY` | Google Gemini API key for healthcare query pipeline | *(Required)* |
| `SARVAM_API_KEY` | Sarvam AI key for voice STT/TTS | *(Required)* |
| `PORT` | Server listening port | `8000` |
| `ENABLE_RAG` | Enable/disable FAISS vector retrieval | `false` |
| `ENABLE_DOCUMENT_ELIGIBILITY` | Enable document verification check | `false` |
