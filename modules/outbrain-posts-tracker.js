import { getElements, setListener, sendData, applyForEach, Maybe, trace } from '../utils';

const dataOutbrain = {
    eventAction: 'OutbrainPostClicked',
    eventCategory: 'PostPageClicks',
    hitType: 'event',
    location: window.location.href
}

const outbrainHandler = () => {
    sendData({
        ...dataOutbrain,
        location: window.location.href});
}

export const setOutbrainListener = (selector) => {
    setTimeout(() => {
        getElements(selector)
            .map(applyForEach(setListener('click', outbrainHandler)))
    }, 5000);
  }

setOutbrainListener('.ob-dynamic-rec-container');