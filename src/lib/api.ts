import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "content-type": "application/json",
  },
});

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ error?: string }>).response?.data;
    if (data?.error) return data.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const getJson = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.get<TResponse>(url, config);
  return response.data;
};

export const postJson = async <TResponse>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const response = await api.post<TResponse>(url, body, config);
  return response.data;
};

export const putJson = async <TResponse>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const response = await api.put<TResponse>(url, body, config);
  return response.data;
};

export const patchJson = async <TResponse>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch<TResponse>(url, body, config);
  return response.data;
};

export const deleteJson = async <TResponse>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.delete<TResponse>(url, config);
  return response.data;
};
