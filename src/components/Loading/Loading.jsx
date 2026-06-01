export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center py-16"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
    </div>
  );
}
