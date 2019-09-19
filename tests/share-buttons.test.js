import { getElement, setListener, prop } from '../utils';
import { shareButtons, sendSocialData } from '../modules/share-buttons';

const fbHref = 'https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.html?pk_campaign=ush';
const twitterHref = 'https://www.twitter.com/share?url=https://www.twitter.html';

test('share-buttons', () => {
	document.body.innerHTML =
		`<div id="wrapper">
			<div id="example">
				<a href="/" data-social="twitter" data-url="https://www.twitter.html">
					<span>EXAMPLE<span />
				</a>
			</div>
			<div id="example-2">
				<a href="/" data-social="facebook" data-url="https://www.facebook.html">
					<span>EXAMPLE<span />
				</a>
			</div>
		</div>`;

	getElement('#wrapper')
		.map(setListener('click', e => shareButtons(e)));
	// click on element inside link to twitter
	document.querySelector('#example span').click();
	expect(getElement('#example a').map(prop('href')).valueOf()).toBe(twitterHref);
	// click on element inside link to facebook
	document.querySelector('#example-2 span').click();
	expect(getElement('#example-2 a').map(prop('href')).valueOf()).toBe(fbHref);
	// click on link
	document.querySelector('#example-2 a').click();
	expect(getElement('#example-2 a').map(prop('href')).valueOf()).toBe(fbHref);
	// click on element inside wrapper
	document.querySelector('#wrapper').click();
	expect(shareButtons({}).isNothing()).toBeTruthy();
});