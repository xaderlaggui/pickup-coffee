# Optimization plan

- total_tokens_audited: ~1,200 tokens (rough estimate across repo + config references)
- total_recoverable: ~150–250 tokens (1–2% of a 128K window)
- quick_win_tokens: ~150 tokens
- effort_to_savings_ratio: excellent (very low effort, low risk)
- top_3_actions:
  1. Add a lean .contextignore for generated and large directories -> saves ~100–150 tokens of unnecessary context reads
  2. Keep CLAUDE.md or AGENTS.md minimal and project-local -> avoids future prompt bloat
  3. Re-audit when new tools or instruction files are added -> protects the cache and prevents drift
- risks:
  - Excluding files may hide data that a future task actually needs
  - Over-aggressive instruction cleanup can remove useful product context if the project grows
