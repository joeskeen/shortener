import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';

const hashLength = 5;
const hashChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// const corsProxy = '';
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const endpoint = 'https://db.neelr.dev/api/19a2702cf961c0e2cecdde4ba9d187fb';

@Injectable({ providedIn: 'root' })
export class UrlService {
  readonly baseHref: string;

  constructor(private http: HttpClient, private storage: StorageMap) {
    this.baseHref = document.querySelector('base').href;
  }

  async getShortUrl(longUrl: string): Promise<string> {
    console.log('get short URL for ', longUrl);
    const fullUrl = /^https?:\/\//.test(longUrl)
      ? longUrl
      : `https://${longUrl}`;

    if (await this.storage.has(fullUrl).toPromise()) {
      console.log('returning url from cache');
      return (await this.storage.get(fullUrl).toPromise()) as string;
    }

    let urlCandidate: string;
    let hash: string;
    do {
      hash = this.generateHash();
      console.log('hash', hash);
      urlCandidate = `${this.baseHref}#${hash}`;
      if (fullUrl.length < urlCandidate.length) {
        console.log('short URL would be longer than long url', urlCandidate);
        await this.storage.set(fullUrl, fullUrl).toPromise();
        return Promise.resolve(fullUrl);
      }
      const existing = await this.getLongUrl(hash);
      if (existing && existing !== fullUrl) {
        console.log('existing entry for hash', existing);
        hash = null;
      }
    } while (!hash);
    await this.storage.set(fullUrl, urlCandidate).toPromise();
    await this.storage.set(hash, fullUrl).toPromise();
    await this.http
      .post(
        `${corsProxy}${endpoint}/${hash}`,
        { longUrl },
        { responseType: 'text' }
      )
      .toPromise();
    return urlCandidate;
  }

  private generateHash(): string {
    const chars = [];
    for (let i = 0; i < hashLength; i++) {
      chars.push(
        hashChars.charAt(Math.floor(Math.random() * hashChars.length))
      );
    }
    return chars.join('');
  }

  async getLongUrl(hash: string): Promise<string> {
    if (hash.startsWith('#')) {
      hash = hash.substr(1);
    }
    if (!hash) {
      return Promise.resolve(null);
    }
    if (await this.storage.has(hash).toPromise()) {
      return (await this.storage.get(hash).toPromise()) as string;
    }

    let resolvedUrl: string;
    try {
      const response = await this.http
        .get<{ longUrl: string }>(`${corsProxy}${endpoint}/${hash}`)
        .toPromise();
      resolvedUrl = response.longUrl;
    } catch (err) {
      return null;
    }
    await this.storage.set(hash, resolvedUrl).toPromise();
    return resolvedUrl;
  }
}
