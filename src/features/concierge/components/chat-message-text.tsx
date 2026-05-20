import { Settings2 } from "lucide-react";

interface ChatMessageTextProps {
  content: string;
}

export function ChatMessageText({ content }: ChatMessageTextProps) {
  if (!content) return null;

  const renderBold = (str: string) => {
    return str.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={i} className="font-bold text-inherit">{chunk.slice(2, -2)}</strong>;
      }
      return <span key={i}>{chunk}</span>;
    });
  };

  if (!content.includes('[[SETTINGS_ICON]]')) return renderBold(content);

  const parts = content.split('[[SETTINGS_ICON]]');
  return (
    <>
      {renderBold(parts[0])}
      <Settings2 className="inline-block w-3.5 h-3.5 mx-0.5 mb-0.5 align-middle text-slate-500" />
      {renderBold(parts[1])}
    </>
  );
}
