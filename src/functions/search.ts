import axios from "axios";
import { SearchError } from "../structures/SearchError";
import { YoutubeSearchResults } from "../structures/YoutubeSearchResults";
import { ErrorCodes } from "../util/constants";
import { JSONParser } from "../util/jsonParser";
import { noop } from "../util/noop";
import { Util } from "../util/Util";

export async function search(query: string, amount: number = 1): Promise<YoutubeSearchResults> {
    const params = new URLSearchParams()
    
    params.append("search_query", query)
    params.append("sp", "EgIQAQ%3D%3D")
    params.append("pbj", "1")

    if (amount > 1) {
        params.append("pbjreload", "1")
    } else {
        params.append("pbjreload", `${amount}`)
    }

    params.append("hl", "en")

    const request = await axios.get<string>(`${Util.getYTSearchURL()}?${params}`).catch(noop)

    if (!request) {
        throw new SearchError(ErrorCodes.SEARCH_FAILED)
    }

    try {
        const json = JSONParser(
            Util.getBetween(
                request.data,
                `var ytInitialData = `,
                `;</script>`
            )
        )

        return new YoutubeSearchResults(json)
    } catch (error: any) {
        throw new SearchError(error.message)
    }
}