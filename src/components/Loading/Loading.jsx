export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}