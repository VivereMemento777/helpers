const form = document.querySelector('#dmca-form');
const formBlock = document.querySelector('.form-block');
const noneOfTheAbove = document.querySelector('.js-none-of-the-above');
const nameInput = document.getElementById('name-input');

if (!!form) {
    form.addEventListener('change', function (event) {
        const target = event.target;

        if (target.name === 'DmcaForm[type]') {
            switch (target.value) {
                case 'owner': {
                    nameInput.placeholder = 'Your name';
                    formBlock.classList.remove('hidden');
                    noneOfTheAbove.classList.add('hidden');
                    break;
                }

                case 'representative': {
                    nameInput.placeholder = 'Owner’s Name';
                    formBlock.classList.remove('hidden');
                    noneOfTheAbove.classList.add('hidden');
                    break;
                }

                default: {
                    formBlock.classList.add('hidden');
                    noneOfTheAbove.classList.remove('hidden');
                }
            }
        }

    })
}