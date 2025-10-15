import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import SectionLayout from "../SectionLayout";
import { API } from "../../App";

const M12Deliverables = ({ projectId, isEditor }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [milestoneColumns, setMilestoneColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newDeliverable, setNewDeliverable] = useState({
    sl_no: "",
    work_product: "",
    owner_of_deliverable: "",
    approving_authority: "",
    release_to_customer: "",
    milestones: {}
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const defaultWorkProducts = [
    "Statement of Work",
    "Project Plan",
    "Estimation",
    "Requirements document",
    "Design document",
    "Coding Guidelines",
    "Source Code",
    "Executables",
    "Release Notes",
    "Test Design and Report",
    "Review Form and Report",
    "User Manual",
    "Installation Manual",
    "Project Metrics Report",
    "Casual Analysis and Resolution"
  ];

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [delivsRes, colsRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}/deliverables`),
        axios.get(`${API}/projects/${projectId}/milestone-columns`)
      ]);

      setDeliverables(delivsRes.data);
      setMilestoneColumns(colsRes.data);

      if (colsRes.data.length === 0 && isEditor) {
        await initializeDefaultColumns();
      }
    } catch (err) {
      console.error("Failed to fetch deliverables", err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultColumns = async () => {
    try {
      const defaultColumns = ["Milestone A", "Milestone B", "Milestone C", "Milestone D"];
      for (const col of defaultColumns) {
        await axios.post(`${API}/projects/${projectId}/milestone-columns`, { column_name: col });
      }
      fetchData();
    } catch (err) {
      console.error("Failed to initialize columns", err);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    try {
      await axios.post(`${API}/projects/${projectId}/milestone-columns`, { column_name: newColumnName });
      setNewColumnName("");
      setShowColumnModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to add column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Delete this milestone column? Data in this column will be lost.")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/milestone-columns/${columnId}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete column");
    }
  };

  const handleAddDeliverable = async () => {
    try {
      await axios.post(`${API}/projects/${projectId}/deliverables`, newDeliverable);
      setNewDeliverable({
        sl_no: "",
        work_product: "",
        owner_of_deliverable: "",
        approving_authority: "",
        release_to_customer: "",
        milestones: {}
      });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to add deliverable");
    }
  };

  const handleEditDeliverable = async (id) => {
    try {
      const { id: _, project_id, ...dataToSend } = editData;
      await axios.put(`${API}/projects/${projectId}/deliverables/${id}`, dataToSend);
      setEditingId(null);
      setEditData({});
      fetchData();
    } catch (err) {
      alert("Failed to update deliverable");
    }
  };

  const handleDeleteDeliverable = async (id) => {
    if (!window.confirm("Delete this deliverable?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/deliverables/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete deliverable");
    }
  };

  const handleInitializeDefaults = async () => {
    if (!window.confirm("Add all 15 default work products?")) return;
    try {
      for (let i = 0; i < defaultWorkProducts.length; i++) {
        await axios.post(`${API}/projects/${projectId}/deliverables`, {
          sl_no: String(i + 1),
          work_product: defaultWorkProducts[i],
          owner_of_deliverable: "",
          approving_authority: "",
          release_to_customer: "",
          milestones: {}
        });
      }
      fetchData();
    } catch (err) {
      alert("Failed to initialize defaults");
    }
  };

  const deliverablesItem = {
    id: "table-deliverables",
    label: "Deliverables Schedule",
    type: "Table",
    render: () => (
      loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="info-message" style={{ marginBottom: "1.5rem" }}>
            This table supports dynamic milestone columns. Click "Manage Columns" to add or remove milestones.
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {isEditor && (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddModal(true)}
                  data-testid="add-deliverable-btn"
                >
                  + Add Deliverable
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowColumnModal(true)}
                  data-testid="manage-columns-btn"
                >
                  Manage Columns
                </button>
                {deliverables.length === 0 && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleInitializeDefaults}
                    data-testid="init-defaults-btn"
                  >
                    Initialize 15 Default Items
                  </button>
                )}
              </>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Work Product</th>
                  <th>Owner</th>
                  <th>Approving Authority</th>
                  <th>Release to Customer</th>
                  {milestoneColumns.map((col) => (
                    <th key={col.id}>
                      {col.column_name}
                      {isEditor && (
                        <button
                          onClick={() => handleDeleteColumn(col.id)}
                          style={{
                            marginLeft: "0.5rem",
                            background: "rgba(255,255,255,0.2)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem"
                          }}
                          data-testid={`delete-col-${col.id}`}
                        >
                          ×
                        </button>
                      )}
                    </th>
                  ))}
                  {isEditor && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {deliverables.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5 + milestoneColumns.length + (isEditor ? 1 : 0)}
                      style={{ textAlign: "center", padding: "2rem", color: "#718096" }}
                    >
                      No deliverables yet. {isEditor && "Click 'Add Deliverable' or 'Initialize Defaults' to get started."}
                    </td>
                  </tr>
                ) : (
                  deliverables.map((deliv) => (
                    <tr key={deliv.id}>
                      <td>{editingId === deliv.id ? (
                        <input
                          type="text"
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData.sl_no || ""}
                          onChange={(e) => setEditData({ ...editData, sl_no: e.target.value })}
                        />
                      ) : deliv.sl_no || "-"}</td>
                      <td>{editingId === deliv.id ? (
                        <input
                          type="text"
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData.work_product || ""}
                          onChange={(e) => setEditData({ ...editData, work_product: e.target.value })}
                        />
                      ) : deliv.work_product || "-"}</td>
                      <td>{editingId === deliv.id ? (
                        <input
                          type="text"
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData.owner_of_deliverable || ""}
                          onChange={(e) => setEditData({ ...editData, owner_of_deliverable: e.target.value })}
                        />
                      ) : deliv.owner_of_deliverable || "-"}</td>
                      <td>{editingId === deliv.id ? (
                        <input
                          type="text"
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData.approving_authority || ""}
                          onChange={(e) => setEditData({ ...editData, approving_authority: e.target.value })}
                        />
                      ) : deliv.approving_authority || "-"}</td>
                      <td>{editingId === deliv.id ? (
                        <input
                          type="text"
                          className="input"
                          style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                          value={editData.release_to_customer || ""}
                          onChange={(e) => setEditData({ ...editData, release_to_customer: e.target.value })}
                        />
                      ) : deliv.release_to_customer || "-"}</td>
                      {milestoneColumns.map((col) => (
                        <td key={col.id}>
                          {editingId === deliv.id ? (
                            <input
                              type="text"
                              className="input"
                              style={{ padding: "0.5rem", fontSize: "0.875rem" }}
                              value={editData.milestones?.[col.column_name] || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  milestones: { ...editData.milestones, [col.column_name]: e.target.value }
                                })
                              }
                            />
                          ) : deliv.milestones?.[col.column_name] || "-"}
                        </td>
                      ))}
                      {isEditor && (
                        <td>
                          {editingId === deliv.id ? (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleEditDeliverable(deliv.id)}>
                                Save
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditData({});
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className="btn btn-outline btn-icon"
                                onClick={() => {
                                  setEditingId(deliv.id);
                                  setEditData({ ...deliv });
                                }}
                                aria-label={`Edit deliverable ${deliv.work_product || deliv.sl_no}`}
                              >
                                <Pencil size={16} aria-hidden="true" />
                              </button>
                              <button
                                className="btn btn-danger btn-icon"
                                onClick={() => handleDeleteDeliverable(deliv.id)}
                                aria-label={`Delete deliverable ${deliv.work_product || deliv.sl_no}`}
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Add Deliverable</h2>
                  <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddDeliverable();
                  }}
                >
                  <div className="form-group">
                    <label className="label">Sl. No.</label>
                    <input
                      type="text"
                      className="input"
                      value={newDeliverable.sl_no}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, sl_no: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Work Product</label>
                    <input
                      type="text"
                      className="input"
                      value={newDeliverable.work_product}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, work_product: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Owner of Deliverable</label>
                    <input
                      type="text"
                      className="input"
                      value={newDeliverable.owner_of_deliverable}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, owner_of_deliverable: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Approving Authority</label>
                    <input
                      type="text"
                      className="input"
                      value={newDeliverable.approving_authority}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, approving_authority: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Release to Customer</label>
                    <input
                      type="text"
                      className="input"
                      value={newDeliverable.release_to_customer}
                      onChange={(e) => setNewDeliverable({ ...newDeliverable, release_to_customer: e.target.value })}
                    />
                  </div>
                  {milestoneColumns.map((col) => (
                    <div className="form-group" key={col.id}>
                      <label className="label">{col.column_name}</label>
                      <input
                        type="text"
                        className="input"
                        value={newDeliverable.milestones[col.column_name] || ""}
                        onChange={(e) =>
                          setNewDeliverable({
                            ...newDeliverable,
                            milestones: { ...newDeliverable.milestones, [col.column_name]: e.target.value }
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Add Deliverable
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showColumnModal && (
            <div className="modal-overlay" onClick={() => setShowColumnModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Manage Milestone Columns</h2>
                  <button className="close-btn" onClick={() => setShowColumnModal(false)}>×</button>
                </div>
                <div className="form-group">
                  <label className="label">Column Name</label>
                  <input
                    type="text"
                    className="input"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleAddColumn}>
                    Add Column
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowColumnModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )
    )
  };

  return <SectionLayout title="M12 - List of Deliverables" items={[deliverablesItem]} />;
};

export default M12Deliverables;
