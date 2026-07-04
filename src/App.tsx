import { useEffect } from "react";

import AppShell from "./components/layout/AppShell";
import { useAppContext } from "./context/AppContext";
import { loadWorkOrdersService } from "./services/LoadWorkOrdersService";
import { startupService } from "./services/StartupService";

export default function App() {

    const {

        setWorkOrders,

        setSelectedWorkOrder

    } = useAppContext();

    useEffect(() => {

        async function initialize() {

            try {

                await startupService.initialize();

                const workOrders =
                    await loadWorkOrdersService.loadAll();

                setWorkOrders(
                    workOrders
                );

                if (workOrders.length > 0) {

                    setSelectedWorkOrder(
                        workOrders[0]
                    );

                }

            } catch (error) {

                console.error(error);

            }

        }

        initialize();

    }, [

        setWorkOrders,

        setSelectedWorkOrder

    ]);

    return <AppShell />;

}