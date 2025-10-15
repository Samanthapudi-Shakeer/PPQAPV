import React, { useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SingleEntryEditor from "../SingleEntryEditor";
import { useGenericTables } from "../../hooks/useGenericTables";
import { useSingleEntries } from "../../hooks/useSingleEntries";
import { SECTION_CONFIG } from "../../sectionConfig";

const SECTION_ID = "M6";

const M6MonitoringControl = ({
  projectId,
  isEditor,
  sectionId,
  onSingleEntryDirtyChange
}) => {
  const config = SECTION_CONFIG[SECTION_ID] || { tables: [], singleEntries: [] };
  const {
    data: tableData,
    loading: tablesLoading,
    createRow,
    updateRow,
    deleteRow,
    refresh
  } = useGenericTables(projectId, SECTION_ID, config.tables || []);
  const {
    values: singleEntryValues,
    loading: singleEntryLoading,
    updateContent,
    updateImage,
    saveEntry,
    dirtyFields: singleEntryDirty,
    hasUnsavedChanges: singleEntryHasUnsaved
  } = useSingleEntries(projectId, config.singleEntries || []);

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

  const handleAddRow = async (tableKey, payload) => {
    try {
      await createRow(tableKey, payload);
    } catch (error) {
      console.error("Failed to add row", error);
      alert("Failed to add row");
    }
  };

  const handleEditRow = async (tableKey, rowId, payload) => {
    const { id: _id, ...data } = payload;
    try {
      await updateRow(tableKey, rowId, data);
    } catch (error) {
      console.error("Failed to update row", error);
      alert("Failed to update row");
    }
  };

  const handleDeleteRow = async (tableKey, rowId) => {
    if (!window.confirm("Delete this row?")) return;
    try {
      await deleteRow(tableKey, rowId);
    } catch (error) {
      console.error("Failed to delete row", error);
      alert("Failed to delete row");
    }
  };

  const handlePrefillRows = async (table) => {
    if (!table.prefillRows || !table.prefillRows.length) return;
    const apiName = table.apiName || table.key;
    try {
      for (const row of table.prefillRows) {
        await axios.post(
          `${API}/projects/${projectId}/sections/${SECTION_ID}/tables/${apiName}`,
          { data: row }
        );
      }
      await refresh();
    } catch (error) {
      console.error("Failed to populate defaults", error);
      alert("Failed to populate defaults");
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
        M6 - Monitoring & Control
      </h2>

      {config.singleEntries?.length ? (
        <div style={{ marginBottom: "2rem" }}>
          <SingleEntryEditor
            definitions={config.singleEntries}
            values={singleEntryValues}
            loading={singleEntryLoading}
            isEditor={isEditor}
            onContentChange={updateContent}
            onImageChange={updateImage}
            onSave={async (field) => {
              try {
                await saveEntry(field);
                alert("Saved successfully!");
              } catch (error) {
                console.error("Failed to save entry", error);
                alert("Failed to save");
              }
            }}
            dirtyFields={singleEntryDirty}
          />
        </div>
      ) : null}

      {config.tables?.length ? (
        tablesLoading ? (
          <div className="loading">Loading tables...</div>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            {config.tables.map((table) => {
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
                        onClick={() => handlePrefillRows(table)}
                      >
                        Populate Defaults
                      </button>
                    )}
                  </div>

                  <DataTable
                    columns={table.columns}
                    data={rows}
                    onAdd={(newRow) => handleAddRow(table.key, newRow)}
                    onEdit={(rowId, updated) => handleEditRow(table.key, rowId, updated)}
                    onDelete={(rowId) => handleDeleteRow(table.key, rowId)}
                    isEditor={isEditor}
                    addButtonText={table.addButtonText || "Add Record"}
                  />
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="info-message">No tables configured for this section.</div>
      )}
    </div>
  );
};

export default M6MonitoringControl;
