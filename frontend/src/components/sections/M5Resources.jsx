import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SingleEntryEditor from "../SingleEntryEditor";
import { useGenericTables } from "../../hooks/useGenericTables";
import { useSingleEntries } from "../../hooks/useSingleEntries";
import { SECTION_CONFIG } from "../../sectionConfig";

const M5Resources = ({ projectId, isEditor }) => {
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionConfig = SECTION_CONFIG.M5 || { tables: [], singleEntries: [] };
  const {
    data: tableData,
    loading: tablesLoading,
    createRow,
    updateRow,
    deleteRow,
    refresh
  } = useGenericTables(projectId, "M5", sectionConfig.tables || []);
  const {
    values: singleEntryValues,
    loading: singleEntryLoading,
    updateContent: updateSingleEntryContent,
    updateImage: updateSingleEntryImage,
    saveEntry: saveSingleEntry
  } = useSingleEntries(projectId, sectionConfig.singleEntries || []);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/stakeholders`);
      setStakeholders(response.data);
    } catch (err) {
      console.error("Failed to fetch stakeholders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/stakeholders`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add stakeholder");
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/stakeholders/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update stakeholder");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/stakeholders/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete stakeholder");
    }
  };

  const columns = [
    { key: "sl_no", label: "Sl. No" },
    { key: "name", label: "Name" },
    { key: "stakeholder_type", label: "Type" },
    { key: "role", label: "Role" },
    { key: "authority_responsibility", label: "Authority/Responsibility" },
    { key: "contact_details", label: "Contact Details" }
  ];

  const handleAddTableRow = async (tableKey, newData) => {
    try {
      await createRow(tableKey, newData);
    } catch (error) {
      console.error("Failed to add row", error);
      alert("Failed to add row");
    }
  };

  const handleEditTableRow = async (tableKey, rowId, updatedData) => {
    const { id: _id, ...payload } = updatedData;
    try {
      await updateRow(tableKey, rowId, payload);
    } catch (error) {
      console.error("Failed to update row", error);
      alert("Failed to update row");
    }
  };

  const handleDeleteTableRow = async (tableKey, rowId) => {
    if (!window.confirm("Delete this row?")) return;
    try {
      await deleteRow(tableKey, rowId);
    } catch (error) {
      console.error("Failed to delete row", error);
      alert("Failed to delete row");
    }
  };

  const handlePrefillTable = async (table) => {
    if (!table.prefillRows || !table.prefillRows.length) return;
    const apiName = table.apiName || table.key;
    try {
      for (const row of table.prefillRows) {
        await axios.post(
          `${API}/projects/${projectId}/sections/M5/tables/${apiName}`,
          { data: row }
        );
      }
      await refresh();
    } catch (error) {
      console.error("Failed to prefill rows", error);
      alert("Failed to populate defaults");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
        Resources Plan & Estimation
      </h2>

   

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>
          Stakeholders
        </h3>
        <DataTable
          columns={columns}
          data={stakeholders}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isEditor={isEditor}
          addButtonText="Add Stakeholder"
        />
      </div>

      {sectionConfig.singleEntries?.length ? (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "1rem" }}>
            Resource Planning Narratives
          </h3>
          <SingleEntryEditor
            definitions={sectionConfig.singleEntries}
            values={singleEntryValues}
            loading={singleEntryLoading}
            isEditor={isEditor}
            onContentChange={updateSingleEntryContent}
            onImageChange={updateSingleEntryImage}
            onSave={async (field) => {
              try {
                await saveSingleEntry(field);
                alert("Saved successfully!");
              } catch (error) {
                console.error("Failed to save entry", error);
                alert("Failed to save");
              }
            }}
          />
        </div>
      ) : null}

      {sectionConfig.tables?.length ? (
        <div style={{ display: "grid", gap: "2rem", marginTop: "2rem" }}>
          {tablesLoading ? (
            <div className="loading">Loading tables...</div>
          ) : (
            sectionConfig.tables.map((table) => {
              const rows = tableData[table.key] || [];
              return (
                <div key={table.key} className="card" style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                      gap: "1rem",
                      flexWrap: "wrap"
                    }}
                  >
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                      {table.title || table.name || table.key}
                    </h3>
                    {isEditor && rows.length === 0 && table.prefillRows && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handlePrefillTable(table)}
                      >
                        Populate Defaults
                      </button>
                    )}
                  </div>

                  <DataTable
                    columns={table.columns}
                    data={rows}
                    onAdd={(payload) => handleAddTableRow(table.key, payload)}
                    onEdit={(rowId, payload) => handleEditTableRow(table.key, rowId, payload)}
                    onDelete={(rowId) => handleDeleteTableRow(table.key, rowId)}
                    isEditor={isEditor}
                    addButtonText={table.addButtonText || "Add Record"}
                  />
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
};

export default M5Resources;
