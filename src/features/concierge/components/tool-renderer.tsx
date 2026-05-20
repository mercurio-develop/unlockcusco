import { X } from "lucide-react";
import { ToolErrorCard, ActionSuccessCard, LocationRequestCard, MacroTripCard, SaveLinkCard } from "./tool-cards";
import { PendingAvailability } from "./pending-availability";
import { ItinerarySummaryCard } from "./itinerary-summary-card";
import { SearchResultsCard } from "./search-results-card";
import { BoletoInfoCard } from "./boleto-info-card";
import { TaxiFareCard } from "./taxi-fare-card";

interface ToolRendererProps {
  message: any;
  onShareLocation: () => void;
}

export function ToolRenderer({ message, onShareLocation }: ToolRendererProps) {
  // Map AI SDK v6 or v3 tools
  const partsTools = (message.parts || []).filter((p: any) => p?.type?.startsWith('tool-') || p?.type === 'dynamic-tool');
  const invocationsTools = (message.toolInvocations || []).filter((ti: any) => ti != null).map((ti: any) => ({
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
      {tools.map((part: any, idx: number) => {
        const isToolPart = part?.type?.startsWith('tool-') || part?.type === 'dynamic-tool';
        if (!part || !isToolPart) return null;
        
        const key = part.toolCallId || part.toolInvocation?.toolCallId || idx;
        const toolInvocation = part.toolInvocation || part;
        const toolName = part.toolName || toolInvocation.toolName || part.type.replace(/^tool-/, '');
        const isDone = part?.state === 'output-available' || toolInvocation?.state === 'result';
        const output = toolInvocation.result || part.output;
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

        if (output?.error || typeof output === 'string') {
          const errMsg = typeof output === 'string' ? 'Tool failed to execute.' : 'I ran into a snag — try rephrasing?';
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
            return <SearchResultsCard key={key} businesses={output} messageId={message.id} input={input} />
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
            return <ActionSuccessCard key={key} message="Itinerary Updated" />
          default:
            return null;
        }
      })}
    </>
  );
}
