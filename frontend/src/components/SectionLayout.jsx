import React, { useMemo, useState, useEffect } from "react";
import { ArrowRightFromLine, ArrowLeftFromLine } from 'lucide-react';

const SectionLayout = ({
  title,
  items = [],
  defaultItemId
}) => {
  const validItems = useMemo(
    () => items.filter((item) => item && item.id && typeof item.render === "function"),
    [items]
  );
  const computedDefaultId = useMemo(() => {
    if (defaultItemId && validItems.some((item) => item.id === defaultItemId)) {
      return defaultItemId;
    }
    return validItems[0]?.id || null;
  }, [defaultItemId, validItems]);

  const [activeId, setActiveId] = useState(computedDefaultId);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveId((current) => {
      if (current && validItems.some((item) => item.id === current)) {
        return current;
      }
      return computedDefaultId;
    });
  }, [computedDefaultId, validItems]);

  const activeItem = useMemo(
    () => validItems.find((item) => item.id === activeId) || null,
    [activeId, validItems]
  );

  const handleSelect = (itemId) => {
    setActiveId(itemId);
    setSidebarOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="section-shell">
      <div className="section-shell__header">
        <button
          type="button"
          className="btn btn-outline btn-sm section-shell__nav-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
        >
       {isSidebarOpen ? <ArrowLeftFromLine /> : <ArrowRightFromLine />}
        </button>
        {title ? <h2 className="section-shell__title">{title}</h2> : null}
      </div>
      <div className={`section-shell__body${isSidebarOpen ? " sidebar-open" : ""}`}>
        <aside className={`section-shell__sidebar${isSidebarOpen ? " is-open" : ""}`}>
          <div className="section-shell__sidebar-header">
            <span className="section-shell__sidebar-title">Navigate Section</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>
          <nav className="section-shell__sidebar-nav">
            <ul>
              {validItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`section-shell__sidebar-link${
                      item.id === activeId ? " is-active" : ""
                    }`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <span className="section-shell__sidebar-link-label">{item.label}</span>
                    {item.type ? (
                      <span className="section-shell__sidebar-link-tag">{item.type}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="section-shell__overlay"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <div className="section-shell__content">
          {activeItem ? activeItem.render() : (
            <div className="section-shell__empty">No content available for this section.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionLayout;
