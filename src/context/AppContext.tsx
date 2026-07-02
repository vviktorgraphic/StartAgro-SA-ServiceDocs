import {
    createContext,
    useContext,
    useState,
    ReactNode
} from "react";

import { WorkOrder } from "../models/WorkOrder";

interface AppContextType {

    documentsFolder: string | null;
    setDocumentsFolder: (folder: string | null) => void;

    workOrders: WorkOrder[];
    setWorkOrders: (
        workOrders: WorkOrder[]
    ) => void;

    selectedWorkOrder: WorkOrder | null;
    setSelectedWorkOrder: (
        workOrder: WorkOrder | null
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
        useState<WorkOrder[]>([]);

    const [selectedWorkOrder, setSelectedWorkOrder] =
        useState<WorkOrder | null>(null);

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