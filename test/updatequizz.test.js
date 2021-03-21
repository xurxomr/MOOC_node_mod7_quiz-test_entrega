const Mocha = require('mocha');
const chai = require('chai');
const Browser = require('zombie');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const baseurl = 'http://localhost:8000/';

describe('User visits the update quiz page.', () => {
    const browser = new Browser();
    
    before(() => browser.visit(`${baseurl}quizzes/1/edit`));

    it('should be successful.',                () => browser.assert.success());
    it('should see the update quizz page.',    () => browser.assert.url({pathname: '/quizzes/1/edit'}));

    it("Form must be POST method",              () => browser.assert.attribute('form', 'method', 'POST'));
    it("Page must contain 3 inputs (2 text + 1 submit)", () => browser.assert.elements('input', { atLeast: 3 }))

    it("Question must contain value 'Capital of Italy'", () => browser.assert.input('form input[name=question]', 'Capital of Italy'));
    it("Answer must contain value 'Rome'",               () => browser.assert.input('form input[name=answer]', 'Rome'))
});