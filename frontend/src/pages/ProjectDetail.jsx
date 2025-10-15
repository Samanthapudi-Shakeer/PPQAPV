import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { useGlobalSearch } from "../context/GlobalSearchContext";
import M1RevisionHistory from "../components/sections/M1RevisionHistory";
import M2TOC from "../components/sections/M2TOC";
import M3Definitions from "../components/sections/M3Definitions";
import M4ProjectOverview from "../components/sections/M4ProjectOverview";
import M5Resources from "../components/sections/M5Resources";
import M6MonitoringControl from "../components/sections/M6MonitoringControl";
import M7QualityManagement from "../components/sections/M7QualityManagement";
import M8DecisionManagement from "../components/sections/M8DecisionManagement";
import M9RiskManagement from "../components/sections/M9RiskManagement";
import M10OpportunityManagement from "../components/sections/M10OpportunityManagement";
import M11ConfigurationManagement from "../components/sections/M11ConfigurationManagement";
import M12Deliverables from "../components/sections/M12Deliverables";
import M13SupplierAgreement from "../components/sections/M13SupplierAgreement";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("M1");
  const [error, setError] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEditor = ["admin", "editor"].includes(currentUser.role);
  const { searchTerm } = useGlobalSearch();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "M1", name: "Revision History", component: M1RevisionHistory },
    { id: "M2", name: "TOC", component: M2TOC },
    { id: "M3", name: "Definitions & References", component: M3Definitions },
    { id: "M4", name: "Project Introduction", component: M4ProjectOverview },
    { id: "M5", name: "Resource Plan & Estimation", component: M5Resources },
    { id: "M6", name: "PMC & Project Objectives", component: M6MonitoringControl },
    { id: "M7", name: "Quality Management", component: M7QualityManagement },
    { id: "M8", name: "DAR, Tailoring and Release Plan", component: M8DecisionManagement },
    { id: "M9", name: "Risk Management", component: M9RiskManagement },
    { id: "M10", name: "Opportunity Management", component: M10OpportunityManagement },
    { id: "M11", name: "Configuration Management", component: M11ConfigurationManagement },
    { id: "M12", name: "List of Deliverables", component: M12Deliverables },
    { id: "M13", name: "Supplier Agreement", component: M13SupplierAgreement }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container">
        <div className="error-message">{error || "Project not found"}</div>
        <button className="btn btn-primary" onClick={() => navigate("/projects")}>
          Back to Projects
        </button>
      </div>
    );
  }

  const ActiveSectionComponent = sections.find(s => s.id === activeTab)?.component;

  return (
    <div className="page-container">
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate("/projects")}
              style={{ marginBottom: "1rem" }}
              data-testid="back-to-projects"
            >
              ← Back to Projects
            </button>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Project Name : {project.name}
            </h1>
            {project.description && (
              <p style={{ color: "#718096" }}>{project.description}</p>
            )}
          </div>
          <div>
            <span className={`badge badge-${currentUser.role}`} style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>
              {currentUser.role} Mode
            </span>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs-header">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`tab-button ${activeTab === section.id ? "active" : ""}`}
                onClick={() => setActiveTab(section.id)}
                data-testid={`tab-${section.id}`}
              >
                {section.name}
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="tab-content-header">
              <h2 className="section-title" data-testid="section-heading">
                {sections.find((s) => s.id === activeTab)?.name || "Section"}
              </h2>
              {searchTerm && (
                <p className="search-hint">
                  Filtering section content for <strong>"{searchTerm}"</strong>
                </p>
              )}
            </div>
            {ActiveSectionComponent && (
              <ActiveSectionComponent
                projectId={projectId}
                isEditor={isEditor}
                sectionId={activeTab}
                sectionName={sections.find((s) => s.id === activeTab)?.name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
