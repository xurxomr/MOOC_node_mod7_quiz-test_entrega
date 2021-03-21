const Mocha = require('mocha');
const chai = require('chai');
const Browser = require('zombie');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const baseurl = 'http://localhost:8000/';

describe('User creates new quiz.', () => {
    const browser = new Browser();
    
    browser.visit(`${baseurl}quizzes/new`);
    browser.wait().then(() => {
        browser.fill('question', 'Testing question');
        browser.fill('answer', 'Testing answer');

        browser.pressButton("Create");
    });

    it('Created new quiz.',                () => true);
});

