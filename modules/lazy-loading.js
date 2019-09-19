import sticky from './sticky';
import {
	getElements,
	applyForEach,
	Maybe,
	addClass,
	setAttribute,
	path,
	compose,
	once
} from '../utils';



const options = {
	rootMargin: "25px",
	threshold: 0.1
};

const setSrc = elem => 
	compose(
		setAttribute('src'),
		path(['dataset', 'src']),
    )(elem);

const handlerLazy = entries => {
    entries.forEach(({target, intersectionRatio}) => {
        Maybe(intersectionRatio >= 0.1 && target)
			.map(compose(unobserve, addClass('loaded'), setSrc(target)))
    });
};

const io = new IntersectionObserver(handlerLazy, options);
const observe = io.observe.bind(io);
const unobserve = io.unobserve.bind(io);

const initLazy = selector => {
	getElements(selector)
        .map(applyForEach(observe))
        .map(sticky);
};

initLazy(".lazy");
export default  initLazy;
