var assert = require('assert');
var Api = require('../../lib/es/api/index').Api;
fetch = require('node-fetch-polyfill');
FormData = require('form-data');
const isEqual = require('lodash/isEqual');

const token = 'test-header';
const tokenValue = 'test-header-value';
const testData = { foo: 'bar' };

function url(relativePath = 'get') {
  return `https://postman-echo.com/${relativePath}`;
}

function prepare() {
  const api = new Api();
  api.setAuthTokenHeader(token);
  api.setUserTokenGetter(() => tokenValue);
  api.setUnauthorizedHandler(() => {});

  return api;
}

describe('Request', () => {
  describe('#getters', () => {
    it('Should throw an error if any of \'setUserTokenGetter\', \'setUnauthorizedHandler\' had not been called', () => {
      const api = new Api();
      assert.throws(
        () => api.doGet(url()),
        Error
      );
    });
  })
  describe('#header', () => {
    it('Should set header of the request and add it to all AJAX calls', (done) => {
      prepare().doGet(url('headers'), {}, (result) => {
        try {
          assert.equal(result.headers[token], tokenValue);
          done();
        } catch(er) {
          done(er);
        }
      });
    });
    it('Should fail otherwise', (done) => {
      prepare().doGet(url('headers'), {}, (result) => {
        try {
          assert.equal(result.headers[token], 'tokenValue');
          done(`result[${token}] should not be equal to 'tokenValue' string`);
        } catch(er) {
          done();
        }
      });
    });
    it('Should return promise', (done) => {
      const result = prepare().sendRequest('GET', url());
      const isPromise = result.then;
      if (isPromise) {
        done();
      } else {
        done(`Request returned ${typeof result}`);
      }
    });
  });
});
describe('Methods', () => {
  describe('doGet', () => {
    it('Should perform GET request with the specified URL params', (done) => {
      const api = prepare();
      api.doGet(url('get'), testData, (result) => {
        const assertion = isEqual(result.args, testData);
        if (assertion) {
          done();
        } else {
          done(result.args);
        }
      });
    });
  });

  describe('doPost', () => {
    it('Should perform POST request with the specified data', (done) => {
      const api = prepare();
      api.doPost(url('post'), testData, (result) => {
        const assertion = isEqual(result.json, testData);
        if (assertion) {
          done();
        } else {
          done(result.json);
        }
      });
    });
  });

  describe('doPut', () => {
    it('Should perform PUT request with the specified data', (done) => {
      const api = prepare();
      api.doPut(url('put'), testData, (result) => {
        const assertion = isEqual(result.json, testData);
        if (assertion) {
          done();
        } else {
          done(result.json);
        }
      });
    });
  });

  describe('doDelete', () => {
    it('Should perform DELETE request', (done) => {
      const api = prepare();
      api.doDelete(url('delete'), testData, (result) => {
        const assertion = isEqual(result.json, testData);
        if (assertion) {
          done();
        } else {
          done(result.json);
        }
      });
    });
  });
});