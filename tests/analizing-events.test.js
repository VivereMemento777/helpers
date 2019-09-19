import { data, idsEvent, getEventLabel, sendActionData } from '../modules/analizing-events';
import { getElement, setListener } from '../utils';

const clientId = 111;
const mockGaTracker = {
	getAll: () => [{clientId, get(val) {return this[val]}}]
};
const mockSendActionData = jest.fn(sendActionData);
const expectedTopNews1 = {
	"eventAction": "TopNews1Clicked",
	"eventCategory": "PostPageClicks",
	"eventLabel": clientId,
	"hitType": "click",
	"location": window.location.href,
	"title": "https://top-news-1.com/"
};
const expectedTopNews2 = {
	"eventAction": "TopNews2Clicked",
	"eventCategory": "PostPageClicks",
	"eventLabel": clientId,
	"hitType": "click",
	"location": window.location.href,
	"title": "https://top-news-2.com/"
}
const expectedRelatedInside = {
	"eventAction": "RelatedPostInTextClicked",
	"eventCategory": "PostPageClicks",
	"eventLabel": clientId,
	"hitType": "click",
	"location": window.location.href,
	"title": "https://js-related-inside.com/"
}
test('analizing-events', () => {
	window.__gaTracker = mockGaTracker;
	document.body.innerHTML =
		`<div id="top-news-1">
			<a href="https://top-news-1.com">
				<span>EXAMPLE<span />
			</a>
		</div>
		<div id="top-news-2">
			<a href="https://top-news-2.com">
				<span>EXAMPLE<span />
			</a>
		</div>
		<div data-test-number="12345">
			<div id="js-related-inside">
				<a href="https://js-related-inside.com">
					<span>EXAMPLE<span />
				</a>
			</div>
		</div>`;
	
	Object.keys(idsEvent).forEach(id => 
		getElement(`#${id}`)
			.map(setListener('click', e =>
			mockSendActionData({
					...data, eventAction: idsEvent[id]
				}, e.target))
			));

	expect(getEventLabel(window.__gaTracker)).toBe(clientId);
	expect(getEventLabel(undefined).isNothing()).toBeTruthy();

	// first click on span
	document.querySelector('#top-news-1 span').click();
	expect(mockSendActionData.mock.calls.length).toBe(1);
	expect(mockSendActionData.mock.results[0].value.valueOf()).toEqual(expectedTopNews1);

	document.querySelector('#top-news-2 span').click();
	expect(mockSendActionData.mock.calls.length).toBe(2);
	expect(mockSendActionData.mock.results[1].value.valueOf()).toEqual(expectedTopNews2);
	
	document.querySelector('#js-related-inside span').click();
	expect(mockSendActionData.mock.calls.length).toBe(3);
	expect(mockSendActionData.mock.results[2].value.valueOf()).toEqual(expectedRelatedInside);

	// first click on link
	document.querySelector('#top-news-1 a').click();
	expect(mockSendActionData.mock.calls.length).toBe(4);
	expect(mockSendActionData.mock.results[3].value.valueOf()).toEqual(expectedTopNews1);

	document.querySelector('#top-news-2 a').click();
	expect(mockSendActionData.mock.calls.length).toBe(5);
	expect(mockSendActionData.mock.results[4].value.valueOf()).toEqual(expectedTopNews2);

	// third click on div
	document.querySelector('div#top-news-1').click();
	expect(mockSendActionData.mock.calls.length).toBe(6);
	expect(mockSendActionData.mock.results[5].value.isNothing()).toBeTruthy();

	document.querySelector('div#top-news-2').click();
	expect(mockSendActionData.mock.calls.length).toBe(7);
	expect(mockSendActionData.mock.results[6].value.isNothing()).toBeTruthy();
});