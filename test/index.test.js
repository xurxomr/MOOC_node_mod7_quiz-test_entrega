const Mocha = require('mocha');
const chai = require('chai');
const Browser = require('zombie');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const baseurl = 'http://localhost:8000/';

describe('User visits the quizzes index page.', () => {
    const browser = new Browser();
    
    before(() => browser.visit(`${baseurl}quizzes`));

    it('should be successful.',                 () => browser.assert.success()); // .error('WTF!!!')); 
    it('should see the quizzes index page.',    () => browser.assert.url({pathname: '/quizzes'}));
});
