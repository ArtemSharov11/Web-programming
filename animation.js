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

// Interactive elements and Lab 9 effects
(function () {
    const API_URL = "http://localhost:3000";
    let audioContext;
    let activeModal = null;

    function ensurePreloader() {
        if (document.querySelector(".interactive-preloader")) return;
        const preloader = document.createElement("div");
        preloader.className = "interactive-preloader";
        preloader.innerHTML = `
            <div class="interactive-preloader__box">
                <div class="interactive-preloader__logo" aria-hidden="true"></div>
                <div class="interactive-preloader__text">HOTELA loading</div>
            </div>
        `;
        document.body.prepend(preloader);

        window.addEventListener("load", () => {
            setTimeout(() => {
                preloader.classList.add("is-hidden");
                setTimeout(() => preloader.remove(), 500);
            }, 450);
        });
    }

    function ensureToastStack() {
        let stack = document.querySelector(".interactive-toast-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.className = "interactive-toast-stack";
            stack.setAttribute("aria-live", "polite");
            document.body.appendChild(stack);
        }
        return stack;
    }

    window.showToast = function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `interactive-toast interactive-toast--${type}`;
        toast.textContent = message;
        ensureToastStack().appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("is-visible"));
        setTimeout(() => {
            toast.classList.remove("is-visible");
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    };

    function closeModal(result = null) {
        if (!activeModal) return;
        const { overlay, resolve } = activeModal;
        overlay.classList.remove("is-open");
        document.body.classList.remove("interactive-modal-open");
        setTimeout(() => overlay.remove(), 260);
        activeModal = null;
        if (resolve) resolve(result);
    }

    window.openInteractiveModal = function openInteractiveModal({ title = "", content = "", actions = "" }) {
        closeModal();
        const overlay = document.createElement("div");
        overlay.className = "interactive-modal";
        overlay.innerHTML = `
            <section class="interactive-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="interactive-modal-title">
                <header class="interactive-modal__header">
                    <h2 class="interactive-modal__title" id="interactive-modal-title">${title}</h2>
                    <button type="button" class="interactive-modal__close" data-interactive-close aria-label="Закрыть">×</button>
                </header>
                <div class="interactive-modal__body">${content}</div>
                ${actions ? `<div class="interactive-modal__actions">${actions}</div>` : ""}
            </section>
        `;
        document.body.appendChild(overlay);
        document.body.classList.add("interactive-modal-open");
        activeModal = { overlay };

        overlay.addEventListener("click", event => {
            if (event.target === overlay || event.target.closest("[data-interactive-close]")) closeModal(false);
        });

        requestAnimationFrame(() => overlay.classList.add("is-open"));
        overlay.querySelector("[data-interactive-close]")?.focus();
        return overlay;
    };

    window.showConfirm = function showConfirm(message, title = "Подтвердите действие") {
        return new Promise(resolve => {
            const overlay = window.openInteractiveModal({
                title,
                content: `<p>${message}</p>`,
                actions: `
                    <button type="button" class="cat-btn" data-confirm-cancel>Отмена</button>
                    <button type="button" class="cat-btn danger" data-confirm-ok>Подтвердить</button>
                `
            });
            activeModal.resolve = resolve;
            overlay.querySelector("[data-confirm-ok]").addEventListener("click", () => closeModal(true));
            overlay.querySelector("[data-confirm-cancel]").addEventListener("click", () => closeModal(false));
        });
    };

    function initBurgerEnhancements() {
        const burger = document.getElementById("burgerToggle");
        const menu = document.getElementById("sideMenu");
        const overlay = document.getElementById("overlay");
        if (!burger || !menu || !overlay) return;

        const closeMenu = () => {
            burger.classList.remove("is-active");
            menu.classList.remove("is-open");
            overlay.classList.remove("is-active");
            document.body.style.overflow = "";
        };

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => closeMenu());
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
                closeModal(false);
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", event => {
                const target = document.querySelector(link.getAttribute("href"));
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    function initScrollReveal() {
        const nodes = document.querySelectorAll(".scroll-reveal, .interactive-stat, .interactive-media-gallery, .interactive-map-section");
        if (!nodes.length || !("IntersectionObserver" in window)) {
            nodes.forEach(node => node.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        nodes.forEach(node => {
            node.classList.add("scroll-reveal");
            observer.observe(node);
        });
    }

    function initActiveNav() {
        const links = Array.from(document.querySelectorAll(".side-menu__nav a[href^='#']"));
        const targets = links
            .map(link => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);
        if (!targets.length || !("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => {
                    link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { threshold: 0.35 });

        targets.forEach(target => observer.observe(target));
    }

    function animateNumber(element, target) {
        const duration = 1200;
        const start = performance.now();
        const from = Number(element.textContent) || 0;

        const step = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(from + (target - from) * eased);
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }

    async function initAnimatedStats() {
        const stats = document.querySelectorAll(".interactive-stat-number[data-target]");
        if (!stats.length) return;

        await Promise.all(Array.from(stats).map(async stat => {
            const resource = stat.dataset.statResource;
            if (!resource) return;
            stat.dataset.target = String(await countResource(resource));
        }));

        const start = element => animateNumber(element, Number(element.dataset.target || 0));
        if (!("IntersectionObserver" in window)) {
            stats.forEach(start);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    start(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.45 });

        stats.forEach(stat => observer.observe(stat));
    }

    async function countResource(resource) {
        try {
            const response = await fetch(`${API_URL}/${resource}`);
            const data = await response.json();
            return Array.isArray(data) ? data.length : 0;
        } catch {
            return 0;
        }
    }

    async function updateCounters() {
        const counters = document.querySelectorAll("[data-counter]");
        if (!counters.length) return;

        const [cart, favorites] = await Promise.all([countResource("cart"), countResource("favorites")]);
        const values = { cart, favorites };

        counters.forEach(counter => {
            const value = values[counter.dataset.counter] ?? 0;
            if (counter.textContent !== String(value)) {
                counter.textContent = value;
                counter.classList.add("is-pulsing");
                setTimeout(() => counter.classList.remove("is-pulsing"), 380);
            }
        });
    }

    window.updateLabCounters = updateCounters;

    function initParallax() {
        const layers = document.querySelectorAll("[data-parallax-speed]");
        if (!layers.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const apply = () => {
            layers.forEach(layer => {
                const rect = layer.parentElement.getBoundingClientRect();
                const offset = (window.innerHeight - rect.top) * Number(layer.dataset.parallaxSpeed);
                layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
            });
        };

        apply();
        window.addEventListener("scroll", () => requestAnimationFrame(apply), { passive: true });
        window.addEventListener("resize", apply);
    }

    function playTone(index, volume) {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = ["sine", "triangle", "square", "sawtooth"][index % 4];
        oscillator.frequency.value = 220 + index * 47;
        gain.gain.value = volume;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);
        oscillator.stop(audioContext.currentTime + 0.48);
    }

    function initMediaGallery() {
        const root = document.querySelector("[data-media-gallery]");
        if (!root) return;

        const images = [
            "img/hero-photo.png", "img/phone-food.png", "img/phone-services.png", "img/phone-profile.png",
            "img/phone-messenger.png", "img/phone-tv.png", "img/phone-grms.png", "img/admin-panel.png",
            "img/guest-letter.png", "img/print-materials.png"
        ];
        const image = root.querySelector("[data-gallery-image]");
        const state = root.querySelector("[data-player-state]");
        const volume = root.querySelector("[data-volume]");
        let current = 0;

        const showImage = index => {
            current = index;
            root.querySelector(".interactive-gallery-stage").classList.add("is-switching");
            setTimeout(() => {
                image.src = images[current];
                image.alt = `Интерактивное изображение ${current + 1}`;
                root.querySelector(".interactive-gallery-stage").classList.remove("is-switching");
            }, 180);
            playTone(current, Number(volume.value));
            state.textContent = `Играет звук изображения ${current + 1}`;
            state.classList.add("is-playing");
            setTimeout(() => {
                state.textContent = "Пауза";
                state.classList.remove("is-playing");
            }, 700);
        };

        root.querySelectorAll("[data-gallery-action]").forEach(button => {
            button.addEventListener("click", () => {
                const next = button.dataset.galleryAction === "next"
                    ? (current + 1) % images.length
                    : Math.floor(Math.random() * images.length);
                showImage(next);
            });
        });

        root.querySelector("[data-video-open]")?.addEventListener("click", () => {
            window.openInteractiveModal({
                title: "Видео о сервисе",
                content: `
                    <video controls autoplay style="width:100%; border-radius:1rem; background:#000;">
                        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>
                `
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        ensurePreloader();
        initBurgerEnhancements();
        initSmoothScroll();
        initScrollReveal();
        initActiveNav();
        initAnimatedStats();
        initParallax();
        initMediaGallery();
        updateCounters();
    });
})();



