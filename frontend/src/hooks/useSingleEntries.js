import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API } from "../App";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const useSingleEntries = (projectId, definitions = []) => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!projectId || !definitions.length) {
        setValues({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const responses = await Promise.all(
          definitions.map((definition) =>
            axios.get(`${API}/projects/${projectId}/single-entry/${definition.field}`)
          )
        );

        const nextValues = {};
        definitions.forEach((definition, index) => {
          const payload = responses[index].data || {};
          nextValues[definition.field] = {
            content: payload.content || "",
            image_data: payload.image_data || null
          };
        });

        setValues(nextValues);
      } catch (error) {
        console.error("Failed to fetch single entry fields", error);
        setValues({});
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [projectId, definitions]);

  const updateContent = useCallback((field, content) => {
    setValues((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { image_data: null }), content }
    }));
  }, []);

  const updateImage = useCallback(async (field, file) => {
    if (!file) {
      setValues((prev) => ({
        ...prev,
        [field]: { ...(prev[field] || { content: "" }), image_data: null }
      }));
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setValues((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || { content: "" }), image_data: dataUrl }
    }));
  }, []);

  const saveEntry = useCallback(
    async (field) => {
      const payload = values[field] || { content: "", image_data: null };
      await axios.post(`${API}/projects/${projectId}/single-entry`, {
        field_name: field,
        content: payload.content,
        image_data: payload.image_data
      });
    },
    [projectId, values]
  );

  return {
    values,
    loading,
    updateContent,
    updateImage,
    saveEntry
  };
};
