import React from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import { useGenericTables } from "../../hooks/useGenericTables";
import { SECTION_CONFIG } from "../../sectionConfig";

const SECTION_ID = "M9";

const M9RiskManagement = ({ projectId, isEditor }) => {
  const config = SECTION_CONFIG[SECTION_ID] || { tables: [] };
  const { data: tableData, loading, createRow, updateRow, deleteRow, refresh } =
    useGenericTables(projectId, SECTION_ID, config.tables || []);

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
        M9 - Risk Management
      </h2>

      {config.tables?.length ? (
        loading ? (
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

export default M9RiskManagement;
