# GhostSanitizer 👻
A zero-dependency, pure client-side TypeScript/Regex engine to sanitize high-entropy secrets (AWS Keys, DB URIs, RSA Keys, JWTs) from configurations *before* they are sent to external LLM APIs (like ChatGPT or Claude).

## Live Demo & Real-World Implementation
I didn't just want a library, I needed a tool I could actually use during production incidents. 

You can test the live Demo here: 
(I highly encourage you to keep your F12 Network Tab open while using it—you'll see firsthand that absolutely zero secrets ever hit a backend)

 [Docker Compose YAML Unmarshal Validator](https://stackengine.dev/docker-compose-yaml-unmarshal-indentation-error)
 > Malformed indentation in compose.yaml triggers YAML unmarshal errors that hard-stop docker-compose config parsing and block all container orchestration.

 [PostgreSQL Deadlock ShareLock Transaction Audit](https://stackengine.dev/postgres-deadlock-detected-sharelock-transaction) 
 > PostgreSQL deadlock on ShareLock forces transaction rollback, causing cascading failures in high-concurrency write workloads.

https://github.com/user-attachments/assets/92397b0b-c193-4fee-9337-4e8cd8cd5ce7

## Why?
Pasting `docker-compose.yml`, Kubernetes manifests, or `.env` files into LLMs is a massive OPSEC risk. Existing scrubbers are either heavy Node.js libraries or require sending data to a backend. GhostSanitizer runs 100% in the browser (or Edge Worker), tokenizing secrets into safe placeholders (e.g., `__STACK_SEC_1__`) and providing a map to safely restore them locally.

## Quick Start
```typescript
import { GhostSanitizer } from './sanitizer';

const sanitizer = new GhostSanitizer();
const rawConfig = `DATABASE_URL: postgres://admin:SuperS3cr3t!@db.example.com`;

// 1. Sanitize before sending to LLM
const safePayload = sanitizer.sanitize(rawConfig);
// Output: DATABASE_URL: postgres://admin:__STACK_SEC_1__@db.example.com

// 2. LLM returns refactored code with token
const llmOutput = `// Refactored\nDATABASE_URL: postgres://admin:__STACK_SEC_1__@db.example.com`;

// 3. Restore secrets locally
const finalCode = sanitizer.restore(llmOutput, sanitizer.getMap());
```

## Security & Regex Coverage
- [x] Multi-line RSA / ECDSA Private Keys
- [x] AWS Credentials (`AKIA...`)
- [x] Embedded DB URIs with greedy characters (`@`, `!`)
- [x] JWT Tokens
- [x] Generic high-entropy assignments

## License
MIT
