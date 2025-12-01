# TS24 Ops Ready

## Kort oversigt

- TS24 health endpoint: `https://intel24.blackbox.codes/api/health`
- SSO endpoint: `https://intel24.blackbox.codes/sso-login`
- Manual login: `https://intel24.blackbox.codes/login`

## Hvad ops-teamet skal gøre

1. Opret DNS for `intel24.blackbox.codes` (A/AAAA peger på TS24 infra).
2. Opret og installer gyldigt TLS-certifikat (Let's Encrypt, DigiCert, etc.).
3. Kør curl-tests:
   - `curl -I https://intel24.blackbox.codes/api/health`
   - `curl -I https://intel24.blackbox.codes/sso-login`
   - `curl -I https://intel24.blackbox.codes/login`
4. Meld "GO" til ALPHA, når alle kontroller svarer 200/302 uden SSL-fejl.
