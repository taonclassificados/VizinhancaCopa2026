import React, { useState } from 'react';
import CopaGenZApp from './components/CopaGenZApp';
import RealtimeNotificationSystem from './components/RealtimeNotificationSystem';

export default function App() {
  const [openNotifications, setOpenNotifications] = useState(false);
  const [activeView, setActiveView] = useState('inicio');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Principal View: Modern Gen Z Mobile-First Social Network */}
      <CopaGenZApp />

      {/* Realtime Notification System Layer */}
      <RealtimeNotificationSystem 
        onNavigate={(view) => {
          // Sync navigated pages if necessary
        }}
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
      />
    </div>
  );
}
