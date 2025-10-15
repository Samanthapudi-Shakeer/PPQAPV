import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SingleEntryEditor from "../SingleEntryEditor";
import SectionLayout from "../SectionLayout";
import { useGenericTables } from "../../hooks/useGenericTables";
import { useSingleEntries } from "../../hooks/useSingleEntries";
import { SECTION_CONFIG } from "../../sectionConfig";

const M5Resources = ({ projectId, isEditor, sectionId, onSingleEntryDirtyChange }) => {
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
    saveEntry: saveSingleEntry,
    dirtyFields: singleEntryDirty,
    hasUnsavedChanges: singleEntryHasUnsaved
  } = useSingleEntries(projectId, sectionConfig.singleEntries || []);

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

  const handleSingleEntrySave = async (field) => {
    try {
      await saveSingleEntry(field);
      alert("Saved successfully!");
    } catch (error) {
      console.error("Failed to save entry", error);
      alert("Failed to save");
    }
  };

  const singleEntryItems = (sectionConfig.singleEntries || []).map((entry) => ({
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

  const stakeholderItem = {
    id: "table-stakeholders",
    label: "Stakeholders",
    type: "Table",
    render: () => (
      loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={stakeholders}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isEditor={isEditor}
          addButtonText="Add Stakeholder"
        />
      )
    )
  };

  const tableItems = (sectionConfig.tables || []).map((table) => ({
    id: `table-${table.key}`,
    label: table.title || table.name || table.key,
    type: "Table",
    render: () => (
      tablesLoading ? (
        <div className="loading">Loading tables...</div>
      ) : (
        <div className="card" style={{ padding: "1.5rem" }}>
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
            {isEditor && (tableData[table.key] || []).length === 0 && table.prefillRows && (
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
            data={tableData[table.key] || []}
            onAdd={(payload) => handleAddTableRow(table.key, payload)}
            onEdit={(rowId, payload) => handleEditTableRow(table.key, rowId, payload)}
            onDelete={(rowId) => handleDeleteTableRow(table.key, rowId)}
            isEditor={isEditor}
            addButtonText={table.addButtonText || "Add Record"}
          />
        </div>
      )
    )
  }));

  const navigationItems = [stakeholderItem, ...tableItems, ...singleEntryItems];

  return <SectionLayout title="Resources Plan & Estimation" items={navigationItems} />;
};

export default M5Resources;
