import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

import { ServiceVisit } from "../../models/ServiceVisit";

interface Props {

    serviceVisits: ServiceVisit[];

}

export default function ServiceVisitTable({
    serviceVisits
}: Props) {

    if (serviceVisits.length === 0) {

        return (

            <Typography
                variant="body2"
                color="text.secondary"
            >

                Nincs rögzzített kiszállás.

            </Typography>

        );

    }

    return (

        <TableContainer
            component={Paper}
            variant="outlined"
        >

            <Table size="small">

                <TableHead>

                    <TableRow>

                        <TableCell>

                            Kiszállás dátuma

                        </TableCell>

                        <TableCell>

                            Szerviz technikus

                        </TableCell>

                        <TableCell align="right">

                            Rezsi anyag (Ft)

                        </TableCell>

                        <TableCell align="right">

                            Megtett km

                        </TableCell>

                        <TableCell align="right">

                            Munkaidő (óra)

                        </TableCell>

                        <TableCell>

                            Munka rövid leírása

                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {serviceVisits.map((visit, index) => (

                        <TableRow key={index}>

                            <TableCell>

                                {visit.date}

                            </TableCell>

                            <TableCell>

                                {visit.technician}

                            </TableCell>

                            <TableCell align="right">

                                {visit.travelCost}

                            </TableCell>

                            <TableCell align="right">

                                {visit.kilometers}

                            </TableCell>

                            <TableCell align="right">

                                {visit.workHours}

                            </TableCell>

                            <TableCell>

                                {visit.shortDescription}

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>

    );

}