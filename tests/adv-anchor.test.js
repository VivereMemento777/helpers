import { getElement, setListener, setStyle, path } from '../utils';

const mockListener = jest.fn(setListener('click', () => 
	getElement('#adv-anchor-block').map(setStyle('display','none'))))
	
test('adv-anchor', () => {

	 document.body.innerHTML =
		`<div id="adv-anchor-block">
			<span id="username" />
			<button id="close-anchor-btn" />
		</div>`;

	getElement('#close-anchor-btn').map(mockListener);

	document.getElementById('close-anchor-btn').click();

	expect(
		getElement('#adv-anchor-block')
			.map(path(['style', 'display']))
			.valueOf()
	).toBe('none');
	expect(mockListener.mock.calls.length).toBe(1);
});