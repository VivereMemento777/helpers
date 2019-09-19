import {Maybe, getElements, applyForEach} from '../utils';

const options = {
	rootMargin: "25px",
	threshold: 0.1
};
let timers = {};

const handleRefreshAd = entries => {
    entries.forEach(({target, intersectionRatio}) => {
        Maybe(intersectionRatio >= 0.1 && target)
			.map(() => {
				const timer = setInterval(() => {
					target.style.minHeight = target.style.height + 'px';
					googletag.cmd.push(function() {
						googletag.pubads().refresh([gtmSlots[target.id]]);
						target.style.minHeight = 'unset';
					});
				}, Number(target.dataset.refreshTimeout));
				timers[target.id] = timer;
			})
			.orElse(target)
			.map(() => {
				clearInterval(timers[target.id]);
				delete timers[target.id];
			})
    });
};

const io = new IntersectionObserver(handleRefreshAd, options);
const observe = io.observe.bind(io);

const initRefreshAd = selector => {
	getElements(selector)
        .map(applyForEach(observe))
};

initRefreshAd('[data-refresh-timeout]');