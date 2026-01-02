"use client";

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white p-4 border-r">
        <h2 className="text-xl font-semibold">February 2026</h2>

        <div className="mt-6 space-y-3">
          <Integration name="Microsoft Teams" />
          <Integration name="Google Meet" />
          <Integration name="Zoom" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar & Meetings</h1>
            <p className="text-gray-500 text-sm">
              Manage your schedule across Zoom, Meet and Teams
            </p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            + New Meeting
          </button>
        </div>

        {/* AI Summary */}
        <div className="bg-indigo-50 p-4 rounded-xl mb-4">
          <h3 className="font-semibold text-indigo-700">
            ✨ Last Meeting AI Summary
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            The project is progressing well with strong team alignment.
          </p>
        </div>

        
      </main>
    </div>
  );
}

const Integration = ({ name }) => (
  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
    <span>{name}</span>
    <span className="text-green-600 text-xs">Connected</span>
  </div>
);
