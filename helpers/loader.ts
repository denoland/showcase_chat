export interface ResourceLoaderOptions<T> {
  load(): Promise<T>;
  getTime?(): number;
  /**
   * The amount of milliseconds to wait before trying to load again if a failure occurs.
   *
   * @default 10_000
   */
  resetTimeout?: number;
}

export class ResourceLoader<T> {
  readonly #loadFunc: () => Promise<T>;
  readonly #getTime: () => number;
  readonly #resetTimeout: number;

  #instance: T | undefined;
  #loadPromise: Promise<void> | undefined;
  #errResetTime: number | undefined;

  constructor(opts: ResourceLoaderOptions<T>) {
    this.#loadFunc = opts.load;
    this.#getTime = opts.getTime ?? (() => Date.now());
    this.#resetTimeout = opts.resetTimeout ?? 1_000 * 10;
  }

  async getInstance() {
    if (this.#errResetTime && this.#getTime() > this.#errResetTime) {
      this.#errResetTime = undefined;
      this.#loadPromise = undefined;
    }

    if (!this.#instance) {
      await this.#getLoadPromise();
    }
    return this.#instance!;
  }

  #getLoadPromise() {
    if (!this.#loadPromise) {
      this.#loadPromise = this.#loadFunc()
        .then((resource) => {
          this.#instance = resource;
          this.#loadPromise = undefined;
        })
        .catch((err) => {
          // try again in a bit
          this.#errResetTime = this.#getTime() + this.#resetTimeout;
          return Promise.reject(err);
        });
    }
    return this.#loadPromise;
  }
}
