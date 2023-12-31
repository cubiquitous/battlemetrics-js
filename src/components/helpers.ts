import { URL } from "url";

declare type Method = "GET" | "POST" | "PATCH" | "UPDATE" | "DELETE";

type Header = { Authorization: string };

interface IDataRequest {
  method: Method;
  path: string;
  data: string;
  params?: URLSearchParams;
}

interface IParamRequest {
  method: Method;
  path: string;
  data?: string;
  params: URLSearchParams;
}

type IRequest = IDataRequest | IParamRequest;

export default class Helpers {
  public constructor(private headers: Header, private baseURL: string) {}

  async makeRequest({ method, path, params, data }: IRequest) {
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
      url.search = params!.toString();
    }

    const response = await fetch(url, requestOptions);
    if (response.status === 429) {
      throw new Error(
        "You're being rate limited by the API. Please wait a minute before trying again."
      );
    }

    return await response.json();
  }
}
