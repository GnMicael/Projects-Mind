export default function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Carregando">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  );
}
