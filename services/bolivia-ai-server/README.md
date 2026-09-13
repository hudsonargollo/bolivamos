# BolivIA Ollama VPS endpoint

Small Node.js HTTP service that runs on the VPS and uses local Ollama for the BoliVibes BolivIA concierge.

Production endpoint:

- `GET /v1/bolivia/health`
- `POST /v1/bolivia/concierge`

The POST endpoint requires either:

- `Authorization: Bearer <BOLIVIA_AI_API_KEY>`
- `x-bolivia-ai-key: <BOLIVIA_AI_API_KEY>`

Request body:

```json
{
  "message": "Plan my night in Santa Cruz",
  "history": [{ "role": "user", "content": "I like live music" }],
  "conversationId": "optional-existing-id"
}
```

Response body:

```json
{
  "reply": "...",
  "assistant": "BolivIA",
  "provider": "ollama",
  "model": "llama3.2:3b",
  "conversationId": "optional-existing-id"
}
```

Runtime configuration lives outside git in `/etc/bolivibes-ai.env`.

The Cloudflare Worker app calls this service through `BOLIVIA_AI_ENDPOINT` and `BOLIVIA_AI_API_KEY`.
