document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burgerToggle');
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-open');
            overlay.classList.toggle('is-active');
            document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
        });

        overlay.addEventListener('click', () => {
            burger.classList.remove('is-active');
            menu.classList.remove('is-open');
            overlay.classList.remove('is-active');
            document.body.style.overflow = '';
        });
    }
});
