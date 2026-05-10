# GhostSanitizer 👻

A zero-dependency, pure client-side TypeScript/Regex engine to sanitize high-entropy secrets (AWS Keys, DB URIs, RSA Keys, JWTs) from configurations *before* they are sent to external LLM APIs (like ChatGPT or Claude).

## Why?
Pasting `docker-compose.yml`, Kubernetes manifests, or `.env` files into LLMs is a massive OPSEC risk. Existing scrubbers are either heavy Node.js libraries or require sending data to a backend. GhostSanitizer runs 100% in the browser (or Edge Worker), tokenizing secrets into safe placeholders (e.g., `__STACK_SEC_1__`) and providing a map to safely restore them locally.

## Live Demo & Real-World Implementation
I didn't just want a library, I needed a tool I could actually use during production incidents. 

I integrated `GhostSanitizer` into a full Zero-Backend diagnostic matrix called **[StackEngine.dev](https://stackengine.dev)**. 

You can test the live decryption theater (press F12 to watch the sanitizer intercept secrets before the network request) on specific edge cases here:
👉 **[Test Live Sandbox: K8s OOMKilled Analyzer](https://stackengine.dev/k8s-oomkilled-exit-137-eks-fargate)**

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
