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
      return "text/html; charset=UTF-8" as T;
    } else {
      return "res" as T; // TODO: find where triggers edge case and solve it;
    }
  }
}
