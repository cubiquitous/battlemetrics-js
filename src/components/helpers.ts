import { URL } from "url";

type Method = "GET" | "POST" | "PATCH" | "UPDATE" | "DELETE";

type Header = { Authorization: string };

interface IDataRequest {
  method: Exclude<Method, "GET">;
  path: string;
  data?: string;
  params?: URLSearchParams;
}

interface IParamRequest {
  method: "GET";
  path: string;
  data?: string;
  params?: URLSearchParams;
}

type MatchResult = {
  error: string;
  reason: string;
  adittionalInfo: {
    [key: string]: string;
  };
};

type IRequest = IDataRequest | IParamRequest;

export default class Helpers {
  public constructor(private headers: Header, private baseURL: string) {}

  async makeRequest<T>({ method, path, params, data }: IRequest): Promise<T> {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method,
    };
    const url = new URL(path, this.baseURL);

    if (["POST", "PATCH"].includes(method)) {
      requestOptions.body = data;
      requestOptions.headers = {
        ...requestOptions.headers,
        "Content-Type": "application/json",
      };
    }
    if (params) url.search = params.toString();

    const response = await fetch(url, requestOptions);

    if (response.status === 429) {
      throw new Error(
        "You're being rate limited by the API. Please wait a minute before trying again."
      );
    }

    if ("error" in response) {
      throw response;
    }
    // future reference: for dealing with edge cases
    const contentType = response.headers.get("content-type");
    // console.log({ contentType });
    // Initial dealing with edge cases
    if (contentType == "application/json") {
      return await response.json();
    } else if (contentType == "text/html; charset=UTF-8") {
      throw await this.htmlHandler(response);
    } else {
      throw new Error(`unsuportted content type: ${contentType} `);
    }
  }

  private async htmlHandler(response: Response): Promise<Error> {
    const htmlContent = await response.text(); // Get the HTML content as text

    // Regular expression to capture the text content inside tags and separate by groups
    const regex =
      /<h1>Access denied<\/h1>\s*<p>(.*?)<\/p>\s*<p>(.*?)<\/p>\s*<ul class="cferror_details">(.*?)<\/ul>/s;

    const match = htmlContent.match(regex);

    if (!match) {
      throw new Error(
        "unknow error, contact the developers and consider opening an issue"
      );
    }

    // Create an object to store the captured text content
    const result: MatchResult = {
      error: "Access denied",
      reason: match[1] + " " + match[2],
      adittionalInfo: {},
    };

    // Extract content inside <li>
    const liRegex = /<li>([^<:]+): ([^<]+)<\/li>/;

    match[3]
      .split("\n")
      .map((item: string) => item.match(liRegex)!)
      .filter(Boolean)
      .forEach(
        ([_, key, value]) =>
          key !== "Your IP address" && (result.adittionalInfo[key] = value)
      );

    throw new htmlResponseError("Permission error", result);
  }

  calculateFutureDate(inputString: string): string | undefined {
    const unit = inputString.slice(-1);
    //early return
    if (!["d", "w", "m", "h"].includes(unit)) {
      return undefined;
    }
    const number = parseInt(inputString.slice(0, -1));

    const toISOString = (d: Date): string =>
      d.toISOString().replace(/\.\d{3}Z$/, "Z");

    let futureDate: any;
    switch (unit) {
      case "d":
        return toISOString(new Date(number * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
      case "w":
        return toISOString(new Date(number * 7 * 24 * 60 * 60 * 1000)); // Convert weeks to milliseconds
      case "m":
        return toISOString(new Date(number * 30 * 24 * 60 * 60 * 1000)); // Approximate for months, convert to milliseconds
      case "h":
        return toISOString(new Date(number * 60 * 60 * 1000)); // Convert hours to milliseconds
      default:
        return undefined;
    }
  }
}

class htmlResponseError extends Error {
  public details: MatchResult;
  constructor(public message: string, details: MatchResult) {
    super(message);
    this.details = details;
  }
}
