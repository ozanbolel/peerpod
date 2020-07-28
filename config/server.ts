import { isProduction } from "./isProduction";

export const serverUrl = isProduction ? "https://peerpod-server.herokuapp.com" : "http://localhost:4000";
