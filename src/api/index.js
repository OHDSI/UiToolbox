// @ts-check
var URI = require('urijs');

const STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
};
const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};
const JSON_RESPONSE_TYPE = 'application/json';

const HEADERS = {
  Accept: JSON_RESPONSE_TYPE,
};

/**
 * Class for making AJAX calls
 */
export class Api {
  constructor() {
    /** @type string */
    this.apiHost = '';
    /** @type string */
    this.AUTH_TOKEN_HEADER = 'Arachne-Auth-Token';
  }

  /**
   * Sets the header to be sent in every AJAX call. This header will contain the token
   * @param {string} header 
   */
  setAuthTokenHeader(header) {
    this.AUTH_TOKEN_HEADER = header;
  }

  /**
   * Sets the host for AJAX calls
   * @param {string} url 
   */
  setApiHost(url) {
    this.apiHost = url;
  }
  
  getUserToken() {
    throw new Error('Replace this interface with implementation');
  }

  /**
   * 
   * @param {function} getUserToken 
   */
  setUserTokenGetter(getUserToken) {
    this.getUserToken = getUserToken;
    return this;
  }

  /**
   * Callback to be called when AJAX status is 401 Unauthorized
   * @callback
   */
  handleUnauthorized() {
    throw new Error('Replace this interface with implementation');
  }

  /**
   * Sets the unauthorized callback
   * @param {function} handler 
   */
  setUnauthorizedHandler(handler) {
    this.handleUnauthorized = handler;
    return this;
  }
  
  handleUnexpectedError() {
    alert('Oooops!.. Something went wrong :(');
  }

  getHeaders() {
    const headers = Object.assign({}, HEADERS);
    const token = this.getUserToken();

    if (token) {
      headers[this.AUTH_TOKEN_HEADER] = token;
    }

    return headers;
  }

  /**
   * Checks HTTP status for errors.
   * @param  { {[x: string]: any} } response
   * @return {boolean}
   */
  checkStatusError(response) {
    const status = response.status;

    switch (status) {
      case STATUS.OK:
        return true;
      case STATUS.UNAUTHORIZED:
        this.handleUnauthorized(response.json);
        break;
      default:
        this.handleUnexpectedError();
        break;
    }

    return false;
  }

  sendRequest(method, path, payload, callback) {
    const params = {
      method,
      headers: this.getHeaders(),
    };

    if (payload && payload instanceof FormData) {
      params.body = payload;
      // NOTE:
      // Do not set 'Content-Type' - browser will automatically do this.
      // Problem is in a 'boundary'.
      // http://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    } else if (payload) {
      params.body = JSON.stringify(payload);
      params.headers['Content-Type'] = JSON_RESPONSE_TYPE;
    }

    const fullpath = this.apiHost + path;
    return fetch(fullpath, params)
      .then(res => {
        return res.text()
          // Protection from empty response
          .then(text => text ? JSON.parse(text) : {})
          .then(json => ({ ok: res.ok, status: res.status, json }))
      })
      .then((res) => {
        if (this.checkStatusError(res)) {
          if (typeof callback === 'function') {
            callback(res.json);
          }
        }
        return res.json;
      });
  }

  doGet(path, payload = {}, callback) {
    // Path with attached GET params
    let pathWithParams;
    // Callback, taking in account function overloads
    let resolvedCb;

    if (typeof payload === 'function') {
      // If used function overload: doGet(path, callback)
      pathWithParams = path;
      resolvedCb = payload;
    } else {
      // If used full-version, with passed GET params
      const uri = new URI(path);
      uri.setSearch(payload);

      pathWithParams = uri.toString();
      resolvedCb = callback;
    }

    return this.sendRequest(METHODS.GET, pathWithParams, null, resolvedCb);
  }

  doPost(path, payload, callback) {
    return this.sendRequest(METHODS.POST, path, payload, callback);
  }

  doPut(path, payload, callback) {
    return this.sendRequest(METHODS.PUT, path, payload, callback);
  }

  doDelete(path, payload, callback) {
    return this.sendRequest(METHODS.DELETE, path, payload, callback);
  }

}
