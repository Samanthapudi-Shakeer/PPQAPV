import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";

const M3Definitions = ({ projectId, isEditor }) => {
  const [definitions, setDefinitions] = useState([]);
  const [singleFields, setSingleFields] = useState({
    reference_to_pif: "",
    reference_to_other_documents: "",
    plan_for_other_resources: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [defsResponse, field1, field2, field3] = await Promise.all([
        axios.get(`${API}/projects/${projectId}/definition-acronyms`),
        axios.get(`${API}/projects/${projectId}/single-entry/reference_to_pif`),
        axios.get(`${API}/projects/${projectId}/single-entry/reference_to_other_documents`),
        axios.get(`${API}/projects/${projectId}/single-entry/plan_for_other_resources`)
      ]);

      setDefinitions(defsResponse.data);
      setSingleFields({
        reference_to_pif: field1.data?.content || "",
        reference_to_other_documents: field2.data?.content || "",
        plan_for_other_resources: field3.data?.content || ""
      });
    } catch (err) {
      console.error("Failed to fetch definitions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefinition = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/definition-acronyms`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add definition");
    }
  };

  const handleEditDefinition = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/definition-acronyms/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update definition");
    }
  };

  const handleDeleteDefinition = async (id) => {
    if (!window.confirm("Are you sure you want to delete this definition?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/definition-acronyms/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete definition");
    }
  };

  const handleSaveSingleField = async (fieldName, content) => {
    try {
      await axios.post(`${API}/projects/${projectId}/single-entry`, {
        field_name: fieldName,
        content
      });
      alert("Saved successfully!");
    } catch (err) {
      alert("Failed to save");
    }
  };

  const definitionColumns = [
    { key: "term", label: "Term / Acronym" },
    { key: "definition", label: "Definition" }
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
        Definitions & References
      </h2>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>
          Definitions & Acronyms
        </h3>
        <p className="muted-text" style={{ marginBottom: "1rem" }}>
          Definitions of all terms, acronyms, and abbreviations required to properly interpret this plan.
        </p>
        <DataTable
          columns={definitionColumns}
          data={definitions}
          onAdd={handleAddDefinition}
          onEdit={handleEditDefinition}
          onDelete={handleDeleteDefinition}
          isEditor={isEditor}
          addButtonText="Add Definition"
        />
      </div>

      <div className="card" style={{ background: "#f7fafc", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            Reference to PIF
          </h3>
        </div>
        {isEditor ? (
          <>
            <textarea
              className="input"
              rows="4"
              value={singleFields.reference_to_pif}
              onChange={(e) =>
                setSingleFields({ ...singleFields, reference_to_pif: e.target.value })
              }
              placeholder="Enter reference to PIF..."
              data-testid="reference-to-pif"
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={() =>
                handleSaveSingleField("reference_to_pif", singleFields.reference_to_pif)
              }
              data-testid="save-reference-to-pif"
            >
              Save
            </button>
          </>
        ) : (
          <p
            className={`single-entry-viewer-content${
              singleFields.reference_to_pif?.trim() ? "" : " is-empty"
            }`}
          >
            {singleFields.reference_to_pif?.trim()
              ? singleFields.reference_to_pif
              : "No reference to PIF provided yet."}
          </p>
        )}
      </div>

      <div className="card" style={{ background: "#f7fafc", padding: "1.5rem" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            Reference to Other Resources
          </h3>
        </div>
        <div className="info-card">
          <ol>
            <li>Link/location to MPP or other scheduling and tracking mechanisms</li>
            <li>Link/location for test plans</li>
            <li>Reference of Development Interface Agreement document</li>
          </ol>
        </div>
        {isEditor ? (
          <>
            <textarea
              className="input"
              rows="4"
              value={singleFields.plan_for_other_resources}
              onChange={(e) =>
                setSingleFields({ ...singleFields, plan_for_other_resources: e.target.value })
              }
              placeholder="Enter reference to other resources..."
              data-testid="plan-for-other-resources"
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={() =>
                handleSaveSingleField(
                  "plan_for_other_resources",
                  singleFields.plan_for_other_resources
                )
              }
              data-testid="save-plan-for-other-resources"
            >
              Save
            </button>
          </>
        ) : (
          <p
            className={`single-entry-viewer-content${
              singleFields.plan_for_other_resources?.trim() ? "" : " is-empty"
            }`}
          >
            {singleFields.plan_for_other_resources?.trim()
              ? singleFields.plan_for_other_resources
              : "No reference to other resources provided yet."}
          </p>
        )}
      </div>

      <div className="card" style={{ background: "#f7fafc", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            Reference to Other Documents
          </h3>
        </div>
        <div className="info-card">
          <ul>
            <li>&lt;Link/location to additional roles and responsibilities document&gt;</li>
            <li>&lt;Link/location to process performance model workbook&gt;</li>
            <li>&lt;Link/location to control chart workbook&gt;</li>
          </ul>
        </div>
        {isEditor ? (
          <>
            <textarea
              className="input"
              rows="4"
              value={singleFields.reference_to_other_documents}
              onChange={(e) =>
                setSingleFields({
                  ...singleFields,
                  reference_to_other_documents: e.target.value
                })
              }
              placeholder="Enter reference to other documents..."
              data-testid="reference-to-other-docs"
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={() =>
                handleSaveSingleField(
                  "reference_to_other_documents",
                  singleFields.reference_to_other_documents
                )
              }
              data-testid="save-reference-to-other-docs"
            >
              Save
            </button>
          </>
        ) : (
          <p
            className={`single-entry-viewer-content${
              singleFields.reference_to_other_documents?.trim() ? "" : " is-empty"
            }`}
          >
            {singleFields.reference_to_other_documents?.trim()
              ? singleFields.reference_to_other_documents
              : "No reference to other documents provided yet."}
          </p>
        )}
      </div>

      
    </div>
  );
};

export default M3Definitions;
