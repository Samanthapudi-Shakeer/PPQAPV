import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../App";
import DataTable from "../DataTable";
import { CaseUpperIcon, Cross, EyeClosedIcon, InfoIcon, Rocket, Sparkle, UndoDot, View, Watch } from "lucide-react";
import { Close } from "@radix-ui/react-dialog";

const M1RevisionHistory = ({ projectId, isEditor }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/revision-history`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch revision history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newData) => {
    try {
      await axios.post(`${API}/projects/${projectId}/revision-history`, newData);
      fetchData();
    } catch (err) {
      alert("Failed to add row");
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const { id: _, project_id, ...dataToSend } = updatedData;
      await axios.put(`${API}/projects/${projectId}/revision-history/${id}`, dataToSend);
      fetchData();
    } catch (err) {
      alert("Failed to update row");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/revision-history/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete row");
    }
  };

  const columns = [
    { key: "revision_no", label: "Revision No" },
    { key: "change_description", label: "Change Description" },
    { key: "reviewed_by", label: "Reviewed By" },
    { key: "approved_by", label: "Approved By" },
    { key: "date", label: "Date" },
    { key: "remarks", label: "Remarks" }
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>
        Document History
      </h2>
       <button  onClick={() => setShowInfo(!showInfo)} className="mb-4 px-3 py-1 bg-blue-500 font  rounded hover:bg-blue-600">
        
        {showInfo ? <UndoDot></UndoDot> : <InfoIcon></InfoIcon> }
      </button>
      {showInfo && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
Table About Document History of the Project        
</div>
      )}
      <DataTable
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isEditor={isEditor}
        addButtonText="Add Revision"
      />
    </div>
  );
};

export default M1RevisionHistory;
