"use client";

import { ToolErrorCard, ActionSuccessCard, LocationRequestCard, MacroTripCard, SaveLinkCard } from "./tool-cards";
import { PendingAvailability } from "./pending-availability";
import { ItinerarySummaryCard } from "./itinerary-summary-card";
import { SearchResultsCard } from "./search-results-card";
import { BoletoInfoCard } from "./boleto-info-card";
import { TaxiFareCard } from "./taxi-fare-card";
import type { UIMessage } from "@ai-sdk/react";

interface ToolRendererProps {
  message: UIMessage;
  onShareLocation: () => void;
}

export function ToolRenderer({ message, onShareLocation }: ToolRendererProps) {
  // Map AI SDK v6 or v3 tools
  // v6 uses parts, v3 uses toolInvocations (deprecated but may exist in some older parts)
  const partsMap = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message.parts || []).forEach((p: any, index: number) => {
    const isTool = p.type?.toLowerCase().includes('tool') || p.type === 'dynamic-tool' || p.toolCallId !== undefined || p.toolInvocation !== undefined;
    if (!isTool) return;
    
    const key = p.toolCallId || p.toolInvocation?.toolCallId;
    if (!key) {
      partsMap.set(`unknown-tool-${index}`, p);
      return;
    }
    
    const existing = partsMap.get(key);
    if (!existing) {
      partsMap.set(key, { ...p });
    } else {
      // Merge them to ensure we keep both input and output if they are split
      partsMap.set(key, { ...existing, ...p });
    }
  });
  
  const partsTools = Array.from(partsMap.values());

  // Backwards compatibility for toolInvocations if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invocationsTools = ((message as any).toolInvocations || []).map((ti: any) => ({
    type: 'tool-invocation',
    toolInvocation: ti,
    state: ti?.state === 'result' ? 'output-available' : undefined,
    output: ti?.result,
    input: ti?.args,
    toolCallId: ti?.toolCallId,
    toolName: ti?.toolName
  }));

  const tools = partsTools.length > 0 ? partsTools : invocationsTools;

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {tools.map((part: any, idx: number) => {
        const isToolPart = part?.type?.startsWith('tool-') || part?.type === 'dynamic-tool';
        if (!part || !isToolPart) return null;
        
        const key = part.toolCallId || part.toolInvocation?.toolCallId || idx;
        const toolInvocation = part.toolInvocation || part;
        const toolName = part.toolName || toolInvocation.toolName || part.type?.replace(/^tool-/, '');
        
        // In v6 UIMessage, state is 'output-available' for completed tools.
        // Also explicitly check if part.type === 'tool-result' or 'tool-output-available' which indicates completion.
        const isCompleted = part?.state === 'output-available' || part?.state === 'result' || toolInvocation?.state === 'result' || part?.type === 'tool-result' || part?.type === 'tool-output-available';
        const isError = part?.state === 'output-error' || part?.state === 'error' || toolInvocation?.state === 'error' || part?.type === 'tool-error';
        const isDone = isCompleted || isError;
        
        // Prefer the actual result or output object
        const output = toolInvocation.result || toolInvocation.output || part.output || part.result;
        const input = toolInvocation.args || part.input;

        if (!isDone) {
          if (toolName === 'askAvailability') {
            return <PendingAvailability key={key} message="Contacting vendor via Ghost Phone..." />
          }
          if (toolName === 'showBoletoInfo') {
            return <PendingAvailability key={key} message="Retrieving Boleto Turístico information..." />
          }
          if (toolName === 'askUserLocation') {
            return <LocationRequestCard key={key} message={input?.message} onShareLocation={onShareLocation} />
          }
          if (toolName === 'searchDatabase') {
            return (
              <div key={key}>
                <PendingAvailability message="Searching UnlockCusco library..." />
                <style>{`#msg-text-${message.id} { display: none; }`}</style>
              </div>
            )
          }
          return null;
        }

        if (isError || output?.error || typeof output === 'string') {
          const errMsg = part?.errorText || toolInvocation?.errorText || (typeof output === 'string' ? 'Tool failed to execute.' : 'I ran into a snag — try rephrasing?');
          return <ToolErrorCard key={key} message={errMsg} />;
        }

        switch (toolName) {
          case 'askUserLocation':
            return <LocationRequestCard key={key} message={output?.message || input?.message} onShareLocation={onShareLocation} />
          case 'buildItinerary':
            return <ItinerarySummaryCard key={key} itinerary={output} />
          case 'buildMacroTrip':
            return <MacroTripCard key={key} title={output?.title} daysCount={output?.days?.length} />
          case 'searchDatabase':
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <SearchResultsCard key={key} intent={output?.intent} businesses={output?.results || []} messageId={message.id} input={input as any} />
          case 'askAvailability':
            return <PendingAvailability key={key} message={output?.message} />
          case 'showBoletoInfo':
            if (!output?.data) return <ToolErrorCard key={key} message="Sorry, I couldn't fetch the Boleto information." />
            return <BoletoInfoCard key={key} data={output?.data} message={output?.message || input?.message} />
          case 'estimateTaxiFare':
            return <TaxiFareCard key={key} data={output} />
          case 'generateSaveLink':
            if (output?.url) return <SaveLinkCard key={key} url={output.url} />
            return null;
          case 'mutateItinerary':
            if (output?.success === false) {
              return <ToolErrorCard key={key} message={output.message || "Failed to update itinerary."} />;
            }
            return <ActionSuccessCard key={key} message="Itinerary Updated" />
          default:
            return null;
        }
      })}
    </>
  );
}
