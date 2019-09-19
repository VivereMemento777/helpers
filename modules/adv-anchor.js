import { getElement, setListener, setStyle } from '../utils';

getElement('#close-anchor-btn')
	.map(setListener('click', () => 
		getElement('#adv-anchor-block').map(setStyle('display','none'))));