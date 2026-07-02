import { useEffect } from "react";

import AppShell from "./components/layout/AppShell";
import { startupService } from "./services/StartupService";

export default function App() {

    useEffect(() => {

        startupService
            .initialize()
            .catch(console.error);

    }, []);

    return <AppShell />;

}