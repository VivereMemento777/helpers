import {getElement, setListener, sendData, Maybe, addClass, removeClass} from '../utils';

import smoothscroll from 'smoothscroll-polyfill';

const btn = getElement('.totop-btn');

const analiticEventData = {
	eventCategory: 'PostPageClicks',
	hitType: 'event',
	location: window.location.href,
	eventAction: 'to-top button clicked',
};

const scrollTop = (e) => {
	e.stopPropagation();
	window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
	sendData(analiticEventData)
}

btn
	.map(setListener('click', scrollTop))
	.map(() => smoothscroll.polyfill());

const options = {
	rootMargin: "25px",
	threshold: [0.5]
};

function initIO(elem) {
	const handlerIO = entries => {
		entries.forEach(({
			target,
			intersectionRatio,
		}) => {
			Maybe(intersectionRatio <= 0.5 && target && !btn.isNothing() && btn.valueOf())
				.map(addClass('show'))
				.orElse(!btn.isNothing() && btn.valueOf())
				.map(removeClass('show'))
		});
	};

	const io = new IntersectionObserver(handlerIO, options);
	const observe = io.observe.bind(io);

	observe(elem);

	return elem;
};

getElement('html').map(initIO);