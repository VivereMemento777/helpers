import { 
    getElement,
    getElements,
    path,
    setStyle,
    curry,
    compose,
    sum,
    inequality,
    once,
    addClass,
    removeClass,
    prop,
} from '../utils';

function setSlotPossition() {
    const advRightBlocks = getElement('.aside--right .toFix');
	const advLeftBlocks = getElement('.aside--left .toFix');
    const asideLeftHeight = getElement('.aside--left').chain(prop('clientHeight'));
    const asideRightHeight = getElement('.aside--right').chain(prop('clientHeight'));
    const inq = inequality(asideLeftHeight, asideRightHeight);

    if (inq > 0) {
        advRightBlocks.map(prop('previousElementSibling')).map(setStyle('paddingBottom', `${inq}px`));
    } else {
        advLeftBlocks.map(prop('previousElementSibling')).map(setStyle('paddingBottom', `${-inq}px`));
    }
};
const onceSetSlotPossition = once(setSlotPossition);

const topMargin = 20;
const getHeight = compose(
    parseFloat,
    path(['height']),
    getComputedStyle
)
const navScrollHeight = getElement('.nav-scroll')
                            .map(getHeight)
                            .valueOf();

const targetAd = getElement('.aside--right .toFix');
const targetSiblingAd = targetAd.map(path(['previousElementSibling']));
const targetFooter = getElement('footer');
const elementsToFix = getElements('.toFix');

const optionsAd = {
    root: null,
    rootMargin: '0px',
    threshold: [0.1]
};

const optionsFooter = {
    root: null,
    rootMargin: '0px',
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
};

const toggleClass = curry((targetArr, entries) => {
    0.1 > entries[0].intersectionRatio > 0 && entries[0].boundingClientRect.top < 0
        ? targetArr
            .map(targets => {
                targets.map(el => {
                    onceSetSlotPossition();
                    addClass('sticky', el);
                    setStyle('top', `${sum(navScrollHeight, topMargin)}px`, el)
                })
            })
        : targetArr.map(arr => {arr.map(removeClass('sticky'))})
});
const setTop = curry((targets, entries) => {
    const targetsHeight = targets.map(arr => arr.map(getHeight)).valueOf();
    const maxHeightIndex = targetsHeight.indexOf(Math.max(...targetsHeight));
    const minHeightIndex = targetsHeight.indexOf(Math.min(...targetsHeight));
    const filteredTargetsByHeight = targetsHeight[maxHeightIndex] === targetsHeight[minHeightIndex] ? targets : [].concat(targets[maxHeightIndex]);
    const { bottom, height} = entries[0].boundingClientRect;
    inequality(bottom,height,targetsHeight[maxHeightIndex],navScrollHeight,topMargin) < 0
        ? filteredTargetsByHeight.map(
            arr => arr.map(setStyle('top', `${inequality(bottom,height,targetsHeight[maxHeightIndex],navScrollHeight)}px`)))
        : filteredTargetsByHeight.map(
            arr => arr.map(setStyle('top', `${sum(navScrollHeight, topMargin)}px`)))
})

const handlerForTargetAd = toggleClass(elementsToFix);

const handlerForTargetFooter = setTop(elementsToFix);

const handleScrollForNew = () => {
    const observerFooter = new IntersectionObserver(handlerForTargetFooter, optionsFooter);
    const observerAd = new IntersectionObserver(handlerForTargetAd, optionsAd);

    targetFooter.map(observerFooter.observe.bind(observerFooter));
    targetSiblingAd.map(observerAd.observe.bind(observerAd));
};

export default once(handleScrollForNew);
