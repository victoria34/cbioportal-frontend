import { getMatchminerCurationApiUrl } from "./urls";
import MatchminerCurationAPI from "./generated/MatchminerCurationAPI";

const client = new MatchminerCurationAPI(getMatchminerCurationApiUrl());

export default client;
