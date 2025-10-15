import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import { useGenericTables } from "../../hooks/useGenericTables";
import { SECTION_CONFIG } from "../../sectionConfig";

const SECTION_ID = "M10";

const M10OpportunityManagement = ({ projectId, isEditor }) => {
  const config = SECTION_CONFIG[SECTION_ID] || { tables: [] };
  const tables = useMemo(() => config.tables || [], [config.tables]);
  const [activeTableKey, setActiveTableKey] = useState(() =>
    tables.length ? tables[0].key : null
  );
  const { data: tableData, loading, createRow, updateRow, deleteRow, refresh } =
    useGenericTables(projectId, SECTION_ID, config.tables || []);

  useEffect(() => {
    if (!tables.length) {
      if (activeTableKey !== null) {
        setActiveTableKey(null);
      }
      return;
    }
    const hasActive = tables.some((table) => table.key === activeTableKey);
    if (!hasActive) {
      setActiveTableKey(tables[0].key);
    }
  }, [tables, activeTableKey]);

  const activeTable = tables.find((table) => table.key === activeTableKey) || null;
  const activeRows = activeTable ? tableData[activeTable.key] || [] : [];

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
        M10 - Opportunity Management
      </h2>

      {config.tables?.length ? (
        loading ? (
          <div className="loading">Loading tables...</div>
        ) : (
          <div className="section-tab-wrapper">
            <div
              className="section-tab-strip"
              role="tablist"
              aria-label="Opportunity management tables"
            >
              {tables.map((table) => (
                <button
                  key={table.key}
                  type="button"
                  role="tab"
                  className={`tab-button ${activeTableKey === table.key ? "active" : ""}`}
                  aria-selected={activeTableKey === table.key}
                  onClick={() => setActiveTableKey(table.key)}
                >
                  {table.title || table.name || table.key}
                </button>
              ))}
            </div>

            {activeTable && (
              <div className="section-tab-panel" role="tabpanel">
                <div className="section-tab-panel-header">
                  <h3 className="section-tab-panel-title">
                    {activeTable.title || activeTable.name || activeTable.key}
                  </h3>
                  {isEditor && activeRows.length === 0 && activeTable.prefillRows && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePrefillRows(activeTable)}
                    >
                      Populate Defaults
                    </button>
                  )}
                </div>

                <DataTable
                  columns={activeTable.columns}
                  data={activeRows}
                  onAdd={(newRow) => handleAddRow(activeTable.key, newRow)}
                  onEdit={(rowId, updated) => handleEditRow(activeTable.key, rowId, updated)}
                  onDelete={(rowId) => handleDeleteRow(activeTable.key, rowId)}
                  isEditor={isEditor}
                  addButtonText={activeTable.addButtonText || "Add Record"}
                />
              </div>
            )}
          </div>
        )
      ) : (
        <div className="info-message">No tables configured for this section.</div>
      )}
    </div>
  );
};

export default M10OpportunityManagement;
