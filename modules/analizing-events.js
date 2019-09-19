import { 
	setListener,
	getElement,
	Maybe,
	getParent,
	prop,
	sendData,
	first,
	compose,
	invoke,
	curry
} from '../utils';

export const data = {
	hitType: 'click',
	eventCategory: "PostPageClicks",
	eventAction: "action",
	title: 'href',
	location: window.location.href
};

export const getEventLabel = tracker => 
				Maybe(tracker)
					.chain(compose(Maybe, first, invoke('getAll', null)))
					.map(invoke('get', 'clientId'))
					.valueOf();

export const sendActionData = curry((data, target) => 
				Maybe(getParent('A')(target))
					.map(prop('href'))
					.map(href => ({
						...data,
						title: href,
						eventLabel: getEventLabel( window.__gaTracker)
					}))
					.map(sendData))
	
export const idsEvent = {
	'top-news-1': 'TopNews1Clicked',
	'top-news-2': 'TopNews2Clicked',
	'popular-news': 'TopNews1Clicked',
	'js-related-after': 'RelatedPostAfterTextClicked',
	'js-related-inside': 'RelatedPostInTextClicked',
	'js-latest': 'LatestPostAfterTextClicked'
};

Object.keys(idsEvent).forEach(id => 
	getElement(`#${id}`)
		.map(setListener('click', e =>
			sendActionData({
				...data, eventAction: idsEvent[id]
			}, e.target))
		));