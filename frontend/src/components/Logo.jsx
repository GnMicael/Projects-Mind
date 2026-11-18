export default function Logo({ size = 'text-xl' }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${size}`}>
      Project<span className="text-brand">Mind</span>
    </span>
  );
}
