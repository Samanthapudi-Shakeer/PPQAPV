import React from "react";

const SingleEntryEditor = ({
  definitions = [],
  values = {},
  loading = false,
  isEditor = false,
  onContentChange,
  onImageChange,
  onSave
}) => {
  if (!definitions.length) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {definitions.map((entry) => {
        const value = values[entry.field] || { content: "", image_data: null };
        const rawContent = value.content ?? "";
        const contentText =
          typeof rawContent === "string" ? rawContent : String(rawContent ?? "");
        const hasContent =
          typeof rawContent === "string"
            ? rawContent.trim().length > 0
            : rawContent !== null && rawContent !== undefined;

        if (!isEditor) {
          return (
            <div className="single-entry-viewer" key={entry.field}>
              <h3 className="single-entry-viewer-heading">{entry.label}</h3>
              <p className={`single-entry-viewer-content${hasContent ? "" : " is-empty"}`}>
                {hasContent
                  ? contentText
                  : `No ${entry.label.toLowerCase()} provided yet.`}
              </p>
              {value.image_data ? (
                <img
                  className="single-entry-viewer-image"
                  src={value.image_data}
                  alt={`${entry.label} visual`}
                />
              ) : null}
            </div>
          );
        }

        return (
          <div className="card" key={entry.field} style={{ background: "#f7fafc", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.75rem" }}>
              {entry.label}
            </h3>
            {entry.description && (
              <p style={{ color: "#718096", marginBottom: "0.75rem" }}>{entry.description}</p>
            )}
            <textarea
              className="input"
              rows={entry.rows || 4}
              value={contentText}
              onChange={(event) => onContentChange?.(entry.field, event.target.value)}
              readOnly={!isEditor}
              disabled={loading}
              placeholder={`Enter ${entry.label.toLowerCase()}...`}
              style={{ marginBottom: entry.supportsImage ? "1rem" : "0" }}
            />
            {entry.supportsImage && (
              <div style={{ marginBottom: "1rem" }}>
                <label className="label" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Attach Diagram / Image
                </label>
                {isEditor ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] || null;
                      await onImageChange?.(entry.field, file);
                    }}
                    disabled={!isEditor || loading}
                  />
                ) : null}
                {value.image_data && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      src={value.image_data}
                      alt={`${entry.label} visual`}
                      style={{ maxWidth: "100%", borderRadius: "0.5rem" }}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: "0.75rem" }}
                      onClick={() => onImageChange?.(entry.field, null)}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onSave?.(entry.field)}
              disabled={loading}
            >
              Save
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SingleEntryEditor;
