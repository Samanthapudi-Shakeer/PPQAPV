import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SectionLayout from "../SectionLayout";
import { useGenericTables } from "../../hooks/useGenericTables";
import { SECTION_CONFIG } from "../../sectionConfig";

const SECTION_ID = "M10";

const M10OpportunityManagement = ({ projectId, isEditor, sectionId, sectionName }) => {
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

  const tableItems = (config.tables || []).map((table) => ({
    id: `table-${table.key}`,
    label: table.title || table.name || table.key,
    type: "Table",
    render: () => (
      loading ? (
        <div className="loading">Loading tables...</div>
      ) : (
        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="section-tab-panel-header" style={{ marginBottom: "1rem" }}>
            <h3 className="section-tab-panel-title">
              {table.title || table.name || table.key}
            </h3>
            {isEditor && (tableData[table.key] || []).length === 0 && table.prefillRows && (
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
            data={tableData[table.key] || []}
            onAdd={(newRow) => handleAddRow(table.key, newRow)}
            onEdit={(rowId, updated) => handleEditRow(table.key, rowId, updated)}
            onDelete={(rowId) => handleDeleteRow(table.key, rowId)}
            isEditor={isEditor}
            addButtonText={table.addButtonText || "Add Record"}
          />
        </div>
      )
    )
  }));

  const navigationItems = [...tableItems];

  if (!navigationItems.length) {
    navigationItems.push({
      id: "info-empty",
      label: "Opportunity Guidance",
      type: "Info",
      render: () => <div className="info-message">No tables configured for this section.</div>
    });
  }

  return (
    <SectionLayout
      title="M10 - Opportunity Management"
      sectionId={sectionId}
      sectionLabel={sectionName}
      projectId={projectId}
      items={navigationItems}
    />
  );
};

export default M10OpportunityManagement;
