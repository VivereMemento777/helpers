import { getElements, prop, Maybe, curry, applyForEach, compose, path, setListener, inequality, map } from "../utils";
const letterSize = 8;
const countOfString = 2;
export const dots = '...';
const bindMapTo = monad => monad['map'].bind(monad);
export const devideBy = curry((by, num) => num / by);
const multBy = curry((by, num) => num * by);
const relatedLinks = getElements('.js-related-link');
const linksText = relatedLinks.map(map(compose(Maybe, prop('innerText')))).valueOf();
export const setInnerHtml = curry((elem, value) => elem.innerHTML = value);
const includeDots = multBy(letterSize, dots.length);
const sizeOfcut = size => inequality(size,includeDots);
const devideByLetterSize = size => devideBy(letterSize, size);
export const toOneDigit = num => num.toFixed();
const cutTo = compose(Number, toOneDigit, devideByLetterSize, sizeOfcut);
const cuttingString = curry((to, str) => str.slice(0, to));
const widthOfParent = compose(multBy(countOfString), path(['parentElement', 'clientWidth']));
const lengthOfText = compose(multBy(letterSize), path(['innerText', 'length']));
const lessThen = curry((a,b) => a > b);
export const addDots = str => str.concat(dots);
const isWidthLessThenLength = elem => widthOfParent(elem) < lengthOfText(elem) ? elem : false;
const inequalityOfWidthAndLength = elem => inequality(widthOfParent(elem), lengthOfText(elem));
const cutAndSetInnerHtml = (elem, index) => {
    Maybe(isWidthLessThenLength(elem))
            .chain(compose(bindMapTo(linksText[index]), cuttingString, cutTo, inequalityOfWidthAndLength))
            .map(compose(setInnerHtml(elem), addDots))
            .orElse(linksText[index].valueOf())
            .map(setInnerHtml(elem))
}
const cutTextOfRelatedLinks = () => {
    relatedLinks.map(applyForEach(cutAndSetInnerHtml));
};
Maybe(compose(lessThen(576), prop('innerWidth'))(window))
    .map(cutTextOfRelatedLinks)
    .map(() => setListener('orientationchange', () => setTimeout(cutTextOfRelatedLinks, 100), window))