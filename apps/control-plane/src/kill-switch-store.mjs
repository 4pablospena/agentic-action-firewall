import Redis from "ioredis";

export class KillSwitchStore {
  async get(_scope) {
    return null;
  }

  async set(_scope, _reason) {}

  async del(_scope) {}
}

class IoredisKillSwitchStore extends KillSwitchStore {
  #redis;
  #prefix = "aaf:kill:";

  constructor(redisUrl) {
    super();
    this.#redis = new Redis(redisUrl);
  }

  key(scope) {
    return `${this.#prefix}${scope}`;
  }

  async get(scope) {
    return this.#redis.get(this.key(scope));
  }

  async set(scope, reason) {
    await this.#redis.set(this.key(scope), reason);
  }

  async del(scope) {
    await this.#redis.del(this.key(scope));
  }

  async quit() {
    await this.#redis.quit();
  }
}

export function createIoredisKillSwitchStore(redisUrl) {
  return new IoredisKillSwitchStore(redisUrl);
}

export function createUpstashKillSwitchStore(url, token) {
  return new UpstashKillSwitchStore(url, token);
}

class UpstashKillSwitchStore extends KillSwitchStore {
  #url;
  #token;
  #prefix = "aaf:kill:";

  constructor(url, token) {
    super();
    this.#url = url.replace(/\/$/, "");
    this.#token = token;
  }

  key(scope) {
    return `${this.#prefix}${scope}`;
  }

  async command(args) {
    const response = await fetch(`${this.#url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.#token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Upstash command failed: ${response.status}`);
    }

    const body = await response.json();
    return body.result;
  }

  async get(scope) {
    return this.command(["GET", this.key(scope)]);
  }

  async set(scope, reason) {
    await this.command(["SET", this.key(scope), reason]);
  }

  async del(scope) {
    await this.command(["DEL", this.key(scope)]);
  }
}
