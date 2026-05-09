"use client"
import { useState, useCallback } from "react"

export function useGenAIChat({ api, initialMessages }: { api: string, initialMessages?: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'streaming' | 'error'>('idle');

  const sendMessage = useCallback(async (msg: { text: string }, options?: any) => {
    setStatus('submitted');
    
    // Add user message immediately
    const userMessage = { id: Date.now().toString(), role: 'user', content: msg.text };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          data: options?.body
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setStatus('streaming');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [] as any[] };
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.substring(2));
                assistantMessage = { ...assistantMessage, content: assistantMessage.content + text };
                setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
              } catch (e) {}
            } else if (line.startsWith('9:')) {
              try {
                const toolCallInfo = JSON.parse(line.substring(2));
                if (toolCallInfo.type === 'tool-call') {
                   assistantMessage = { 
                     ...assistantMessage, 
                     toolInvocations: [
                       ...(assistantMessage.toolInvocations || []), 
                       { state: 'call', toolCallId: toolCallInfo.toolCallId, toolName: toolCallInfo.toolName, args: toolCallInfo.args }
                     ] 
                   };
                   setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
                }
              } catch (e) {}
            } else if (line.startsWith('a:')) {
              try {
                const toolResultInfo = JSON.parse(line.substring(2));
                assistantMessage = { 
                   ...assistantMessage, 
                   toolInvocations: (assistantMessage.toolInvocations || []).map(t => 
                     t.toolCallId === toolResultInfo.toolCallId ? { ...t, state: 'result', result: toolResultInfo.result } : t
                   )
                };
                setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
              } catch(e) {}
            }
          }
        }
      }
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, [api, messages]);

  return { messages, sendMessage, status };
}
