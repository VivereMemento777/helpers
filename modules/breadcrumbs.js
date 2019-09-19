import { getElement, compose, curry, path, prop, Maybe, inequality, addClass, trace } from '../utils';
import { setInnerHtml, toOneDigit, addDots, dots, lessThen } from './related-post';

const title = getElement('#breadcrumbs-title');
const siblings = [];

const getSibling = (el = {}) => {
    if (el.previousElementSibling) {
        siblings.push(el.previousElementSibling);
        getSibling(el.previousElementSibling);
    } 
    return;
};
getSibling(title.valueOf());

const getWidth = arr => arr.reduce((acc, el) => acc + el.offsetWidth, 0);
const getSiblingWidth = getWidth(siblings);
const letterSize = 7.3;
const countOfString = 1;
const devideBy = curry((by, num) => num / by); 
const multBy = curry((by, num) => num * by); 
const titleText = title.map(prop('innerText')).valueOf();
const includeDots = multBy(letterSize, dots.length);
const sizeOfcut = size => inequality(size,includeDots);
const devideByLetterSize = size => devideBy(letterSize, size);
const cutTo = compose(Number, toOneDigit, devideByLetterSize, sizeOfcut);
const cuttingString = curry((str, to) => str.slice(0, to));
const widthOfParent = compose(multBy(countOfString), path(['parentElement', 'clientWidth']));
const widthOfParentPiece = (elem) => widthOfParent(elem) - getSiblingWidth;
const lengthOfText = compose(multBy(letterSize), path(['innerText', 'length']));
const isWidthLessThenLength = elem => widthOfParentPiece(elem) < lengthOfText(elem) ? elem : false;
const inequalityOfWidthAndLength = elem => inequality(widthOfParentPiece(elem), lengthOfText(elem));
const cutAndSetInnerHtml = (elem = {}) => {
    Maybe(isWidthLessThenLength(elem))
            .map(compose(cuttingString(titleText), cutTo, inequalityOfWidthAndLength))
            .map(compose(setInnerHtml(elem), addDots))
}

cutAndSetInnerHtml(title.valueOf());