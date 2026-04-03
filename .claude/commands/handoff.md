Create a structured handoff note at docs/HANDOFF.md:

```json
{
  "session_date": "YYYY-MM-DD",
  "completed": ["list of completed items"],
  "current_state": {"working": [], "broken": [], "untested": []},
  "next_steps": ["ordered list of next actions"],
  "discoveries": ["any new findings from this session"],
  "files_modified": ["path: brief description"],
  "test_status": {"passing": 0, "failing": 0, "missing": 0}
}
```

Commit: "docs: session handoff YYYY-MM-DD"
