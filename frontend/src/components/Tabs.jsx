import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-4 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
              activeTab === tab.id
                ? "border-b-2 border-ac-green text-ac-green"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
