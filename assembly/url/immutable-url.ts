import {
  CODE_AMPERSAND,
  CODE_AT,
  CODE_COLON,
  CODE_EQUALS,
  CODE_FORWARD_SLASH,
  CODE_HASH,
  CODE_QUESTION_MARK,
  CODE_SEMICOLON,
  CODE_SQUARE_BRACKET_CLOSE,
  CODE_SQUARE_BRACKET_OPEN,
} from './const';
import URLSearchParams from './url-search-params';
import { extractParams } from './url-search-params';

const BREAK_HOST_ON = [CODE_FORWARD_SLASH, CODE_HASH, CODE_QUESTION_MARK];

function isValidProtocolChar(code: i32): bool {
  return (
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    (code >= 48 && code <= 57) || // 0-9
    code === 45 || // -
    code === 43
  ); // +
}
export const SPECIAL_SCHEMES = [
  "ftp:",
  "file:",
  "http:",
  "https:",
  "ws:",
  "wss:",
];

export default class ImmutableURL {
  public origin: string = '';
  public slashes: string = '';

  private _protocol: string = '';
  private _username: string = '';
  private _password: string = '';
  private _hostname: string = '';
  private _host: string = '';
  private _port: string = '';
  private _pathname: string = '';
  private _search: string = '';
  private _hash: string = '';
  private _href: string = '';

  private parameterStartIndex: i32 = 0;
  private queryStartIndex: i32 = 0;
  private isQueryParsed: boolean = false;
  private _parameters: URLSearchParams = new URLSearchParams();
  private _query: URLSearchParams = new URLSearchParams();
  // private _domainInfo: IResult | null;
  private parsedParameters: URLSearchParams | null = null;

  constructor(url: string, baseUrl: string | null = null) {
    let baseUrlString = "";
    if (baseUrl !== null) {
      baseUrlString = (baseUrl as string).replaceAll("\\", "/");
    }

    // First apply our baseUrl if it is absolute
    if (baseUrlString.length > 0) {
      this.parse(baseUrl as string);
      console.log(baseUrl as string);


      // Check if our relative URL has a protocol
      let relativeUrlProtocol = "";
      if (
        !url.startsWith("//") &&
        !url.includes("file:") &&
        url.indexOf(":") > 0
      ) {
        relativeUrlProtocol = url.slice(0, url.indexOf(":") + 1);
      }

      if (
        relativeUrlProtocol != "" &&
        !SPECIAL_SCHEMES.includes(relativeUrlProtocol)
      ) {
        // treat it as it's own absolute url
        this.parse(url);
        console.log(url as string);
        console.log("++++++++++++++++++++++++++++++");

      } else {
        let relativeUrl = url;
        if (relativeUrlProtocol != "") {
          // Remove the protocol and pass a relative url
          relativeUrl = relativeUrl.slice(relativeUrl.indexOf(":") + 1);
        }

        this.handleRelativeUrl(relativeUrl);
      }
    } else {
      // If we didn't have a baseUrl, the url has to be absolute
      if (!this.isAbsoluteUrl(url)) {
        throw new Error(
          "The URL: " +
          url +
          " is a relative URL. You must also pass a baseUrl for relative URLs."
        );
        return;
      }

      this.parse(url);
    }

    // this.parse(url);
  }

  public get protocol(): string {
    return this._protocol;
  }

  public get username(): string {
    return this._username;
  }

  public get password(): string {
    return this._password;
  }

  public get hostname(): string {
    return this._hostname;
  }

  public get host(): string {
    return this._host;
  }
  public get port(): string {
    return this._port;
  }

  public get pathname(): string {
    return this._pathname;
  }

  /**
   * The query string component of the URL, including the preceding `?` character.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/search
   */
  public get search(): string {
    if (!this._search) {
      this._extractParams();
    }
    return this._search;
  }

  /**
   * Parsed query string parameters, as a `URLSearchParams` object.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
   */
  public get searchParams(): URLSearchParams {
    if (!this.isQueryParsed) {
      this._extractSearchParams();
    }
    return this._query;
  }

  /**
   * Parsed parameter string from the url. These are `;` separated key/values appearing in the URL
   * path, before the query string.
   */
  public get parameters(): URLSearchParams {
    if (!this.isQueryParsed) {
      this._extractSearchParams();
    }
    return this._parameters;
  }

  /**
   * Check if the URL has a parameter string
   * @returns true iff `;` occurs in the URL path before a `?`.
   */
  public hasParameterString(): bool {
    return this.parameterStartIndex > 0;
  }

  /**
   * URL hash or fragment component.
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/hash
   */
  public get hash(): string {
    if (!this._search && !this._hash) {
      this._extractParams();
    }
    return this._hash;
  }

  public get href(): string {
    return this._href;
  }

  /**
   * Returns the url (post parsing).
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/toString
   */
  public toString(): string {
    return this.href;
  }

  /**
   * JSONified URL (== toString)
   * See also: https://developer.mozilla.org/en-US/docs/Web/API/URL/toJSON
   */
  public toJSON(): string {
    return this.href;
  }

  /**
   * Legacy attribute for `pathname`.
   */
  get path(): string {
    return this.pathname || '/';
  }

  /**
   * Scheme = protocol without a trailing ':'.
   */
  get scheme(): string {
    return this.protocol.slice(0, -1);
  }
  public isAbsoluteUrl(url: string): boolean {
    if (url.startsWith("//")) {
      // Protocol Relative URL
      return false;
    }
    if (url.indexOf(":") > 0) {
      return true;
    }

    return false;
  }

  /**
   * Non-standard params extractor.
   *
   * Returns search params from parameter string and query params with more aggessive extraction
   * than the standard URL implementation. Extra extraction features are:
   *  * `;` separated parameters - used by multi trackers
   * @returns URLSearchParams
   */
  public extractKeyValues(): URLSearchParams {
    if (this.parsedParameters) {
      return this.parsedParameters;
    }
    this.parsedParameters = new URLSearchParams();
    if (this.queryStartIndex === 0 && this.parameterStartIndex === 0) {
      return this.parsedParameters;
    }
    const start = this.parameterStartIndex || this.queryStartIndex;
    const end = this.href.length - 1;
    let index = start;

    if (this.href.charCodeAt(index) === CODE_SEMICOLON) {
      // parameter string starts here
      index = this._extractParamTuples(
        index + 1,
        end,
        this.parsedParameters,
        [CODE_SEMICOLON],
        CODE_EQUALS,
        [CODE_QUESTION_MARK, CODE_HASH],
      );
    }

    if (this.href.charCodeAt(index) === CODE_QUESTION_MARK) {
      // query string starts here
      index = this._extractParamTuples(
        index + 1,
        end,
        this.parsedParameters,
        [CODE_AMPERSAND, CODE_SEMICOLON], // allow '&' or ';' as separators
        CODE_EQUALS,
        [CODE_HASH],
      );
    }
    return this.parsedParameters;
  }

  private _extractHostname(start: i32, end: i32): i32 {
    let portIndex = 0;
    let stopped = false;
    let i = start;
    let ipv6 = false;
    let hasUpper = false;

    // this is a IPv6 address - ignore everything until the closing bracket
    if (this._href.charCodeAt(i) === CODE_SQUARE_BRACKET_OPEN) {
      ipv6 = true;
      for (; i <= end; i += 1) {
        const code = this._href.charCodeAt(i);
        if (code === CODE_SQUARE_BRACKET_CLOSE) {
          // after closed brackets can only be ':' or '/'
          const nextCode = this._href.charCodeAt(i + 1);
          if (nextCode === CODE_COLON) {
            portIndex = i + 1;
            i += 1;
            stopped = true;
          } else if (nextCode === CODE_FORWARD_SLASH) {
            i += 1;
            stopped = true;
          } else if (i !== end) {
            throw new TypeError('expected `:` or `/` after IPv6 address');
          }
          break;
        }
      }
    }

    if (!ipv6) {
      for (; i <= end; i += 1) {
        const code = this._href.charCodeAt(i);
        if (code === CODE_COLON) {
          portIndex = i;
          stopped = true;
          break;
        } else if (code === CODE_AT) {
          // username without password
          this._username = this._href.slice(start, i);
          this._password = '';
          return this._extractHostname(i + 1, end);
        }
        if (BREAK_HOST_ON.indexOf(code) !== -1) {
          stopped = true;
          break;
        } else if (code <= 0x20) {
          throw new TypeError(
            `Invalid character '${this.href.at(i)}' in hostname`,
          );
        } else if (code >= 65 && code <= 90) {
          hasUpper = true;
        }
      }
    }
    const hostnameEnd = !stopped ? i + 1 : i;
    if (hasUpper) {
      this._href = `${this._href.slice(0, start)}${this._href
        .slice(start, hostnameEnd)
        .toLowerCase()}${this._href.slice(hostnameEnd)}`;
    }
    this._hostname = this._href.slice(start, hostnameEnd);

    if (portIndex > 0) {
      i += 1;
      const portStart = i;
      let nonNumeric = false;
      for (; i <= end; i += 1) {
        const code = this._href.charCodeAt(i);
        if (BREAK_HOST_ON.indexOf(code) !== -1) {
          this._port = this._href.slice(portStart, i);
          break;
        } else if (code === CODE_AT) {
          // this was actually a username and password - extract user:pass, then
          // parse the rest as a plain hostname
          this._username = this._href.slice(start, portIndex || i);
          this._password = this._href.slice(portIndex + 1, i);
          return this._extractHostname(i + 1, end);
        } else if (code < 48 || code > 57) {
          // non numeric character in port
          nonNumeric = true;
        }
      }
      if (!this._port) {
        this._port = this.href.slice(portStart, i);
      }
      // validate port - cannot contain non-numeric characters
      if (nonNumeric) {
        throw new TypeError('Invalid URL: port contains non numeric character');
      }
      // cannot be greater than 65535
      if (this._port.length >= 5 && parseInt(this._port) > 65535) {
        throw new TypeError('Invalid URL: invalid port number');
      }
    }
    this._host = this._href.slice(start, !stopped ? i + 1 : i);
    this.origin = `${this._protocol}//${this._host}`;
    return !stopped ? i + 1 : i;
  }

  private _extractParams(): void {
    if (this.queryStartIndex > 0) {
      let index: i32 = this.queryStartIndex;
      const end = this.href.length - 1;
      if (this.href.charCodeAt(index) === CODE_QUESTION_MARK) {
        let broken = false;
        for (; index <= end; index += 1) {
          if (this.href.charCodeAt(index) === CODE_HASH) {
            broken = true;
            break;
          }
        }
        this._search = this.href.slice(
          this.queryStartIndex,
          broken ? index : end + 1,
        );
        if (this._search.length === 1) {
          this._search = '';
        }
      }
      if (this.href.charCodeAt(index) === CODE_HASH) {
        this._hash = this.href.slice(index, end + 1);
      }
    }
  }

  private _extractSearchParams(): void {
    this.isQueryParsed = true;
    if (this.queryStartIndex === 0 && this.parameterStartIndex === 0) {
      return;
    }
    const start = this.parameterStartIndex || this.queryStartIndex;
    const end = this.href.length - 1;
    let index = start;

    if (this.href.charCodeAt(index) === CODE_SEMICOLON) {
      // parameter string starts here
      index = this._extractParamTuples(
        index + 1,
        end,
        this._parameters,
        [CODE_SEMICOLON],
        CODE_EQUALS,
        [CODE_QUESTION_MARK, CODE_HASH],
      );
    }
    if (this.href.charCodeAt(index) === CODE_QUESTION_MARK) {
      // query string starts here
      const searchStart = index;
      index = this._extractParamTuples(
        index + 1,
        end,
        this._query,
        [CODE_AMPERSAND],
        CODE_EQUALS,
        [CODE_HASH],
      );
      this._search = this.href.slice(searchStart, index);
      if (this._search.length === 1) {
        this._search = '';
      }
    }
    if (this.href.charCodeAt(index) === CODE_HASH) {
      this._hash = this.href.slice(index, end + 1);
    }
  }

  private _extractParamTuples(
    start: i32,
    end: i32,
    params: URLSearchParams,
    separators: i32[],
    equals: i32,
    breakCodes: i32[],
  ): i32 {
    return extractParams(
      this.href,
      start,
      end,
      params,
      separators,
      equals,
      breakCodes,
    );
  }

  public handleRelativeUrl(
    relativeUrl: string,
  ): void {

    if (relativeUrl.startsWith("//")) {

      // let url = relativeUrl.substring(2);
      let url = this._protocol + relativeUrl;
      console.log("url: " + url);

      this.parse(url, false);
      return;
    }

    // Check if we need to preserve the original pathname
    if (relativeUrl.startsWith(".")) {
    } else {
      this._pathname = "";
      this._search = "";
      this._hash = "";
    }

    this.parseRelativeUrl(relativeUrl);
  }

  public parseRelativeUrl(
    relative_url: string,
  ): void {

    let applied_relative_url = this.pathname;
    if (relative_url.startsWith("/")) {
      applied_relative_url = relative_url;
    } else {
      if (!applied_relative_url.endsWith("/") && !relative_url.startsWith("/")) {
        applied_relative_url += "/" + relative_url;
      } else {
        applied_relative_url += relative_url;
      }
    }

    if (applied_relative_url.endsWith(".")) {
      applied_relative_url += "/";
    }

    while (applied_relative_url.includes("/./")) {
      applied_relative_url = applied_relative_url.replace("/./", "/");
    }

    while (applied_relative_url.includes("/../")) {
      let parentDirectoryIndex = applied_relative_url.indexOf("../");

      if (parentDirectoryIndex > 1) {
        let parentIndex = applied_relative_url.lastIndexOf(
          "/",
          parentDirectoryIndex - 2
        );
        let parentReplaceTerm = applied_relative_url.slice(
          parentIndex,
          parentDirectoryIndex + 3
        );

        applied_relative_url = applied_relative_url.replace(parentReplaceTerm, "/");
      } else {
        throw new Error(
          "Relative url " +
          relative_url +
          " cannot be applied to the url " +
          this.toString()
        );
      }
    }

    relative_url = applied_relative_url;
    if (!relative_url.startsWith("/")) {
      relative_url = "/" + relative_url;
    }

    let urlAfterHost = relative_url + this._search + this._hash;
    let url = this._protocol + this.slashes + this._host + urlAfterHost;

    this.parse(url);


    if (relative_url.endsWith("/") && !this._pathname.endsWith("/")) {
      this._pathname += "/";
    }

    return;
  }

  private parse(url: string, include_protocol: bool = true): void {
    if (typeof url !== 'string' || url.length === 0) {
      throw new TypeError(`${url} is not a valid URL`);
    }

    this._protocol = '';
    this._hostname = '';
    this._host = '';
    this._port = '';
    this._pathname = '';
    this._username = '';
    this._password = '';
    this._search = '';
    this._hash = '';
    this.parameterStartIndex = 0;
    this.queryStartIndex = 0;
    this.isQueryParsed = false;
    this._parameters = new URLSearchParams();
    this._query = new URLSearchParams();
    // this._domainInfo = null;
    this.parsedParameters = null;

    // let include_protocol = true;
    let index = 0;
    // end is within bound of url
    let end = url.length - 1;
    // cut whitespace from the beginning and end of url
    while (url.charCodeAt(index) <= 0x20) {
      index += 1;
    }
    while (url.charCodeAt(end) <= 0x20) {
      end -= 1;
    }
    this._href = url.slice(index, end + 1);

    end = this._href.length - 1;

    // if (include_protocol) {
    index = this.parseProtocol(index, end);
    // }


    // skip '/' after ':'
    index = this.parseHost(index, end);

    index = this.parsePath(index, end);
  }

  private parseProtocol(index: i32, end: i32): i32 {
    let hasUpper = false;
    // Parse protocol
    for (; index <= end; index += 1) {
      const code = this._href.charCodeAt(index);
      if (code === CODE_COLON) {
        this._protocol = this._href.slice(0, index + 1);
        if (hasUpper) {
          this._protocol = this._protocol.toLowerCase();
          this._href = `${this._protocol}${this._href.slice(index + 1)}`;
        }
        break;
      } else if (!isValidProtocolChar(code)) {
        // non alphabet character in protocol - not a valid protocol
        throw new TypeError('Invalid URL protocol');
      } else if (code >= 65 && code <= 90) {
        hasUpper = true;
      }
    }

    if (index >= end) {
      throw new TypeError('No protocol');
    }
    return index;
  }

  private parseHost(index: i32, end: i32): i32 {
    this.slashes = '';
    for (index += 1; index < end; index += 1) {
      if (this._href.charCodeAt(index) !== CODE_FORWARD_SLASH) {
        break;
      } else {
        this.slashes += '/';
      }
    }
    if (this.slashes.length >= 2) {
      // Two slashes: Authority is included     
      index = this._extractHostname(index, end);
    } else {
      // No authority
      this._host = '';
      this._hostname = '';
      this.origin = 'null';
    }
    return index;
  }

  private parsePath(index: i32, end: i32): i32 {
    if (index >= end) {
      // add trailing slash if missing
      if (this._href.charCodeAt(end) !== CODE_FORWARD_SLASH) {
        this._href += '/';
      }
      this._pathname = '/';
    } else {
      const pathStart = index;
      for (; index <= end; index += 1) {
        const code = this._href.charCodeAt(index);
        if (code === CODE_SEMICOLON && !this.parameterStartIndex) {
          this.parameterStartIndex = index;
        } else if (code === CODE_QUESTION_MARK || code === CODE_HASH) {
          this.queryStartIndex = index;
          break;
        }
      }
      this._pathname =
        this.href.slice(
          pathStart,
          this.queryStartIndex !== 0 ? this.queryStartIndex : end + 1
        ) || '/';
    }
    return index;
  }
}
