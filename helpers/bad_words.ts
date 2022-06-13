import { ResourceLoader } from "./loader.ts";
const defaultBadListUrl =
  "https://raw.githubusercontent.com/TrentonGage11/Google-profanity-words/209d0a75ae78dd8da6a38d2cb12935fd78d3e810/list.txt";

async function loadBadWords() {
  const response = await fetch(defaultBadListUrl);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const text = await response.text();
  return text
    .split(/\r?\n/)
    // false positive on hello
    .filter((l) => l !== "hell")
    .join("\n");
}

export interface BadWordsCleaner {
  clean(text: string): string;
}

export class BadWordsCleanerLoader {
  #resourceLoader: ResourceLoader<BadWordsCleaner>;

  constructor(loadFunc = loadBadWords, getTime = () => Date.now()) {
    this.#resourceLoader = new ResourceLoader({
      load: async () => {
        const text = await loadFunc();
        return new TextBadWordsCleaner(text);
      },
      getTime,
    });
  }

  async getInstance() {
    try {
      return await this.#resourceLoader.getInstance();
    } catch (err) {
      console.log("Error loading bad words list.", err);
      return new IdentityBadWordsCleaner();
    }
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

export const badWordsCleanerLoader = new BadWordsCleanerLoader();
