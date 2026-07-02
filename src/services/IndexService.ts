export class IndexService {

    public async run(folder: string): Promise<void> {

        console.log("Indexelés indítása:", folder);

    }

}

export const indexService = new IndexService();