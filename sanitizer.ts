export class GhostSanitizer {
  private tokenMap: Record<string, string> = {};
  private counter: number = 0;

  private tokenize(value: string): string {
    this.counter++;
    const token = `__STACK_SEC_${this.counter}__`;
    this.tokenMap[token] = value; 
    return token;
  }

  public sanitize(payload: string): string {
    let safePayload = payload;
    this.tokenMap = {}; 
    this.counter = 0;

    
    const privateKeyRegex = /(-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----)([\s\S]+?)(-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----)/g;
    safePayload = safePayload.replace(privateKeyRegex, (match, p1, p2, p3) => `${p1}\n${this.tokenize(p2)}\n${p3}`);

    
    const k8sEnvRegex = /(-\s*name:\s*[a-zA-Z0-9_.-]*(?:password|passwd|pwd|secret|token|api_?key|access_?key|key_?id)[a-zA-Z0-9_.-]*\s*\n\s*value:\s*)([^\n]+)/gi;
    safePayload = safePayload.replace(k8sEnvRegex, (match, p1, p2) => `${p1}${this.tokenize(p2)}`);

    
    const dbUriRegex = /([a-zA-Z0-9+.-]+:\/\/)([^:\s]+):(.+)@([a-zA-Z0-9.-]+(?::\d+)?(?:\/[^\s]*)?)/g;
    safePayload = safePayload.replace(dbUriRegex, (match, p1, p2, p3, p4) => `${p1}${p2}:${this.tokenize(p3)}@${p4}`);

    
    const genericSecretRegex = /([a-zA-Z0-9_.-]*(?:password|passwd|pwd|secret|token|api_?key|access_?key|key_?id)[a-zA-Z0-9_.-]*[ \t]*[:=][ \t]*)(?!\||>|{|\[)(.+)$/gim;
    safePayload = safePayload.replace(genericSecretRegex, (match, p1, p2) => `${p1}${this.tokenize(p2)}`);

    
    const jwtRegex = /(eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]*)/g;
    safePayload = safePayload.replace(jwtRegex, (match, p1) => this.tokenize(p1));

    return safePayload;
  }

  public getMap(): Record<string, string> {
    return this.tokenMap;
  }

  public restore(text: string, map: Record<string, string>): string {
    let restoredText = text;
    for (const [token, value] of Object.entries(map)) {
      const regex = new RegExp(token, 'g');
      restoredText = restoredText.replace(regex, value);
    }
    return restoredText;
  }
}
