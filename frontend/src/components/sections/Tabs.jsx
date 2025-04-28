import React from "react";
import { Tabs as MuiTabs, Tab, Box } from "@mui/material";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <MuiTabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} label={tab.label} value={tab.id} />
        ))}
      </MuiTabs>
    </Box>
  );
};

export default Tabs;
