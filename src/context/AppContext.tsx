import {
    createContext,
    useContext,
    useState,
    ReactNode
} from "react";

import { DiscoveredWorkOrder } from "../models/DiscoveredWorkOrder";

interface AppContextType {

    documentsFolder: string | null;
    setDocumentsFolder: (folder: string | null) => void;

    workOrders: DiscoveredWorkOrder[];
    setWorkOrders: (
        workOrders: DiscoveredWorkOrder[]
    ) => void;

    selectedWorkOrder: DiscoveredWorkOrder | null;
    setSelectedWorkOrder: (
        workOrder: DiscoveredWorkOrder | null
    ) => void;

}

const AppContext =
    createContext<AppContextType | undefined>(undefined);

export function AppProvider({
    children
}: {
    children: ReactNode;
}) {

    const [documentsFolder, setDocumentsFolder] =
        useState<string | null>(null);

    const [workOrders, setWorkOrders] =
        useState<DiscoveredWorkOrder[]>([]);

    const [selectedWorkOrder, setSelectedWorkOrder] =
        useState<DiscoveredWorkOrder | null>(null);

    return (

        <AppContext.Provider
            value={{
                documentsFolder,
                setDocumentsFolder,

                workOrders,
                setWorkOrders,

                selectedWorkOrder,
                setSelectedWorkOrder
            }}
        >

            {children}

        </AppContext.Provider>

    );

}

export function useAppContext() {

    const context = useContext(AppContext);

    if (!context) {

        throw new Error(
            "useAppContext must be used inside AppProvider"
        );

    }

    return context;

}