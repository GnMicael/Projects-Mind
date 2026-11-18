import { Hammer } from 'lucide-react';
export default function ComingSoon({ title, phase, note }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <Hammer className="mx-auto text-amber" />
      <h2 className="mt-4 text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-muted">{note} Esta área chega na fase {phase} do desenvolvimento.</p>
    </div>
  );
}
