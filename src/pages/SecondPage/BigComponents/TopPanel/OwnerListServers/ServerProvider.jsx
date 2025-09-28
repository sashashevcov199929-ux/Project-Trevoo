import { createContext, useState, useContext } from "react";

const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const [servers, setServers] = useState([]);

  const addServer = (server) => {
    setServers((prev) => [...prev, server]);
    console.log("Название сервера", servers);
  };
  const value = {
    addServer,
    servers,
  };
  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
};

// Хук для удобного использования
export const useServer = () => useContext(ServerContext);
