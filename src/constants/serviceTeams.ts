export const serviceTeams = [
    ["AD", "Admin"],
    ["SA", "Start Agro Kft"],
    ["HT", "Help-Trak Kft"],
    ["HA", "Haty Szerviz Kft"],
    ["LA", "Lengyel Attila"],
    ["TP", "Turcsányi Péter"],
    ["MJ", "Mester János"],
    ["PJ", "Pászti János"],
    ["SP", "Surányi Péter"],
    ["PB", "Pigler Béla"],
    ["KT", "Kis Tibor"],
    ["UP", "Urbán Péter"],
    ["GT", "Gellén Zoltán"]
] as const;

export function getServiceTeamName(
    prefix: string | undefined
): string | undefined {

    return serviceTeams.find(([teamPrefix]) =>
        teamPrefix === prefix
    )?.[1];

}
