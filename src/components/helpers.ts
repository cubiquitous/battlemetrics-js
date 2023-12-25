declare type Method = "GET" | "POST" | "PATCH" | "UPDATE" | "DELETE";

type Header = { Authorization: string };

interface IDataRequest {
  method: Method;
  path: string;
  data: string;
  params?: string;
}

interface IParamRequest {
  method: Method;
  path: string;
  data?: string;
  params: string;
}

type IRequest = IDataRequest | IParamRequest;

export default class Helpers {
  public constructor(private headers: Header, private baseURL: string) {}

  async makeRequest({ method, path, params, data }: IRequest) {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method,
    };

    if (["POST", "PATCH"].includes(method)) {
      requestOptions.body = data;
      requestOptions.headers = {
        ...requestOptions.headers,
        "Content-Type": "application/json",
      };
    } else {
      path += "?" + params;
    }

    const response = await fetch(this.baseURL + path, requestOptions);

    if (response.status === 429) {
      throw new Error(
        "You're being rate limited by the API. Please wait a minute before trying again."
      );
    }

    return await response.json();
  }
}
