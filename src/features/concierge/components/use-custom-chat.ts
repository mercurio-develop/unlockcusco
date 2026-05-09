import { useState, useCallback } from 'react';

export function useCustomChat({ api, initialMessages }: { api: string, initialMessages: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'streaming' | 'ready'>('idle');
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (message: { text: string }, options?: { body: any }) => {
    setStatus('submitted');
    setError(null);
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.text,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          ...options?.body
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setStatus('streaming');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', toolInvocations: [] }]);

      if (reader) {
        let done = false;
        let buffer = '';
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const chunk = JSON.parse(line);
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    
                    if (chunk.type === 'text') {
                      lastMsg.content += chunk.content;
                    } else if (chunk.type === 'tool_call') {
                      lastMsg.toolInvocations.push({
                        toolCallId: chunk.toolCallId,
                        toolName: chunk.toolName,
                        args: chunk.args,
                        state: 'call'
                      });
                    } else if (chunk.type === 'tool_result') {
                      const toolInv = lastMsg.toolInvocations.find((t: any) => t.toolCallId === chunk.toolCallId);
                      if (toolInv) {
                        toolInv.state = 'result';
                        toolInv.result = chunk.result;
                      }
                    } else if (chunk.type === 'error') {
                       setError(new Error(chunk.message));
                    }
                    
                    return newMessages;
                  });
                } catch (e) {
                  console.error("Failed to parse chunk:", line, e);
                }
              }
            }
          }
        }
      }
      setStatus('ready');
    } catch (err: any) {
      console.error(err);
      setError(err);
      setStatus('ready');
    }
  }, [api, messages]);

  return { messages, sendMessage, status, error };
}
