export function PendingAvailability({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg my-2 max-w-[85%] mx-auto backdrop-blur-md">
      <div className="animate-spin w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
      <span className="text-white/90 text-sm font-medium">{message}</span>
    </div>
  );
}
