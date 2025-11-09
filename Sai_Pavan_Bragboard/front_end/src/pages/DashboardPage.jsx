import React from 'react';
import MainContentArea from '../components/dashboard/MainContentArea.jsx';

export default function DashboardPage() {
  // The layout (sidebar, top nav) is provided by `DashboardLayout`.
  // This page should only render the main content area to avoid duplicate dashboards.
  return (
    <>
      <MainContentArea />
    </>
  );
}
