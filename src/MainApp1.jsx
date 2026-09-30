import React, { useState } from "react";
import IconTraining from "./participant1/iconTraining";
import GiverTraining from "./participant1/giverTraining1";
import Set1Practice1 from "./participant1/set1Practice1";
import Set1Practice2 from "./participant1/set1Practice2";
import Set1Practice3 from "./participant1/set1Practice3";
import Set1Test1 from "./participant1/set1Test1";
import Set1Test2 from "./participant1/set1Test2";

import DrawerTraining from "./participant1/drawerTraining2";
import Set2Practice1 from "./participant1/set2Practice1";
import Set2Practice2 from "./participant1/set2Practice2";
import Set2Practice3 from "./participant1/set2Practice3";
import Set2Test1 from "./participant1/set2Test1";
import Set2Test2 from "./participant1/set2Test2";
import "./App.css";

function MainApp() {
  const [activeTab, setActiveTab] = useState("icontraining");
  const [completedTabs, setCompletedTabs] = useState({});

  const markComplete = (tabKey) => {
    setCompletedTabs(prev => ({ ...prev, [tabKey]: true }));
  };

  const renderButton = (key, label) => (
    <button
      className={activeTab === key ? "active" : ""}
      onClick={() => setActiveTab(key)}
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      {completedTabs[key] && <span style={{ fontSize: "1.1em" }}>✅</span>}
      {label}
    </button>
  );

  return (
    <div className="main-layout">
      <div className="left-tabs">
        {renderButton("icontraining", "Icon Training")}
        <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
        <div style={{ marginBottom: 5, fontWeight: "bold" }}>Set 1</div>
        {renderButton("givertraining", "Training")}
        {renderButton("set1practice1", "Practice 1")}
        {renderButton("set1practice2", "Practice 2")}
        {renderButton("set1practice3", "Practice 3")}
        {renderButton("set1test1", "Test 1")}
        {renderButton("set1test2", "Test 2")}
        <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
        <div style={{ marginBottom: 5, fontWeight: "bold" }}>Set 2</div>
        {renderButton("drawertraining", "Training")}
        {renderButton("set2practice1", "Practice 1")}
        {renderButton("set2practice2", "Practice 2")}
        {renderButton("set2practice3", "Practice 3")}
        {renderButton("set2test1", "Test 1")}
        {renderButton("set2test2", "Test 2")}
      </div>

      <div className="content-area">
        {activeTab === "icontraining" && <IconTraining onComplete={() => markComplete("icontraining")} />}
        {activeTab === "givertraining" && <GiverTraining onComplete={() => markComplete("givertraining")} />}
        {activeTab === "set1practice1" && <Set1Practice1 onComplete={() => markComplete("set1practice1")} />}
        {activeTab === "set1practice2" && <Set1Practice2 onComplete={() => markComplete("set1practice2")} />}
        {activeTab === "set1practice3" && <Set1Practice3 onComplete={() => markComplete("set1practice3")} />}
        {activeTab === "set1test1" && <Set1Test1 onComplete={() => markComplete("set1test1")} />}
        {activeTab === "set1test2" && <Set1Test2 onComplete={() => markComplete("set1test2")} />}
        {activeTab === "drawertraining" && <DrawerTraining onComplete={() => markComplete("drawertraining")} />}
        {activeTab === "set2practice1" && <Set2Practice1 onComplete={() => markComplete("set2practice1")} />}
        {activeTab === "set2practice2" && <Set2Practice2 onComplete={() => markComplete("set2practice2")} />}
        {activeTab === "set2practice3" && <Set2Practice3 onComplete={() => markComplete("set2practice3")} />}
        {activeTab === "set2test1" && <Set2Test1 onComplete={() => markComplete("set2test1")} />}
        {activeTab === "set2test2" && <Set2Test2 onComplete={() => markComplete("set2test2")} />}
      </div>
    </div>
  );
}

export default MainApp;
