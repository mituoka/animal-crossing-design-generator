import React from "react";
import { Tabs as MuiTabs, Tab, Box } from "@mui/material";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
      <MuiTabs
        value={activeTab}
        onChange={handleChange}
        aria-label="design generation tabs"
        centered
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} label={tab.label} value={tab.id} />
        ))}
      </MuiTabs>
    </Box>
  );
};

export default Tabs;
