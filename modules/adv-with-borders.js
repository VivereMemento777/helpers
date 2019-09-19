import { getElement, getElements, addClass, applyForEach } from '../utils';

const makeAdvBorder = (selector) =>
    getElement('#adv-line-block')
        .chain(() => getElements(selector))
        .map(arr => arr.filter(el => el.id !== 'adv-anchor-block'))
        .map(applyForEach(addClass('adv--bordered')));

makeAdvBorder('.adv');
export default makeAdvBorder;