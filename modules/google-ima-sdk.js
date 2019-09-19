import { once } from '../utils';
const videoContent = document.getElementById('video-content');
const containerForAd = document.getElementById('video-ad');

if (videoContent) {
	const adDisplayContainer =
		new google.ima.AdDisplayContainer(
			document.getElementById('video-ad'),
			videoContent);
	// Must be done as the result of a user action on mobile
	adDisplayContainer.initialize();

	// Re-use this AdsLoader instance for the entire lifecycle of your page.
	const adsLoader = new google.ima.AdsLoader(adDisplayContainer);

	// Add event listeners
	adsLoader.addEventListener(
		google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
		onAdsManagerLoaded,
		false);
	adsLoader.addEventListener(
		google.ima.AdErrorEvent.Type.AD_ERROR,
		onAdError,
		false);

	function onAdError(adErrorEvent) {
	// Handle the error logging and destroy the AdsManager
	console.log(adErrorEvent.getError());
	adsManager.destroy();
	}

	// An event listener to tell the SDK that our content video
	// is completed so the SDK can play any post-roll ads.
	const contentEndedListener = function() {
		const src = videoContent.querySelector('source').src;
		videoContent.src = src;
		adsLoader.contentComplete();
		containerForAd.classList.remove('video__ad--visible');
	};
	videoContent.onended = contentEndedListener;

	// Request video ads.
	const adsRequest = new google.ima.AdsRequest();
	adsRequest.adTagUrl = `${videoContent.dataset.adUrl}&description_url${encodeURI(window.location.href)}`;

	function requestAds() {
		adsLoader.requestAds(adsRequest);
	}

	function onAdsManagerLoaded(adsManagerLoadedEvent) {
		// Get the ads manager.
		window.adsManager = adsManagerLoadedEvent.getAdsManager(videoContent);  // See API reference for contentPlayback
	
		// Add listeners to the required events.
		adsManager.addEventListener(
			google.ima.AdErrorEvent.Type.AD_ERROR,
			onAdError);
		adsManager.addEventListener(
			google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
			onContentPauseRequested);
		adsManager.addEventListener(
			google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
			onContentResumeRequested);
	
		try {
			// Initialize the ads manager. Ad rules playlist will start at this time.
			adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
			// Call start to show ads. Single video and overlay ads will
			// start at this time; this call will be ignored for ad rules, as ad rules
			// ads start when the adsManager is initialized.
			adsManager.start();
		} catch (adError) {
			// An error may be thrown if there was a problem with the VAST response.
			// Play content here, because we won't be getting an ad.
			videoContent.play();
		}
	};
	
	function onContentPauseRequested() {
		// This function is where you should setup UI for showing ads (e.g.
		// display ad timer countdown, disable seeking, etc.)
		videoContent.removeEventListener('ended', contentEndedListener);
		videoContent.pause();
		containerForAd.classList.add('video__ad--visible');
	};
	
	function onContentResumeRequested() {
		// This function is where you should ensure that your UI is ready
		// to play content.
		videoContent.addEventListener('ended', contentEndedListener);
		videoContent.play();
		containerForAd.classList.remove('video__ad--visible');
	};

	const onceRequestAds = once(() => {
		requestAds();
		videoContent.removeEventListener('timeupdate', onceRequestAds);
		sendData({
			eventCategory: 'Video',
			title: document.querySelector('.video__title').innerText,
			location: window.location.href,
			eventAction: 'Start',
			eventLabel: 'Start playing'

		});
	});

	videoContent.addEventListener('timeupdate', onceRequestAds);

	// videoContent.play().then(() => {
	// 	requestAds();
	// 	sendData({
	// 		eventCategory: 'Video',
	// 		title: document.querySelector('.video__title').innerText,
	// 		location: window.location.href,
	// 		eventAction: 'Start',
	// 		eventLabel: 'Start playing'

	// 	});
	// }).catch(error => {
	// 	console.error('autoplay faild', error);
	// })
}