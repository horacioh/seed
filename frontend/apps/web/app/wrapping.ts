import {json, TypedResponse} from "@remix-run/node";
import {deserialize, serialize, SuperJSONResult} from "superjson";

export type Wrapped<T> = SuperJSONResult;

export type WrappedResponse<T> = TypedResponse<Wrapped<T>>;

export function wrapJSON<T>(value: T): WrappedResponse<T> {
  return json(wrap(value));
}

export function wrap<T>(value: T): Wrapped<T> {
  return serialize(value);
}

export function unwrap<T>(value: any): T | undefined {
  if (!value) return undefined;
  return deserialize(value) as T;
}
