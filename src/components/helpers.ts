import { URL } from "url";

declare type Method = "GET" | "POST" | "PATCH" | "UPDATE" | "DELETE";

type Header = { Authorization: string };

interface IDataRequest {
  method: Exclude<Method, "GET">;
  path: string;
  data: string;
  params?: URLSearchParams;
}

interface IParamRequest {
  method: "GET";
  path: string;
  data?: string;
  params: URLSearchParams;
}

type IRequest = IDataRequest | IParamRequest;

export default class Helpers {
  public constructor(private headers: Header, private baseURL: string) {}

  async makeRequest<T>({ method, path, params, data }: IRequest): Promise<T> {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method,
    };
    let url: URL;

    if (["POST", "PATCH"].includes(method)) {
      url = new URL(this.baseURL);
      requestOptions.body = data;
      requestOptions.headers = {
        ...requestOptions.headers,
        "Content-Type": "application/json",
      };
    } else {
      url = new URL(path, this.baseURL);
      if (params) url.search = params.toString();
    }

    const response = await fetch(url, requestOptions);

    if (response.status === 429) {
      throw new Error(
        "You're being rate limited by the API. Please wait a minute before trying again."
      );
    }
    // future reference: for dealing with edge cases
    const contentType = response.headers.get("content-type");
    // console.log({ contentType });
    // console.log(response);
    // Initial dealing with edge cases
    if (contentType == "application/json") {
      return await response.json();
    } else if (contentType == "text/html; charset=UTF-8") {
      this.htmlHandler(response);
    } else {
      return "res" as T; // TODO: find where triggers edge case and solve it;
    }
  }

  private async htmlHandler(response: Response) {
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

    type MatchResult = {
      type: string;
      error: string;
      reason: string;
      adittionalInfo: {
        [key: string]: string;
      };
    };

    // Create an object to store the captured text content
    const result: MatchResult = {
      type: "permission",
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

    throw result;
  }
}
