import { curry, Maybe, prop, setListener, getParent, compose } from '../utils';

const storage = Maybe(window.localStorage);
const initialState = {
	duration: 0,
	isLink:false,
	timer: null,
	isTargeting: false,
};
const merge = curry((newData, prevData) => ({...prevData, ...newData}));
const getItem = val => storage.map(store => store.getItem(val)).valueOf();
const setItem = curry((val, state) => storage.map(store => store.setItem(val, state)));
const toJson = value => JSON.stringify(value);
const fromJson = value => JSON.parse(value);
const sessionName = 'amoSession';
const minutes = [120, 180, 240, 300];
const incrementDuration = obj => ({...obj, duration: obj.duration + 1});
const isIncluded = curry((arr, val) => arr.includes(val) ? val : false);
const isLink = compose(
	Maybe,
	prop('isLink'),
	fromJson
);
const isEnoughDuration = compose(
	Maybe,
	isIncluded(minutes),
	prop('duration'),
	fromJson
);
const sendFBQ = num => {
	try {
		fbq('track', "ViewTime", {time: num,})
	} catch {
		console.error('SOMETHING WRONG WITH fbq');
	}
}

const cleaningInterval = data => (clearInterval(data.timer), data);
const setData = curry((name, ...rest) => compose(
	setItem(name),
	toJson,
	...rest,
	fromJson
));
const handleData = name => (...args) => (
	Maybe(getItem(name))
		.map(
			setData(name, ...args)
		)
);
const handleAmoSessionData = handleData(sessionName);
const clickHandler = event => {
	Maybe(getParent('A', event.target))
		.map(() =>
			handleAmoSessionData(
				cleaningInterval,
				merge({isLink: true}),
			)
		)
};

const sendAction = name => (
	Maybe(getItem(name))
		.chain(isEnoughDuration)
		.map(sendFBQ)
);

const countDuration = () => (
	handleAmoSessionData(
		merge({
			isLink: false,
			isTargeting: false,
		}),
		incrementDuration
	)
);

const intervalHandler = () => {
	countDuration(sessionName);
	sendAction(sessionName);
};
					
const startInterval = () => {
	handleAmoSessionData(
		merge({
			timer: setInterval(intervalHandler, 1000)
		})
	)
};

const initSessionToStorage= name => {

	Maybe(getItem(name))
		.chain(isLink)
		.orElse(initialState)
		.map(compose(setItem(name),toJson))

	startInterval();
};

initSessionToStorage(sessionName);
Maybe(document)
	.map(setListener('click', clickHandler))