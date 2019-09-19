import {curry, compose, split, applyForEach, qsAll as getAll, first, last, sum, Maybe, getElement, getElements, path, setAttribute, flip, qs, prop, trace} from '../utils';

const amoSession = 'amo_session';
const depthSession = 'depthSession';
const perelinkSession = 'perelink';
const utmSource = 'utm_source';
const utmMedium = 'utm_medium';
const fbqIndexes = [2,3,4];
const locationObj = window.location;
const url = locationObj.href;
// to pass test of this unit you have to include variable url above in comments
// and exclude from comments variable bellow
// const url = '/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?amo_session=23925&utm_source=12345&utm_medium=Copy&depthSession=1&perelink12345last6789';
// ======================>
const isNan = compose(isNaN, parseFloat);
const addOne = value => sum(1, value);
const increment = compose(addOne, parseFloat);
const incrementDepthSession = str => isNan(str) ? str : increment(str);
const createRegExp = lable => new RegExp(`${lable}=?[0-9]*[A-Za-z]*_?[a-z]*[0-9]*`, 'g');
const regExpOfAmoSession = createRegExp(amoSession);
const regExpOfDepthSession = createRegExp(depthSession);
const regExpOfPerelinkSession = createRegExp(perelinkSession);
const regExpOfUtmSource = createRegExp(utmSource);
const regExpOfUtmMedium = createRegExp(utmMedium);
const searchingMatches = curry((regExp, str) => str.match(regExp));
const findAmoSession = compose(first, searchingMatches(regExpOfAmoSession));
const findUtmSource = compose(first, searchingMatches(regExpOfUtmSource));
const findUtmMedium = compose(first, searchingMatches(regExpOfUtmMedium));
const findDepthSession = compose(first, searchingMatches(regExpOfDepthSession));
const sessionDepth = findDepthSession(url);
const incrementedSessionDepth = sessionDepth && sessionDepth.split('=').map(incrementDepthSession).join('=');
const getDepth = compose(parseFloat, last, split('='));
const sessionAmo = findAmoSession(url);
const sourceUtm = findUtmSource(url);
const mediumUrm = findUtmMedium(url);
const combinedUtm = `${sourceUtm}&${mediumUrm}`
const addSession = curry((regExp, sessionId, link) => {
	const linkHref = url.split('#').length > 1 ? link.href.split('?').join('#') : link.href;
	
	searchingMatches(regExp)(link.href)
		? link.href = linkHref.replace(regExp, sessionId)
		: linkHref.split('#').length > 1 || linkHref.split('?').length > 1
			? link.href = `${linkHref}&${sessionId}`
			: link.href = `${linkHref }${url.split('?').length > 1 ? '?' : '#'}${sessionId}`
});
const addSessionAmo = addSession(regExpOfAmoSession, sessionAmo);
const addSessionDepth = addSession(regExpOfDepthSession, incrementedSessionDepth);
const addSessionPerelink = addSession(
	regExpOfPerelinkSession,
	'perelink=' + window.location.pathname.match(/^\/[0-9]*/g)[0].split('/')[1]);
const addUtm = addSession(regExpOfUtmSource, combinedUtm);
const findDepthInFbqIndexes = num => Maybe(fbqIndexes.find(n => n === num));
const sendFBQ = num => {
	try {
		fbq('track', "ViewContent", {
			sessionCountViews: num,
		})
	} catch {
		console.error('something wrong with fbq'.toUpperCase());
	}
};

export default function initAddingSession(selector = 'a') {
	if (sessionAmo) {
		compose(applyForEach(addSessionAmo), getAll)(`${selector}`);
		compose(applyForEach(addSessionPerelink), getAll)(`.js-related-post-after ${selector}`);
	};
	if (sourceUtm) compose(applyForEach(addUtm), getAll)(`${selector}`);
	if (sessionDepth) compose(applyForEach(addSessionDepth), getAll)(`${selector}`);
};

initAddingSession('a');
Maybe(sessionDepth)
	.map(getDepth)
	.chain(findDepthInFbqIndexes)
	.map(sendFBQ)

const slideLinkRegExp = /\#slide=[0-9]&/g;
const joinWithQuestion = rg => str => str.match(rg)[0].split('#')[1].split('&').map(i => '?' + i + '#')[0];
const replaceHash = rg => str => str.replace(rg, joinWithQuestion(rg)(str));
const joinWithParams = params => str => str + '#' + params;
const replacedPageWithQuestion = (data, dataSet) =>
		getElements('.next-post-link')
			.map(elems => elems.map(elem => compose(
				flip(setAttribute(data), elem), 
				joinWithParams(url.split('#')[1]),
				path(['dataset', dataSet]))(elem)
			))

const replacedUrlWithQuestion = () => 
		getElement('.do-not-show')
			.map(path(['dataset', 'pageUrl']))
			.map(str => str.split('?').join('#'))
			.map(flip(setAttribute('data-page-url'), qs('.do-not-show')))

const replacedHashInSlideLink = () =>
	getElement('.gallery-pagination__item .btn')
		.map(trace('this is btn'))
		.map(elem => compose(
			flip(setAttribute('href'), elem),
			replaceHash(slideLinkRegExp),
			prop('href')
		)(elem))
			
Maybe(url.split('#').length > 1)
	.map(() => replacedPageWithQuestion('data-next-post-link', 'nextPostLink'))
	.map(() => replacedPageWithQuestion('data-next-post-new-link', 'nextPostNewLink'))
	.map(replacedUrlWithQuestion)
	.map(replacedHashInSlideLink)
	
