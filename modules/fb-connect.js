const fbConnect = function (d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src =
        'https://connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v3.1&appId=151713092204898&autoLogAppEvents=1';
    fjs.parentNode.insertBefore(js, fjs);
};

export default fbConnect(document, 'script', 'facebook-jssdk');