export interface CacheLayer {
  get(key: string, fetchCallback?: () => Promise<any>): Promise<any>;

  set(key: string, value: any): Promise<void>;

  del(key: string): Promise<void>;
}
