import {
	getElement,
	setListener,
	toggleClass,
	setAttribute,
	setStyle,
	sendData,
	Maybe,
	curry,
	setToLS,
	getFromLS,
	prop,
} from '../utils';

const dataBlockerPopup = {
  eventCategory: 'ad blocker popup',
  hitType: 'event',
  location: window.location.href
}

const TERM_SEVEN_DAYS = 604800000; // 7 days
const checkTerm = curry((term, data) => Date.now() - data >= term);
const checkTermForSevenDays = checkTerm(TERM_SEVEN_DAYS);    
const toggleScroll = val =>
	getElement('body')
		.map(setStyle('overflow', val))
 
const toggleElementsClass = className => (...selectors) =>
	selectors.forEach(selector => getElement(selector).map(toggleClass(className)));
const toggleShowPopup = toggleElementsClass('show-popup');

const showVideo = curry((selector, targetData) => (
	getElement(selector)
		.map(setStyle('height', '480px'))
		.map(setAttribute('src', `https://cdn.amomama.com/${targetData}.mp4`))))

const handlerRejectHelp = () => {
	toggleShowPopup('.ad-block-popup');
	toggleScroll('auto');
	sendData({
		...dataBlockerPopup,
		'eventAction': 'click',
		'eventLabel': 'clicked no'
	});
};

const handlerEcceptHelp = () => {
	toggleShowPopup('#ad-block-popup-help', '#ad-block-popup-main'), 
	sendData({
		...dataBlockerPopup,
		'eventAction': 'click',
		'eventLabel': 'add to whitelist'
	});
};

const handlerCloseHelp = () => {
	toggleShowPopup('#ad-block-popup-help', '.ad-block-popup');
	toggleScroll('auto');
	sendData({
		...dataBlockerPopup,
		'eventAction': 'close',
		'eventLabel': 'user closed popup'
	});
};

const showAdBlockerVideo = (e) => {
	Maybe(e.target.dataset.blocker) 
		.map(showVideo('.ad-block-popup__video'))
		.map(
			() => sendData({
				...dataBlockerPopup,
				'eventAction': 'click',
				'eventLabel': 'clicked on help'
			}),
		)
};
const btnListeners = {
	'#ad-block-popup-help': showAdBlockerVideo,
	'#ad-block-popup-close-help': handlerCloseHelp,
	'#ad-block-popup-btn-no': handlerRejectHelp,
	'#ad-block-popup-btn-yes': handlerEcceptHelp,
};

const showAdBlockerPopup = btns => {
	Object.entries(btns)
		.forEach(([id, handler]) => getElement(id).map(setListener('click', handler)));
		
	sendData({
		...dataBlockerPopup,
		'eventAction': 'view',
		'eventLabel': 'user received popup'
	});
	toggleShowPopup('#ad-block-popup-main', '.ad-block-popup');
	toggleScroll('hidden');
}	

const adBlockerPopupChecker = adBlockObj => 
	Maybe(checkTermForSevenDays(prop('dateOfShowPopup', adBlockObj)) || !adBlockObj)
		.map(() => showAdBlockerPopup(btnListeners))
		.map(() => setToLS('adBlockPopup', {'dateOfShowPopup': Date.now()}))

const whatTypeOfPopup = listeners =>
	getElement('#ad-block-popup-type1')
		.map(() => adBlockerPopupChecker(getFromLS('adBlockPopup')))
		.orElse('#ad-block-popup-type2')
		.chain(getElement)
		.map(() => showAdBlockerPopup(listeners))

getElement('#VHptATvIMsiS')
	.map(() => sendData({
		...dataBlockerPopup,
		'eventCategory': 'Ad Setting',
		'eventAction': 'Adblock',
		'eventLabel': 'Disabled'
	}))
	.orElse(btnListeners)
	.map(whatTypeOfPopup)
	.map(() => sendData({
		...dataBlockerPopup,
		'eventCategory': 'Ad Setting',
		'eventAction': 'Adblock',
		'eventLabel': 'Enabled'
	}));
