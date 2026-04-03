Analyze this session for wasted iterations. For each mistake, output:

1. **Trigger point:** The exact moment the approach went wrong
2. **Category:** hallucinated-api | wrong-mental-model | missing-context | cascading-fix | environment-mismatch
3. **Iteration cost:** How many round-trips were wasted
4. **Prevention rule:** One paragraph, concrete and actionable

Then:
- Add to the appropriate docs/discoveries/*.md (create file if needed)
- If hallucinated-api: also add to docs/anti-patterns/HALLUCINATION_LOG.md
- If dead-end approach: also add to docs/anti-patterns/DEAD_ENDS.md
- Log to docs/metrics/ITERATION_LOG.md: date, task summary, total iterations, categories hit
- Commit: "docs: post-mortem [category] - [one-line summary]"
