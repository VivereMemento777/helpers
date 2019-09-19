import {
	getElement,
	Maybe,
	addClass,
	removeClass,
	setStyle,
	prop,
	setListener,
	compose,
	setValue,
	invoke,
	sendData,
	once,
} from '../utils';

const video = getElement('.video');
const videoWrap = getElement('.video__wrapper');
const aside = getElement('.aside--right');
const videoContent = getElement('#video-content');
const videoContentBg = getElement('#video-content-bg');
const btnMute = getElement('#btn-mutted');
const btnClose = getElement('#btn-close');
const targetFooter = getElement('footer');
const optionsVideo = {
	threshold: [0.7]
};
const optionsFooter = {
	threshold: [0.1]
};
const eventOptions = {
	eventCategory: 'Video',
	title: getElement('.video__title').chain(prop('innerText')),
	location: window.location.href,
};
const send10Percent = once(sendData);
const send25Percent = once(sendData);
const send50Percent = once(sendData);
const send75Percent = once(sendData);
const send100Percent = once(sendData);
const sendEventProgress = ({target: {duration, currentTime}}) => {
	const percent = [10,25,50,75,100];
	const eventPoints = percent.map(point => Math.floor(Number(duration.toFixed()) * point / 100));
	
	if (eventPoints.includes(Math.floor(currentTime))) {
		const index = eventPoints.indexOf(Math.floor(currentTime));
		const options = {
			...eventOptions,
			eventAction: `${percent[index]}%`,
			eventLabel: 'Seen percent',
		};
		switch (percent[index]) {
			case 10:
				send10Percent(options);
				break;
			case 25:
				send25Percent(options);
				break;
			case 50:
				send50Percent(options);
				break;
			case 75:
				send75Percent(options)
				break;
			case 100:
				send100Percent(options)
				break;
			default:
				return false
		}
	}
};
const setHeightOfParent = elem =>
	(setStyle('height', `${elem.parentElement.clientHeight}px`, elem.parentElement), elem);
const unsetHeightOfParent = elem =>
	(setStyle('height', 'unset', elem.parentElement), elem);
const scrollVideoOnDesktop = isFixed => {
	Maybe(isFixed && !videoWrap.isNothing() && videoWrap.valueOf())
		.map(
			compose(
				addClass('video__wrapper--sticked'),
				setStyle('left', `${aside.chain(prop('offsetLeft'))}px`),
				setStyle('width', `${aside.chain(prop('offsetWidth'))}px`),
				setHeightOfParent))
		.map(() => btnClose.map(addClass('show')))
		.orElse( !videoWrap.isNothing() && videoWrap.valueOf() )
		.map(
			compose(
				unsetHeightOfParent,
				setStyle('left', '0'),
				setStyle('width', '100%'),
				removeClass('video__wrapper--sticked')))
		.map(() => btnClose.map(removeClass('show')))
};
const scrollVideoOnMobile = isFixed => {
	Maybe(isFixed && !videoWrap.isNothing() && videoWrap.valueOf())
		.map(
			compose(
				() => btnClose.map(addClass('show')),
				addClass('video__wrapper--sticked-mobile'),
				setStyle('cssText', ''),
				setHeightOfParent))
		.orElse( !videoWrap.isNothing() && videoWrap.valueOf() )
		.map(removeClass('video__wrapper--sticked-mobile'))
		.map(unsetHeightOfParent)
		.map(() => btnClose.map(removeClass('show')))
};

const ioHandlerForVideo = entries => {
	const [entry] = [...entries];
	const {
		intersectionRatio,
		boundingClientRect: { top },
	} = entry;

	Maybe(intersectionRatio <= 0.7 && top < 0)
		.map(scrollVideo)
		.orElse('false')
		.map(() => scrollVideo(false));
};
const ioHandlerForFooter = entries => {
	Maybe(entries[0].isIntersecting && !videoWrap.isNothing() && videoWrap.valueOf())
		.map(addClass('video__wrapper--sticked-to-footer'))
		.orElse( !videoWrap.isNothing() && videoWrap.valueOf() )
		.map(removeClass('video__wrapper--sticked-to-footer'))
};

const ioForVideo = new IntersectionObserver(ioHandlerForVideo, optionsVideo);
const ioForFooter = new IntersectionObserver(ioHandlerForFooter, optionsFooter);
video.map(ioForVideo.observe.bind(ioForVideo));


const scrollVideo = isFixed => {
	Maybe(window.innerWidth > 992)
        .map(() => {
			scrollVideoOnDesktop(isFixed);
			targetFooter.map(ioForFooter.observe.bind(ioForFooter));
		})
		.orElse('mobile mode')
        .map(() => {
			scrollVideoOnMobile(isFixed);
		})
};
const handlerClickOfMuted = (e) => {
	e.stopPropagation();
	videoContent
		.map(setValue('muted', false))
		.map(setValue('volume', '0.5'));
	btnMute.map(setStyle('display', 'none'));
	sendData({
		...eventOptions,
		eventAction: 'Mute',
		eventLabel: 'Click on mute button'

	});
};

const handlerChangeOfMuted = () => {
  Maybe(videoContent.valueOf().muted || videoContent.valueOf().volume === 0)
    .map(() => 
      	btnMute.map(setStyle('display', 'block')))
    .orElse('no mutted')
    .map(() => 
      	btnMute.map(setStyle('display', 'none')))
};

const handlerClickClose = (e) => {
	e.stopPropagation();
	scrollVideo(false);
	videoContent
		.map(setValue('muted', true))
		.map(invoke('pause'));
	videoWrap.map(removeClass('video__wrapper--sticked-to-footer'));
	targetFooter.map(ioForFooter.unobserve.bind(ioForFooter));
}

btnClose.map(setListener('click', handlerClickClose));
btnMute.map(setListener('click', handlerClickOfMuted));
videoContent
	.map(setListener('volumechange', handlerChangeOfMuted))
	.map(setListener('timeupdate', sendEventProgress))
	.map(setListener('pause', () => {
		videoContentBg.map(invoke('pause'));
		sendData({
			...eventOptions,
			eventAction: 'Pause',
			eventLabel: 'Click on pause button'

		});
	}))
	.map(setListener('play', () => {
		videoContentBg.map(invoke('play'));
		sendData({
			...eventOptions,
			eventAction: 'Play',
			eventLabel: 'Click on play button'

		});
	}))
