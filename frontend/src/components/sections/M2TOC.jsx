import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import SectionLayout from "../SectionLayout";

const M2TOC = ({ projectId, isEditor }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/toc-entries`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch TOC entries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/toc-entries`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add entry");
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/toc-entries/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/toc-entries/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  const columns = [
    { key: "sheet_name", label: "Sheet Name" },
    { key: "sections_in_sheet", label: "Sections in Sheet" }
  ];

  const navigationItems = [
    {
      id: "table-toc",
      label: "Table of Contents",
      type: "Table",
      render: () => (
        loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <p className="muted-text" style={{ marginBottom: "1.5rem" }}>
              Maintain an up-to-date outline of every sheet and section in this project plan.
            </p>
            <DataTable
              columns={columns}
              data={data}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isEditor={isEditor}
              addButtonText="Add TOC Entry"
            />
          </>
        )
      )
    }
  ];

  return <SectionLayout title="Table of Contents" items={navigationItems} />;
};

export default M2TOC;
