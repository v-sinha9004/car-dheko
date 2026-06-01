export default function FollowUpQuestions({ questions }) {
  if (!questions?.length) return null;

  return (
    <section className="rounded-xl border border-dashed border-indigo-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Questions to refine your choice</h2>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-2 text-slate-700">
            <span className="text-indigo-500 font-bold">?</span>
            <span>{q}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
