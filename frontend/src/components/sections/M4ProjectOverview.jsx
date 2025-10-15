import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SingleEntryEditor from "../SingleEntryEditor";
import SectionLayout from "../SectionLayout";
import { SECTION_CONFIG } from "../../sectionConfig";
import { useSingleEntries } from "../../hooks/useSingleEntries";

const M4ProjectOverview = ({
  projectId,
  isEditor,
  sectionId,
  sectionName,
  onSingleEntryDirtyChange
}) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [assumptions, setAssumptions] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessContinuity, setBusinessContinuity] = useState([]);
  const [informationSecurityRequirements, setInformationSecurityRequirements] = useState([]);
  const singleEntryConfig = SECTION_CONFIG.M4?.singleEntries || [];
  const {
    values: singleEntryValues,
    loading: singleEntryLoading,
    updateContent: updateSingleEntryContent,
    updateImage: updateSingleEntryImage,
    saveEntry: saveSingleEntry,
    dirtyFields: singleEntryDirty,
    hasUnsavedChanges: singleEntryHasUnsaved
  } = useSingleEntries(projectId, singleEntryConfig);

  useEffect(() => {
    if (onSingleEntryDirtyChange && sectionId) {
      onSingleEntryDirtyChange(sectionId, singleEntryHasUnsaved);
    }
  }, [onSingleEntryDirtyChange, sectionId, singleEntryHasUnsaved]);

  useEffect(() => {
    return () => {
      if (onSingleEntryDirtyChange && sectionId) {
        onSingleEntryDirtyChange(sectionId, false);
      }
    };
  }, [onSingleEntryDirtyChange, sectionId]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [
        detailsRes,
        assumptionsRes,
        constraintsRes,
        dependenciesRes,
        businessContinuityRes,
        informationSecurityRes
      ] = await Promise.all([
        axios.get(`${API}/projects/${projectId}/project-details`),
        axios.get(`${API}/projects/${projectId}/assumptions`),
        axios.get(`${API}/projects/${projectId}/constraints`),
        axios.get(`${API}/projects/${projectId}/dependencies`),
        axios.get(`${API}/projects/${projectId}/sections/M4/tables/business_continuity`),
        axios.get(
          `${API}/projects/${projectId}/sections/M4/tables/information_security_requirements`
        )
      ]);

      setProjectDetails(detailsRes.data);
      setAssumptions(assumptionsRes.data);
      setConstraints(constraintsRes.data);
      setDependencies(dependenciesRes.data);
      setBusinessContinuity(
        (businessContinuityRes.data || []).map((row) => ({ id: row.id, ...row.data }))
      );
      setInformationSecurityRequirements(
        (informationSecurityRes.data || []).map((row) => ({ id: row.id, ...row.data }))
      );
    } catch (err) {
      console.error("Failed to fetch project overview", err);
    } finally {
      setLoading(false);
    }
  };

  // Assumptions
  const handleAddAssumption = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/assumptions`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add assumption");
    }
  };

  const handleEditAssumption = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/assumptions/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update assumption");
    }
  };

  const handleDeleteAssumption = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/assumptions/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete assumption");
    }
  };

  // Constraints
  const handleAddConstraint = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/constraints`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add constraint");
    }
  };

  const handleEditConstraint = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/constraints/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update constraint");
    }
  };

  const handleDeleteConstraint = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/constraints/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete constraint");
    }
  };

  // Dependencies
  const handleAddDependency = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/dependencies`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add dependency");
    }
  };

  const handleEditDependency = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/dependencies/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update dependency");
    }
  };

  const handleDeleteDependency = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/dependencies/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete dependency");
    }
  };

  const assumptionColumns = [
    { key: "sl_no", label: "Sl. No", numericOnly: true },
    { key: "brief_description", label: "Brief Description" },
    { key: "impact_on_project_objectives", label: "Impact on Project Objectives" },
    { key: "remarks", label: "Remarks" }
  ];

  const constraintColumns = [
    { key: "constraint_no", label: "Sl. No", numericOnly: true },
    { key: "brief_description", label: "Brief Description" },
    { key: "impact_on_project_objectives", label: "Impact on Project Objectives" },
    { key: "remarks", label: "Remarks" }
  ];

  const dependencyColumns = [
    { key: "sl_no", label: "Sl. No", numericOnly: true },
    { key: "brief_description", label: "Brief Description" },
    { key: "impact_on_project_objectives", label: "Impact on Project Objectives" },
    { key: "remarks", label: "Remarks" }
  ];

  const businessContinuityColumns = [
    { key: "sl_no", label: "Sl. No", numericOnly: true },
    { key: "brief_description", label: "Brief Description" },
    { key: "impact_of_project_objectives", label: "Impact on Project Objectives" },
    { key: "remarks", label: "Remarks" }
  ];

  const infoSecurityColumns = [
    { key: "sl_no", label: "Sl. No", numericOnly: true },
    { key: "phase", label: "Phase" },
    { key: "is_requirement_description", label: "IS Requirement Description" },
    { key: "monitoring_control", label: "Monitoring / Control" },
    { key: "tools", label: "Tools" },
    { key: "artifacts", label: "Artifacts" },
    { key: "remarks", label: "Remarks" }
  ];

  const handleSingleEntrySave = async (field) => {
    try {
      await saveSingleEntry(field);
      alert("Saved successfully!");
    } catch (err) {
      console.error("Failed to save entry", err);
      alert("Failed to save");
    }
  };

  const singleEntryItems = singleEntryConfig.map((entry) => ({
    id: `single-${entry.field}`,
    label: entry.label,
    type: "Single Entry",
    render: () => (
      <SingleEntryEditor
        key={entry.field}
        definitions={[entry]}
        values={singleEntryValues}
        loading={singleEntryLoading}
        isEditor={isEditor}
        onContentChange={updateSingleEntryContent}
        onImageChange={updateSingleEntryImage}
        onSave={handleSingleEntrySave}
        dirtyFields={{ [entry.field]: singleEntryDirty[entry.field] }}
      />
    )
  }));

  const navigationItems = [
    {
      id: "project-details",
      label: "Project Details",
      type: "Overview",
      render: () => (
        <div className="card" style={{ background: "#f7fafc", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>
            Project Details
          </h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : projectDetails ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem"
              }}
            >
              <div>
                <strong>Project Model:</strong> {projectDetails.project_model}
              </div>
              <div>
                <strong>Project Type:</strong> {projectDetails.project_type}
              </div>
              <div>
                <strong>Software Type:</strong> {projectDetails.software_type}
              </div>
              <div>
                <strong>Standard:</strong> {projectDetails.standard_to_be_followed}
              </div>
              <div>
                <strong>Customer:</strong> {projectDetails.customer}
              </div>
              <div>
                <strong>Language:</strong> {projectDetails.programming_language}
              </div>
              <div>
                <strong>Duration:</strong> {projectDetails.project_duration}
              </div>
              <div>
                <strong>Team Size:</strong> {projectDetails.team_size}
              </div>
            </div>
          ) : (
            <p style={{ color: "#4a5568" }}>Project details are not available.</p>
          )}
        </div>
      )
    },
    {
      id: "table-assumptions",
      label: "Assumptions",
      type: "Table",
      render: () => (
        <DataTable
          columns={assumptionColumns}
          data={assumptions}
          onAdd={handleAddAssumption}
          onEdit={handleEditAssumption}
          onDelete={handleDeleteAssumption}
          isEditor={isEditor}
          addButtonText="Add Assumption"
          uniqueKeys={["sl_no"]}
        />
      )
    },
    {
      id: "table-constraints",
      label: "Constraints",
      type: "Table",
      render: () => (
        <DataTable
          columns={constraintColumns}
          data={constraints}
          onAdd={handleAddConstraint}
          onEdit={handleEditConstraint}
          onDelete={handleDeleteConstraint}
          isEditor={isEditor}
          addButtonText="Add Constraint"
          uniqueKeys={["constraint_no"]}
        />
      )
    },
    {
      id: "table-dependencies",
      label: "Dependencies",
      type: "Table",
      render: () => (
        <DataTable
          columns={dependencyColumns}
          data={dependencies}
          onAdd={handleAddDependency}
          onEdit={handleEditDependency}
          onDelete={handleDeleteDependency}
          isEditor={isEditor}
          addButtonText="Add Dependency"
          uniqueKeys={["sl_no"]}
        />
      )
    },
    {
      id: "table-business-continuity",
      label: "Business Continuity",
      type: "Table",
      render: () => (
        <DataTable
          columns={businessContinuityColumns}
          data={businessContinuity}
          onAdd={async (newData) => {
            await axios.post(`${API}/projects/${projectId}/sections/M4/tables/business_continuity`, {
              data: newData
            });
            fetchData();
          }}
          onEdit={async (id, updatedData) => {
            const { id: _, project_id, section, table_name, ...rowData } = updatedData;
            await axios.put(
              `${API}/projects/${projectId}/sections/M4/tables/business_continuity/${id}`,
              { data: rowData }
            );
            fetchData();
          }}
          onDelete={async (id) => {
            if (!window.confirm("Delete this row?")) return;
            await axios.delete(
              `${API}/projects/${projectId}/sections/M4/tables/business_continuity/${id}`
            );
            fetchData();
          }}
          isEditor={isEditor}
          addButtonText="Add Business Continuity Item"
          uniqueKeys={["sl_no"]}
        />
      )
    },
    {
      id: "table-information-security",
      label: "Information Security Requirements",
      type: "Table",
      render: () => (
        <DataTable
          columns={infoSecurityColumns}
          data={informationSecurityRequirements}
          onAdd={async (newData) => {
            await axios.post(
              `${API}/projects/${projectId}/sections/M4/tables/information_security_requirements`,
              { data: newData }
            );
            fetchData();
          }}
          onEdit={async (id, updatedData) => {
            const { id: _, project_id, section, table_name, ...rowData } = updatedData;
            await axios.put(
              `${API}/projects/${projectId}/sections/M4/tables/information_security_requirements/${id}`,
              { data: rowData }
            );
            fetchData();
          }}
          onDelete={async (id) => {
            if (!window.confirm("Delete this row?")) return;
            await axios.delete(
              `${API}/projects/${projectId}/sections/M4/tables/information_security_requirements/${id}`
            );
            fetchData();
          }}
          isEditor={isEditor}
          addButtonText="Add Information Security Requirement"
          uniqueKeys={["sl_no"]}
        />
      )
    },
    ...singleEntryItems
  ];

  return (
    <SectionLayout
      title="Project Overview & Requirements"
      sectionId={sectionId}
      sectionLabel={sectionName}
      projectId={projectId}
      items={navigationItems}
    />
  );
};

export default M4ProjectOverview;
