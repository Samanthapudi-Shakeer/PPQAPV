import React, { useContext, useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Check, Pencil, PlusCircle, Trash2, XCircle } from "lucide-react";
import { useGlobalSearch } from "../context/GlobalSearchContext";
import ColumnVisibilityMenu from "./ColumnVisibilityMenu";
import { SectionItemContext } from "./SectionLayout";
import { buildTableSearchItems } from "../utils/searchRegistry";

const DATE_LABEL_REGEX = /\bdate\b/i;

const normalizeDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
};

const formatDateForDisplay = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
};

const isDateColumn = (column) => {
  if (!column) return false;

  if (column.inputType) {
    return column.inputType === "date";
  }

  if (column.type) {
    return column.type === "date";
  }

  return DATE_LABEL_REGEX.test(column.label || "");
};

const DataTable = ({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  isEditor,
  addButtonText = "Add Row",
  uniqueKeys = [],
  preventDuplicateRows = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.reduce((acc, column) => {
      acc[column.key] = true;
      return acc;
    }, {})
  );
  const { searchTerm, registerSource, navigateToSection } = useGlobalSearch();
  const sectionContext = useContext(SectionItemContext);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const anchorPrefix = useMemo(() => {
    if (!sectionContext?.projectId || !sectionContext?.sectionId || !sectionContext?.itemId) {
      return null;
    }

    return `search-${sectionContext.projectId}-${sectionContext.sectionId}-${sectionContext.itemId}`;
  }, [sectionContext?.projectId, sectionContext?.sectionId, sectionContext?.itemId]);

  const columnLookup = useMemo(
    () =>
      columns.reduce((acc, column) => {
        acc[column.key] = column;
        return acc;
      }, {}),
    [columns]
  );

  const normalizeValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value.trim().toLowerCase();
    }

    return String(value).trim().toLowerCase();
  };

  const resolveRowId = (row) => {
    if (!row) return null;
    if (row.id !== undefined && row.id !== null) return String(row.id);
    if (row._id !== undefined && row._id !== null) return String(row._id);
    if (row.key !== undefined && row.key !== null) return String(row.key);
    return null;
  };

  const ensureNoDuplicates = (payload, ignoreRowId = null) => {
    const normalizedIgnoreId = ignoreRowId !== null && ignoreRowId !== undefined ? String(ignoreRowId) : null;

    if (Array.isArray(uniqueKeys) && uniqueKeys.length > 0) {
      const duplicateExists = data.some((row) => {
        const rowId = resolveRowId(row);
        if (normalizedIgnoreId !== null && rowId === normalizedIgnoreId) {
          return false;
        }

        return uniqueKeys.every((key) => normalizeValue(row[key]) === normalizeValue(payload[key]));
      });

      if (duplicateExists) {
        const labels = uniqueKeys.map((key) => columnLookup[key]?.label || key);
        const fieldLabel = labels.join(labels.length > 1 ? ", " : "");
        const message = labels.length > 1
          ? `Combination of ${fieldLabel} must be unique. Please update the values before saving.`
          : `${fieldLabel} must be unique. Please provide a different value before saving.`;
        alert(message);
        return false;
      }
    }

    if (preventDuplicateRows) {
      const duplicateRow = data.some((row) => {
        const rowId = resolveRowId(row);
        if (normalizedIgnoreId !== null && rowId === normalizedIgnoreId) {
          return false;
        }

        return columns.every((column) => normalizeValue(row[column.key]) === normalizeValue(payload[column.key]));
      });

      if (duplicateRow) {
        alert("Duplicate row detected. Please adjust the values before saving.");
        return false;
      }
    }

    return true;
  };

  const dateColumnKeys = useMemo(
    () => columns.filter((column) => isDateColumn(column)).map((column) => column.key),
    [columns]
  );

  useEffect(() => {
    setVisibleColumns((current) => {
      const nextState = {};

      columns.forEach((column) => {
        nextState[column.key] = current[column.key] !== false;
      });

      return nextState;
    });
  }, [columns]);

  const handleSort = (columnKey) => {
    setSortConfig((current) => {
      if (current.key === columnKey) {
        return {
          key: columnKey,
          direction: current.direction === "asc" ? "desc" : "asc"
        };
      }

      return { key: columnKey, direction: "asc" };
    });
  };

  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((row) => {
      if (!normalizedSearch) return true;

      return columns.some((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) {
          return false;
        }

        const searchValue = isDateColumn(col) ? formatDateForDisplay(value) : String(value);

        return searchValue.toLowerCase().includes(normalizedSearch);
      });
    });

    if (!sortConfig.key) {
      return filtered;
    }

    const { key, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const column = columnLookup[key];
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === null || aValue === undefined) return 1 * multiplier;
      if (bValue === null || bValue === undefined) return -1 * multiplier;

      if (isDateColumn(column)) {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();

        if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
          if (aDate < bDate) return -1 * multiplier;
          if (aDate > bDate) return 1 * multiplier;
          return 0;
        }
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * multiplier;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return -1 * multiplier;
      if (aString > bString) return 1 * multiplier;
      return 0;
    });
  }, [columns, data, normalizedSearch, sortConfig]);

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((current) => {
      const visibleCount = columns.reduce((total, column) => {
        return total + (current[column.key] !== false ? 1 : 0);
      }, 0);

      const isVisible = current[columnKey] !== false;

      if (isVisible && visibleCount === 1) {
        return current;
      }

      return { ...current, [columnKey]: isVisible ? false : true };
    });
  };

  const showAllColumns = () => {
    setVisibleColumns(
      columns.reduce((acc, column) => {
        acc[column.key] = true;
        return acc;
      }, {})
    );
  };

  const displayedColumns = columns.filter((column) => visibleColumns[column.key] !== false);

  const handleEdit = (row) => {
    const normalizedRow = { ...row };
    dateColumnKeys.forEach((key) => {
      normalizedRow[key] = normalizeDateInput(row[key]);
    });

    setEditingId(row.id);
    setEditData(normalizedRow);
  };

  const handleSave = () => {
    const payload = { ...editData };
    dateColumnKeys.forEach((key) => {
      payload[key] = normalizeDateInput(payload[key]);
    });

    if (!ensureNoDuplicates(payload, editingId)) {
      return;
    }

    onEdit(editingId, payload);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    const payload = { ...newRowData };
    dateColumnKeys.forEach((key) => {
      payload[key] = normalizeDateInput(payload[key]);
    });

    if (!ensureNoDuplicates(payload)) {
      return;
    }

    onAdd(payload);
    setNewRowData({});
    setShowAddModal(false);
  };

  useEffect(() => {
    if (!registerSource || !sectionContext?.projectId || !sectionContext?.sectionId || !sectionContext?.itemId) {
      return undefined;
    }

    const sourceId = `${sectionContext.projectId}-${sectionContext.sectionId}-${sectionContext.itemId}`;

    const unregister = registerSource({
      id: sourceId,
      getItems: () =>
        buildTableSearchItems({
          projectId: sectionContext.projectId,
          sectionId: sectionContext.sectionId,
          sectionLabel: sectionContext.sectionLabel,
          tableId: sectionContext.itemId,
          tableLabel: sectionContext.itemLabel,
          rows: data,
          columns,
          navigateToSection,
          anchorPrefix
        })
    });

    return unregister;
  }, [
    registerSource,
    sectionContext?.projectId,
    sectionContext?.sectionId,
    sectionContext?.itemId,
    sectionContext?.itemLabel,
    sectionContext?.sectionLabel,
    data,
    columns,
    navigateToSection,
    anchorPrefix
  ]);

  return (
    <div>
      <div
        className="table-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <div className="table-search-message">
          {normalizedSearch ? (
            <span>
              Showing results for <strong>"{searchTerm}"</strong>
            </span>
          ) : (
            <span className="muted-text">Use the global search above to refine this table.</span>
          )}
        </div>
        <div className="table-actions">
          <ColumnVisibilityMenu
            columns={columns}
            visibleMap={visibleColumns}
            onToggle={toggleColumnVisibility}
            onShowAll={showAllColumns}
          />
          {isEditor && (
            <button
              className="btn btn-primary btn-icon"
              onClick={() => setShowAddModal(true)}
              data-testid="add-row-btn"
              aria-label={addButtonText}
            >
              <PlusCircle size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {displayedColumns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const SortIcon = !isSorted
                  ? ArrowUpDown
                  : sortConfig.direction === "asc"
                  ? ArrowUpAZ
                  : ArrowDownAZ;

                return (
                  <th key={col.key}>
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => handleSort(col.key)}
                      aria-label={`Sort by ${col.label}`}
                    >
                      <span>{col.label}</span>
                      <SortIcon aria-hidden="true" size={16} />
                    </button>
                  </th>
                );
              })}
              {isEditor && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={displayedColumns.length + (isEditor ? 1 : 0)}
                  style={{ textAlign: "center", padding: "2rem", color: "#4a5568" }}
                >
                  {normalizedSearch
                    ? "No rows match the current search."
                    : (
                        <>
                          No data available.
                          {isEditor && " Click 'Add Row' to get started."}
                        </>
                      )}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row, index) => {
                const rowKey = row.id ?? row._id ?? `index-${index}`;
                return (
                  <tr
                    key={rowKey}
                    id={anchorPrefix ? `${anchorPrefix}-row-${rowKey}` : undefined}
                    data-search-table={sectionContext?.itemId || undefined}
                    data-search-row={rowKey}
                  >
                    {displayedColumns.map((col) => (
                      <td key={col.key} data-label={col.label}>
                        {editingId === row.id ? (
                          <input
                            type={isDateColumn(col) ? "date" : "text"}
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData[col.key] ?? ""}
                          onChange={(e) =>
                            setEditData({ ...editData, [col.key]: e.target.value })
                          }
                        />
                      ) : (
                        (() => {
                          const value = row[col.key];

                          if (value === null || value === undefined || value === "") {
                            return "-";
                          }

                          if (isDateColumn(col)) {
                            const formatted = formatDateForDisplay(value);
                            return formatted || "-";
                          }

                          return value;
                        })()
                      )}
                    </td>
                  ))}
                  {isEditor && (
                    <td>
                      {editingId === row.id ? (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-success btn-icon"
                            onClick={handleSave}
                            data-testid={`save-${row.id}`}
                            aria-label="Save row"
                          >
                            <Check size={18} aria-hidden="true" />
                          </button>
                          <button
                            className="btn btn-outline btn-icon"
                            onClick={handleCancel}
                            aria-label="Cancel editing"
                          >
                            <XCircle size={18} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-outline btn-icon"
                            onClick={() => handleEdit(row)}
                            data-testid={`edit-${row.id}`}
                            aria-label="Edit row"
                          >
                            <Pencil size={18} aria-hidden="true" />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => onDelete(row.id)}
                            data-testid={`delete-${row.id}`}
                            aria-label="Delete row"
                          >
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{addButtonText}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)} aria-label="Close">
                <XCircle size={18} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              {columns.map((col) => (
                <div className="form-group" key={col.key}>
                  <label className="label">{col.label}</label>
                  <input
                    type={isDateColumn(col) ? "date" : "text"}
                    className="input"
                    value={newRowData[col.key] ?? ""}
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, [col.key]: e.target.value })
                    }
                    placeholder={`Enter ${col.label.toLowerCase()}`}
                    data-testid={`new-${col.key}`}
                  />
                </div>
              ))}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-icon"
                  style={{ flex: 1 }}
                  data-testid="submit-new-row"
                  aria-label="Create row"
                >
                  <PlusCircle size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-icon"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRowData({});
                  }}
                  style={{ flex: 1 }}
                  aria-label="Cancel"
                >
                  <XCircle size={18} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
