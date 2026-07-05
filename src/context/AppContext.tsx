import {
    createContext,
    useEffect,
    useMemo,
    useContext,
    useState,
    ReactNode
} from "react";

import { getServiceTeamName } from "../constants/serviceTeams";
import { WorkOrder } from "../models/WorkOrder";

export interface WorkOrderFilters {

    serviceTeam: string;

    workOrderNumber: string;

    partnerName: string;

    technician: string;

    machineType: string;

    serialNumber: string;

    dateFrom: string;

    dateTo: string;

}

interface AppContextType {

    documentsFolder: string | null;
    setDocumentsFolder: (folder: string | null) => void;

    workOrders: WorkOrder[];
    setWorkOrders: (
        workOrders: WorkOrder[]
    ) => void;

    filteredWorkOrders: WorkOrder[];

    selectedWorkOrder: WorkOrder | null;
    setSelectedWorkOrder: (
        workOrder: WorkOrder | null
    ) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    filters: WorkOrderFilters;
    setFilters: (
        filters: WorkOrderFilters
    ) => void;

    clearFilters: () => void;

}

const AppContext =
    createContext<AppContextType | undefined>(undefined);

const emptyFilters: WorkOrderFilters = {

    serviceTeam: "",

    workOrderNumber: "",

    partnerName: "",

    technician: "",

    machineType: "",

    serialNumber: "",

    dateFrom: "",

    dateTo: ""

};

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

    const [searchQuery, setSearchQuery] =
        useState("");

    const [debouncedSearchQuery, setDebouncedSearchQuery] =
        useState("");

    const [filters, setFilters] =
        useState<WorkOrderFilters>(emptyFilters);

    useEffect(() => {

        const timeoutId =
            window.setTimeout(
                () => setDebouncedSearchQuery(searchQuery),
                150
            );

        return () => window.clearTimeout(timeoutId);

    }, [searchQuery]);

    const filteredWorkOrders =
        useMemo(
            () => filterWorkOrders(
                workOrders,
                debouncedSearchQuery,
                filters
            ),
            [
                workOrders,
                debouncedSearchQuery,
                filters
            ]
        );

    useEffect(() => {

        if (filteredWorkOrders.length === 0) {

            if (selectedWorkOrder !== null) {
                setSelectedWorkOrder(null);
            }

            return;

        }

        const selectedIsVisible =
            selectedWorkOrder
            && filteredWorkOrders.some(workOrder =>
                workOrder.workOrderNumber ===
                selectedWorkOrder.workOrderNumber
            );

        if (!selectedIsVisible) {
            setSelectedWorkOrder(filteredWorkOrders[0]);
        }

    }, [filteredWorkOrders, selectedWorkOrder]);

    function clearFilters() {
        setFilters(emptyFilters);
    }

    return (

        <AppContext.Provider
            value={{
                documentsFolder,
                setDocumentsFolder,

                workOrders,
                setWorkOrders,

                filteredWorkOrders,

                selectedWorkOrder,
                setSelectedWorkOrder,

                searchQuery,
                setSearchQuery,

                filters,
                setFilters,
                clearFilters
            }}
        >

            {children}

        </AppContext.Provider>

    );

}

function filterWorkOrders(
    workOrders: WorkOrder[],
    searchQuery: string,
    filters: WorkOrderFilters
): WorkOrder[] {

    const normalizedQuery =
        normalizeSearchValue(searchQuery);

    const normalizedFilters = {
        serviceTeam: normalizeSearchValue(filters.serviceTeam),
        workOrderNumber: normalizeSearchValue(filters.workOrderNumber),
        partnerName: normalizeSearchValue(filters.partnerName),
        technician: normalizeSearchValue(filters.technician),
        machineType: normalizeSearchValue(filters.machineType),
        serialNumber: normalizeSearchValue(filters.serialNumber),
        dateFrom: normalizeDateValue(filters.dateFrom),
        dateTo: normalizeDateValue(filters.dateTo)
    };

    return workOrders.filter(workOrder =>
        matchesGlobalSearch(workOrder, normalizedQuery)
        && matchesFilters(workOrder, normalizedFilters)
    );

}

function matchesGlobalSearch(
    workOrder: WorkOrder,
    query: string
): boolean {

    if (!query) {
        return true;
    }

    return [
        workOrder.workOrderNumber,
        workOrder.prefix,
        getServiceTeamName(workOrder.prefix),
        workOrder.partnerName,
        workOrder.taxNumber,
        workOrder.contactName,
        workOrder.phone,
        workOrder.email,
        workOrder.machineType,
        workOrder.serialNumber,
        workOrder.deliveryNoteNumber,
        workOrder.serviceLocation,
        workOrder.reportedIssue,
        workOrder.completedWork
    ].some(value =>
        normalizeSearchValue(value).includes(query)
    );

}

function matchesFilters(
    workOrder: WorkOrder,
    filters: WorkOrderFilters
): boolean {

    return matchesValue(workOrder.prefix, filters.serviceTeam)
        && matchesValue(workOrder.workOrderNumber, filters.workOrderNumber)
        && matchesValue(workOrder.partnerName, filters.partnerName)
        && matchesValue(workOrder.machineType, filters.machineType)
        && matchesValue(workOrder.serialNumber, filters.serialNumber)
        && matchesTechnician(workOrder, filters.technician)
        && matchesDateRange(
            workOrder,
            filters.dateFrom,
            filters.dateTo
        );

}

function matchesValue(
    value: string | undefined,
    filter: string
): boolean {

    if (!filter) {
        return true;
    }

    return normalizeSearchValue(value).includes(filter);

}

function matchesTechnician(
    workOrder: WorkOrder,
    filter: string
): boolean {

    if (!filter) {
        return true;
    }

    return workOrder.serviceVisits.some(visit =>
        normalizeSearchValue(visit.technician).includes(filter)
    );

}

function matchesDateRange(
    workOrder: WorkOrder,
    dateFrom: string,
    dateTo: string
): boolean {

    if (!dateFrom && !dateTo) {
        return true;
    }

    const dates = [
        workOrder.closedAt,
        ...workOrder.serviceVisits.map(visit => visit.date)
    ]
        .map(normalizeDateValue)
        .filter(value => value.length > 0);

    if (dates.length === 0) {
        return false;
    }

    return dates.some(date =>
        (!dateFrom || date >= dateFrom)
        && (!dateTo || date <= dateTo)
    );

}

function normalizeSearchValue(
    value: string | undefined
): string {

    return (value ?? "")
        .trim()
        .toLocaleLowerCase("hu-HU");

}

function normalizeDateValue(
    value: string | undefined
): string {

    return (value ?? "")
        .replace(/\D/g, "")
        .slice(0, 8);

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
