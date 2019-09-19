import initAddingSession from '../modules/sessionid-in-url';
	
test('sessionid-in-url', () => {

	document.body.innerHTML =
		`<div id="content">
			
			<a href="https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html">Link</a>
			<a href="https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?depthSession=1">Link</a>

			<div class="js-related-post-after">
				<a href="https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html">Link</a>
			</div>
			<div class="js-related-post-after">
				<a href="https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?perelink">Link</a>
			</div>
		</div>`;
	initAddingSession('a');
	
	expect(document.querySelectorAll('a')[0].href,
	'TO PASS TEST OF THIS UNIT, YOU HAVE TO INCLUDE VARIABLE url IN COMMENTS IN THE FILE sessionid-in-url.js AND EXLUDE FROM COMMENTS ANOTHER ONE')
	.toBe("https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?amo_session=23925&utm_source=12345&utm_medium=Copy&depthSession=2");
	expect(document.querySelectorAll('a')[1].href)
	.toBe("https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?depthSession=2&amo_session=23925&utm_source=12345&utm_medium=Copy");
	expect(document.querySelectorAll('a')[2].href)
	.toBe("https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?amo_session=23925&utm_source=12345&utm_medium=Copy&perelink=151821&depthSession=2");
	expect(document.querySelectorAll('a')[3].href)
	.toBe("https://amomama.de/151821-heidi-klum-das-turbulente-leben-der-4-fa.html?perelink=151821&amo_session=23925&utm_source=12345&utm_medium=Copy&depthSession=2");
});