// import URL from './url';
import { CODE_FORWARD_SLASH, CODE_HASH, CODE_QUESTION_MARK } from './const';
import ImmutableURL from './immutable-url';
import URLSearchParamsWrapper from './search-params-wrapper';
// import { IURLExtended } from './types';
import URLSearchParams from './url-search-params';

export class URLProperties {
  protocol: string | null = null;
  username: string | null = null;
  password: string | null = null;
  hostname: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  search: string | null = null;
  hash: string | null = null;
  host: string | null = null;

  // toString(): string {
  //   let response = "";

  //   response += this.protocol;
  //   response += "//";
  //   response += this.hostname;
  //   response += this.pathname;
  //   response += this.search;
  //   response += this.hash;

  //   return response;
  // }
}


function mutate(url: URL, changes: URLProperties): ImmutableURL {
  const self: URLProperties= {
    hash: changes.hash !== null ? changes.hash : url.hash,
    host: changes.host !== null ? changes.host : url.host,
    hostname: changes.hostname !== null ? changes.hostname : url.hostname,
    password: changes.password !== null ? changes.password : url.password,
    pathname: changes.pathname !== null ? changes.pathname : url.pathname,
    port: changes.port !== null ? changes.port : url.port,
    protocol: changes.protocol !== null ? changes.protocol : url.protocol,
    search: changes.search !== null ? changes.search : url.search,
    username: changes.username !== null ? changes.username : url.username,
  };
  
  if (changes.hostname || changes.port) {
    if (self.protocol === 'https:' && self.port === '443') {
      self.port = '';
    } else if (self.protocol === 'http:' && self.port === '80') {
      self.port = '';
    }
    self.host = `${changetype<string>(self.hostname)}${changetype<string>(self.port) ? ':' : ''}${changetype<string>(self.port)}`;
  }
  let user = "";
  if (changetype<string>(self.username) !== '') {
    if (changetype<string>(self.password) !== '') {
      user = `${changetype<string>(self.username)}:${changetype<string>(self.password)}@`;
    } else {
      user = `${changetype<string>(self.username)}@`;
    }    
  } else {
    if (changetype<string>(self.password) !== '') {
      user = `:${changetype<string>(self.password)}@`;
    }
  }
  return new ImmutableURL(
    `${changetype<string>(self.protocol)}${url.slashes}${user}${changetype<string>(self.host)}${changetype<string>(self.pathname)}${changetype<string>(self.search)}${changetype<string>(self.hash)}`,
  );
}

export default class URL {
  private url: ImmutableURL;

  constructor(url: string, baseUrl: string | null = null) {
    this.url = new ImmutableURL(url, baseUrl);
  }

  public get protocol(): string {
    return this.url.protocol;
  }

  public set protocol(value: string) {
    const previousProtocol = this.url.protocol;
    const colon = value.endsWith(':') ? '' : ':';
    const href = `${value}${colon}${this.href.slice(previousProtocol.length)}`;
    this.url = new ImmutableURL(href);
  }

  public get username(): string {
    return this.url.username;
  }

  public set username(value: string) {
    //@ts-ignore
    this.url = mutate(this, {
      username: value || '',
    });
  }

  public get password(): string {
    return this.url.password;
  }

  public set password(value: string) {
    //@ts-ignore
    this.url = mutate(this, {
      password: value || '',
    });
  }

  public get hostname(): string {
    return this.url.hostname;
  }

  public set hostname(value: string) {
    //@ts-ignore
    this.url = mutate(this, {
      hostname: value || '',
    });
  }

  public get host(): string {
    return this.url.host;
  }

  public set host(value: string) {
    //@ts-ignore
    this.url = mutate(this, {
      host: value,
    });
  }

  public get origin(): string {
    return this.url.origin;
  }

  public get port(): string {
    return this.url.port;
  }

  public set port(value: string) {
    //@ts-ignore
    this.url = mutate(this, {
      port: value || '',
    });
  }

  public get pathname(): string {
    return this.url.pathname;
  }

  public set pathname(value: string) {
    const pathname = value.charCodeAt(0) === CODE_FORWARD_SLASH ? value : `/${value}`;
    //@ts-ignore
    this.url = mutate(this, {
      pathname,
    });
  }

  /**
   * The query string component of the URL, including the preceding `?` character.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/search
   */
  public get search():string {
    return this.url.search;
  }

  public set search(value: string) {
    const newQuery = value.charCodeAt(0) === CODE_QUESTION_MARK ? value.slice(1) : value;
    //@ts-ignore
    this.url = mutate(this, {
      search: newQuery.length > 0 ? `?${newQuery}` : '',
    });
  }

  /**
   * Parsed query string parameters, as a `URLSearchParams` object.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
   */
  public get searchParams(): URLSearchParams {
    return new URLSearchParamsWrapper(this, this.url.searchParams);
  }

  // /**
  //  * Parsed parameter string from the url. These are `;` separated key/values appearing in the URL
  //  * path, before the query string.
  //  */
  // public get parameters():URLSearchParams {
  //   return this.url.parameters;
  // }

  // /**
  //  * Check if the URL has a parameter string
  //  * @returns true iff `;` occurs in the URL path before a `?`.
  //  */
  // public hasParameterString():bool {
  //   return this.url.hasParameterString();
  // }

  /**
   * URL hash or fragment component.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/hash
   */
  public get hash():string {
    return this.url.hash;
  }

  public set hash(value: string) {
    const newHash = value.charCodeAt(0) === CODE_HASH ? value.slice(1) : value;
    //@ts-ignore
    this.url = mutate(this, {
      hash: newHash.length > 0 ? `#${newHash}` : '',
    });
  }

  public get href(): string {
    return this.url.href;
  }

  public set href(value: string) {
    this.url = new ImmutableURL(value);
  }

  /**
   * Returns the url (post parsing).
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/toString
   */
  public toString():string {
    return this.href;
  }

  /**
   * JSONified URL (== toString)
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/toJSON
   */
  public toJSON():string {
    return this.href;
  }

  /**
   * Legacy attribute for `pathname`.
   */
  get path():string {
    return this.url.path;
  }

  /**
   * Scheme = protocol without a trailing ':'.
   */
  get scheme():string {
    return this.url.scheme;
  }

  get slashes():string {
    return this.url.slashes;
  }

  /**
   * Non-standard params extractor.
   *
   * Returns search params from parameter string and query params with more aggessive extraction
   * than the standard URL implementation. Extra extraction features are:
   *  * `;` separated parameters - used by multi trackers
   * @returns URLSearchParams
   */
  public extractKeyValues():URLSearchParams {
    return this.url.extractKeyValues();
  }
}
