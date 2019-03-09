
var Token: string = "";

export function SetToken(token: string) {
    Token = token;
}

/**
 * Adds the Authorization header (if present) to the normal fetch command.
 * 
 * @param args
 * @param init
 */
export function Fetch(args: string, init?: RequestInit) : Promise<any> {
    if (!init)
        init = { headers: {} };
    if (!init.headers)
        init.headers = {};

    if (Token != "") {
        var headers: any;
        headers = init.headers;
        if (headers) {
            if ("append" in headers)
                headers.append("Authorization", "Bearer " + Token);
            else if (! ("length" in headers))
                headers["Authorization"] = "Bearer " + Token;
        }
    }

    return fetch(args, init);
}
