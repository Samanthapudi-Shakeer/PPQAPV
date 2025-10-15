import React, { createContext, useContext, useMemo, useState } from "react";

const GlobalSearchContext = createContext(undefined);

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const value = useMemo(
    () => ({
      searchTerm,
      setSearchTerm
    }),
    [searchTerm]
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
};

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearch must be used within a SearchProvider");
  }
  return context;
};
