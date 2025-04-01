import React, { createContext, useContext } from "react";

interface ConfigContextType {
  systemKey: string;
  userToken: string;
  platformURL: string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({
  children,
  systemKey,
  userToken,
  platformURL,
}: ConfigContextType & { children: React.ReactNode }) {
  return (
    <ConfigContext.Provider value={{ systemKey, userToken, platformURL }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
