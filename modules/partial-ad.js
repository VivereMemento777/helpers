import {
	getElement,
	getElements,
	curry,
	Maybe,
	compose,
	hasClass,
	setStyle,
	applyForEach,
	path,
	invoke,
	prop,
	removeClass,
} from '../utils';

const toggle = val => !val;
const checkForMark = curry((mark, str) => str.match(new RegExp(`${mark}`, 'g')));
const isAmoSessionMarkExist = compose(Maybe, toggle, checkForMark('amo_session'));
const equaleTo = curry((str, val) => str === val);
const removeElement = elem => elem.remove();
const removeEveryFourthAd = (ad, index) => {
	Maybe((index + 1) % 4 !== 0 && ad)
		.map(removeElement)
		.orElse(hasClass('adv--row', ad.parentElement) && ad.parentElement)
		.map(setStyle('gridTemplate', 'none'))
};

const filteredByDataName = arr => arr.reduce((acc, item) => {
	if (path(['firstChild', 'dataset', 'name'])(item)) {
		if (path(['firstChild', 'dataset', 'name'])(item) === 'end_article_last') {
			return acc;
		}
		acc[0].push(item);
		return acc
	} else {
		acc[1].push(item);
		return acc
	}
},[[],[]]);

const isSidebar_1 = compose(
		Maybe,
		equaleTo('sidebar_1'),
		path(['dataset', 'name']),
		prop('firstChild')
	);

const removeAdInSidebars = ad => 
	isSidebar_1(ad)
		.orElse(ad)
		.map(invoke('remove'))

const removeAdInContent = curry((fn, arr) => applyForEach(fn, arr));
const removeAdInArticle = selector => (_) =>
	getElements(selector)
		.map(filteredByDataName)
		.map(arr => (removeAdInContent(removeElement)(arr[0]), arr))
		.map(arr => removeAdInContent(removeEveryFourthAd)(arr[1]))

const removeAdInAside = () =>
	getElements('aside')
		.map(
			applyForEach(
				compose(
					removeAdInContent(removeAdInSidebars),
					invoke('querySelectorAll', '.adv')
				)
			)
		);
const removeContainerClassName = () => getElement('.container--with-two-aside').map(removeClass('container--with-two-aside'));
const removeLeftAside = () => getElement('.aside--left').map(removeElement);
const removeAdvAnchor = () => getElement('#adv-anchor-block').map(removeElement);
const ifArbitrageExist = getElement('#arbitrage-adv-script');
const ifAmoSessionNotExist = () => isAmoSessionMarkExist(window.location.href)

const initPartialAd = selector =>
	ifArbitrageExist
		.chain(ifAmoSessionNotExist)
		.map(
			compose(
				removeContainerClassName,
				removeLeftAside,
				removeAdvAnchor,
				removeAdInAside,
				removeAdInArticle(selector)
			)
		)

initPartialAd('.article-page .adv');

export default initPartialAd;