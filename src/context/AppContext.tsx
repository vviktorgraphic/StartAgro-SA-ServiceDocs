import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
    documentsFolder: string;
    setDocumentsFolder: (folder: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {

    const [documentsFolder, setDocumentsFolder] = useState("");

    return (
        <AppContext.Provider
            value={{
                documentsFolder,
                setDocumentsFolder
            }}
        >
            {children}
        </AppContext.Provider>
    );

}

export function useAppContext() {

    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppContext must be used inside AppProvider");
    }

    return context;

}