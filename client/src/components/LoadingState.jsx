export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-lg font-medium text-slate-700">Analyzing your needs…</p>
      <p className="text-sm text-slate-500">Scoring cars and consulting our AI advisor</p>
    </div>
  );
}
