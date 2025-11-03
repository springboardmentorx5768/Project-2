// In: front_end/src/components/ui/Tabs.jsx
import React from 'react';

// These are simplified. They just render their children.
// The logic is handled by the `activeTab` state in your dashboard.
export const Tabs = ({ children, value, ...props }) => (
  <div {...props}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab: value })
    )}
  </div>
);

export const TabsContent = ({ children, value, activeTab, ...props }) => (
  <div {...props} style={{ display: value === activeTab ? 'block' : 'none' }}>
    {children}
  </div>
);