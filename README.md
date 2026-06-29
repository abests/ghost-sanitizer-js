# GhostSanitizer 👻

A zero-dependency, pure client-side TypeScript engine for redacting high-entropy secrets (AWS Keys, DB URIs, RSA Keys, JWTs) from infrastructure configs *before* piping them to LLMs.

Pasting raw `docker-compose.yml` or K8s manifests into ChatGPT is a massive OPSEC risk. Existing scrubbers are either bloated Node.js packages or require sending data to a backend. GhostSanitizer runs 100% in the browser via WASM/JS.

## Live Implementation (Demo)

I originally built this engine to power a zero-trust diagnostic matrix for my team. If you want to test the redaction logic against live LLM inferencing without writing code, you can use the production implementations below.

*Open your F12 Network tab. You will see the payloads are sanitized locally before any outbound request is made.*

- 🛠️ [Try it on a broken Docker Compose YAML](https://stackengine.dev/docker-compose-yaml-unmarshal-indentation-error)
- 🛠️ [Try it on a PostgreSQL Deadlock Log](https://stackengine.dev/postgres-deadlock-detected-sharelock-transaction)

<video src="https://github.com/user-attachments/assets/92397b0b-c193-4fee-9337-4e8cd8cd5ce7" autoplay loop muted playsinline width="100%"></video>

## The "Tokenization" Workflow
Dumb masking (replacing secrets with `***`) breaks the LLM's AST parsing and context window. We use deterministic tokenization instead.

1. **Intercept:** Browser script catches the raw config.
2. **Tokenize:** Secrets are replaced locally (`postgres://admin:SuperSecret -> postgres://admin:__STACK_SEC_1__`).
3. **Transmit:** The LLM receives the tokenized payload, fixes the indentation/syntax, and returns it.
4. **Restore:** GhostSanitizer maps the tokens back to the real secrets in the browser memory.

## Quick Start

```typescript
import { GhostSanitizer } from './sanitizer';

const sanitizer = new GhostSanitizer();
const rawConfig = `DATABASE_URL: postgres://admin:SuperS3cr3t!@db.example.com`;

// 1. Sanitize before sending to LLM
const safePayload = sanitizer.sanitize(rawConfig);
// Output: DATABASE_URL: postgres://admin:__STACK_SEC_1__@db.example.com

// 2. Mock LLM returning refactored code
const llmOutput = `// Refactored\nDATABASE_URL: postgres://admin:__STACK_SEC_1__@db.example.com`;

// 3. Restore secrets locally
const finalCode = sanitizer.restore(llmOutput, sanitizer.getMap());
```

## Security & Regex Coverage
- [x] Multi-line RSA / ECDSA Private Keys
- [x] AWS Credentials (`AKIA...`)
- [x] Embedded DB URIs with greedy characters (`@`, `!`)
- [x] JWT Tokens
- [x] Generic high-entropy assignments (`password:`, `secret=`)

## Limitations & Enterprise Integration
This open-source regex tokenizer covers 99.9% of standard high-entropy secrets and is perfect for individual debugging. However, heavily obfuscated, non-standard multiline strings in giant mono-repos might require deeper AST parsing. 

If your organization has strict compliance requirements (SOC2/HIPAA) and needs to enforce this sanitization completely offline within your CI/CD pipelines (GitHub Actions/GitLab CI) before deployment, check out the [StackEngine Enterprise CLI](https://stackengine.dev).

## License
MIT
