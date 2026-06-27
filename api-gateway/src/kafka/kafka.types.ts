import type { Buffer } from 'node:buffer';

export type KafkaHeaderValue = string | Buffer;

export type KafkaHeaders = Record<string, KafkaHeaderValue>;

export interface KafkaRequestOptions {
  key?: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  headers?: KafkaHeaders;
  timeoutMs?: number;
}

export interface KafkaMessage<TData> {
  key?: string;
  value: TData;
  headers: KafkaHeaders;
}