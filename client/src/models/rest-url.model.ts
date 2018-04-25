export class RestUrl {
  /**
   *
   * @param {string} baseUrl
   * @param {number} limit
   * @param {number} offset
   * @param {string} orderBy
   * @param filter
   * @returns {string}
   */
  public static buildUrl(baseUrl: string, limit?: number, offset?: number, orderBy?: any, filter?: any) {
    let urlArr: string[] = [];

    if (limit && limit != -1) {
      urlArr.push(RestUrl.getUrlAttribute('limit', limit));
    }
    if (offset) {
      urlArr.push(RestUrl.getUrlAttribute('offset', offset));
    }
    if (orderBy) {
      let sorting = [];
      for (let field in orderBy) {
        if (orderBy[field]) {
          sorting.push(`-${field}`)
        }
        else {
          sorting.push(field);
        }
      }

      urlArr.push(RestUrl.getUrlAttribute('orderBy', sorting.join(',')));
    }

    if (filter) {
      for (let field in filter) {
        urlArr.push(`${field}=${filter[field]}`);
      }
    }

    // console.info('baseUrl', baseUrl);

    return baseUrl + (urlArr.length ? '?' + urlArr.join('&') : ''); // @todo - filter
  }

  /**
   *
   * @param {string} name
   * @param value
   * @returns {string}
   */
  private static getUrlAttribute(name: string, value: any) {
    return `${name}=${value}`;
  }
}