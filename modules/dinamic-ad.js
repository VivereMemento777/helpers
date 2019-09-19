import {
	Maybe,
	addClass,
	compose,
	getElement,
	path,
	once,
	setStyle,
	prop,
	inequality,
	invoke,
} from '../utils';

const options = {
	rootMargin: "25px",
	threshold: [0.5]
};

const isInfiniteScroll = getElement('.next-post-link[data-next-post-new-link]');
const pointToStopAddingAd = getElement('.gallery-pagination');
const adContainerRight = getElement('.aside--right [data-number-pixel-to-load-new-adv-slot]');
const adContainerLeft = getElement('.aside--left [data-number-pixel-to-load-new-adv-slot]');
const asideLeft = getElement('.aside--left');
const asideRight = getElement('.aside--right');
const spaceBetweenAd = adContainerRight
						.map(compose(Number, path(['dataset', 'numberPixelToLoadNewAdvSlot'])))
						.valueOf();
const slotAdressRight = adContainerRight.map(path(['dataset', 'slot'])).valueOf();
const slotAdressLeft = adContainerLeft.map(path(['dataset', 'slot'])).valueOf();
const generateId = id => {
	let index = 0;
	return {
		getId() {
			index++;
			return id + index
		}
	}
};
const setSlotPossition = () => {
    const advRightBlocks = getElement('.aside--right .without-to-fix');
	const advLeftBlocks = getElement('.aside--left .without-to-fix');
    const asideLeftHeight = getElement('.aside--left').chain(prop('clientHeight'));
    const asideRightHeight = getElement('.aside--right').chain(prop('clientHeight'));
	const inq = inequality(asideLeftHeight, asideRightHeight);
 
    if (inq > 0) {
        advRightBlocks.map(setStyle('marginTop', `${inq}px`));
    } else {
        advLeftBlocks.map(setStyle('marginTop', `${-inq}px`));
    }
};
const onceSetSlotPossition = once(setSlotPossition);
const generateIdForSidebarAd = generateId('sidebarAd_');
const createElementForAd = space => id => {	
	const slotDiv = document.createElement('div');
	slotDiv.id = id;
	slotDiv.style.cssText = `min-height: 300px; min-width: 300px; margin-top: ${space}px`;
	return slotDiv;
};
const initAdFor = slotAdress => slotName => {
	googletag.cmd.push(function() {
		const slot = googletag.defineSlot(slotAdress, [[160, 600], [300, 250], [300, 600]], slotName)
		.addService(googletag.pubads());

		googletag.display(slotName);
		googletag.pubads().refresh([slot]);
	});

	googletag.cmd.push(function () {
        googletag.display(slotName);
        if (typeof refreshBid === "function") {
            refreshBid(slotName);
        }
	});
};
const createElemWithId = compose(
	createElementForAd(spaceBetweenAd),
	generateIdForSidebarAd.getId
);

const addAdOnPage = () => {
	onceSetSlotPossition();
	asideRight
		.map(
			compose(
				initAdFor(slotAdressRight),
				prop('id'),
				initIO,
				invoke('appendChild', createElemWithId())
			)
		)
	asideLeft
		.map(
			compose(
				initAdFor(slotAdressLeft),
				prop('id'),
				invoke('appendChild', createElemWithId())
			)
		)
 };
 function initIO(elem) {

	const handlerAddAd = entries => {
		entries.forEach(({
			target,
			intersectionRatio,
			boundingClientRect: { top },
		}) => {
			Maybe(intersectionRatio <= 0.5 && top < 0 && target)
				.map(compose(unobserve, addClass('completed')))
				.map(addAdOnPage)
				.map(() => pointToStopAddingAd.map(ioForStopAddingAd.unobserve.bind(ioForStopAddingAd)))
		});
	};

	const io = new IntersectionObserver(handlerAddAd, options);
	const observe = io.observe.bind(io);
	const unobserve = io.unobserve.bind(io);
	const ioForStopAddingAd = new IntersectionObserver((entries) => {
		Maybe(entries[0].intersectionRatio > 0.1 && elem).map(unobserve);
	}, {threshold: 0.1, rootMargin: "25px",});
	Maybe(isInfiniteScroll.isNothing())
		.map(() => pointToStopAddingAd.map(ioForStopAddingAd.observe.bind(ioForStopAddingAd)))

	observe(elem);

	return elem;
};

getElement('.aside--right .without-to-fix').map(initIO)
	
