// src/contexts/CategoryContext.jsx
import { createContext, useState, useContext } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [category, setCategory] = useState("");

  return (
    <CategoryContext.Provider value={{ category, setCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook for easy access
export const useCategory = () => useContext(CategoryContext);
