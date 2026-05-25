document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burgerToggle');
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    if (burger) {
        burger.addEventListener('click', () => {
            if (!menu || !overlay) return;
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-open');
            overlay.classList.toggle('is-active');
            document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
        });

        if (overlay) {
            overlay.addEventListener('click', () => {
                burger.classList.remove('is-active');
                menu.classList.remove('is-open');
                overlay.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        }
    }

    const initSlider = (trackId, btnPrevId, btnNextId) => {
        const track = document.getElementById(trackId);
        const btnPrev = document.getElementById(btnPrevId);
        const btnNext = document.getElementById(btnNextId);

        if (!track || !btnPrev || !btnNext) return;

        let currentIndex = 0;
        const cards = Array.from(track.children);

        const scrollToCard = (index) => {
            if (index < 0) index = 0;
            if (index >= cards.length) index = cards.length - 1;
            currentIndex = index;
            track.scrollTo({
                left: cards[currentIndex].offsetLeft,
                behavior: 'smooth'
            });
        };

        btnNext.addEventListener('click', () => scrollToCard(currentIndex + 1));
        btnPrev.addEventListener('click', () => scrollToCard(currentIndex - 1));
    };

    initSlider('phones-track', 'btn-prev', 'btn-next');
    initSlider('tariffs-track', 'tariffs-prev', 'tariffs-next');
    initSlider('content-cards-grid', 'content-prev', 'content-next');
    initSlider('guest-track', 'guest-prev', 'guest-next');
    initSlider('reviews-track', 'reviews-prev', 'reviews-next');
    initSlider('reviews-track2', 'reviews2-prev', 'reviews2-next');
});
