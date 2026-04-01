import { Sparkles } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui";

export function InsightSummary() {
  return (
    <Accordion>
      <AccordionItem title="AI Insights">
        <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
          <Sparkles size={24} className="mb-2 opacity-40" />
          <p className="text-sm font-semibold">AI Insights — Coming Soon</p>
          <p className="text-[11px] mt-1">
            Claude-generated performance insights will appear here once the anthropic-proxy worker is deployed
          </p>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
