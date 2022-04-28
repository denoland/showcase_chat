const defaultBadListUrl =
  "https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/badwordslist/badwords.txt";

async function loadBadWords() {
  const response = await fetch(defaultBadListUrl);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.text();
}

export interface BadWordsCleaner {
  clean(text: string): string;
}

export class BadWordsCleanerLoader {
  readonly #loadFunc: () => Promise<string>;
  readonly #getTime: () => number;

  #instance: BadWordsCleaner | undefined;
  #loadPromise: Promise<void> | undefined;
  #errResetTime: number | undefined;

  constructor(loadFunc = loadBadWords, getTime = () => Date.now()) {
    this.#loadFunc = loadFunc;
    this.#getTime = getTime;
  }

  async getInstance() {
    if (this.#errResetTime && this.#getTime() > this.#errResetTime) {
      this.#instance = undefined;
      this.#errResetTime = undefined;
    }

    if (!this.#instance) {
      try {
        await this.#getLoadPromise();
      } catch (err) {
        console.error("Error loading bad words list.", err);
        // try again in one minute
        this.#errResetTime = this.#getTime() + 1_000 * 60;
        // don't ever fail on this not loading... fallback to
        // not moderating bad words
        this.#instance = new IdentityBadWordsCleaner();
      }
    }
    return this.#instance!;
  }

  #getLoadPromise() {
    if (!this.#loadPromise) {
      this.#loadPromise = this.#loadFunc()
        .then((text) => {
          this.#instance = new TextBadWordsCleaner(text);
        })
        .finally(() => {
          this.#loadPromise = undefined;
        });
    }
    return this.#loadPromise;
  }
}

/** Used when loading the bad words list fails. */
class IdentityBadWordsCleaner implements BadWordsCleaner {
  clean(text: string) {
    return text;
  }
}

/** Cleaner that cleans based on the provided bad word list. */
class TextBadWordsCleaner implements BadWordsCleaner {
  #badWords: string[];

  constructor(badWordListText: string) {
    this.#badWords = badWordListText.split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  clean(text: string) {
    // very basic for now
    let lowercaseText = text.toLowerCase();
    for (const word of this.#badWords) {
      const index = lowercaseText.indexOf(word);
      if (index >= 0) {
        text = text.substring(0, index) +
          "*".repeat(word.length) +
          text.substring(index + word.length);
        lowercaseText = text.toLowerCase();
      }
    }
    return text;
  }
}
