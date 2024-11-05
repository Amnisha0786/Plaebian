import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Location } from "../../entities/Location";
import { Country } from "../../entities/Country";

class CountryService {
    private countryRepository: Repository<Country>;
    private locationRepository: Repository<Location>;


    constructor() {
        createConnection(ormconfig)
        this.countryRepository = getRepository(Country);
        this.locationRepository = getRepository(Location);
    }

    getCountryByName(name: string): Promise<Country | null> {
        return this.countryRepository.findOne({ where: { name } })
    }

    async saveCountryIfNotExist(name: string) {
        const ifExist = await this.getCountryByName(name)
        if (ifExist) return ifExist

        let data = this.countryRepository.create({ name })
        await data.save()

        await this.locationRepository.create({
            locationId: data.id,
            type: "country",
            name: name,
        }).save()
        return data

    }

    async getCountryById(id: number) {
        return await this.countryRepository.findOne({ where: { id: id } });
      }
    

}

export const countryService = new CountryService()