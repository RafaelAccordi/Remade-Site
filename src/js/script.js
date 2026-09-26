document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reducedMotion) {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });

	revealItems.forEach((item) => revealObserver.observe(item));
} else {
	revealItems.forEach((item) => item.classList.add("is-visible"));
}

const filmModal = document.querySelector("#filmModal");
const vimeoFrame = document.querySelector("[data-vimeo-frame]");
const vimeoUrl = "https://player.vimeo.com/video/850159897?autoplay=1&title=0&byline=0&portrait=0&app_id=122963";

filmModal?.addEventListener("show.bs.modal", () => {
	if (vimeoFrame && !vimeoFrame.getAttribute("src")) {
		vimeoFrame.src = vimeoUrl;
	}
});

filmModal?.addEventListener("hidden.bs.modal", () => {
	if (vimeoFrame) {
		vimeoFrame.removeAttribute("src");
	}
});

const clientViewport = document.querySelector("[data-client-viewport]");
const clientTrack = document.querySelector("[data-client-track]");
const progressBar = document.querySelector("[data-carousel-progress]");
const previousButton = document.querySelector("[data-carousel-prev]");
const nextButton = document.querySelector("[data-carousel-next]");

if (clientViewport && clientTrack && progressBar && previousButton && nextButton) {
	const slides = [...clientTrack.children];
	let autoplayTimer;

	const getStep = () => {
		const slide = slides[0];
		const gap = Number.parseFloat(getComputedStyle(clientTrack).gap) || 0;
		return slide.getBoundingClientRect().width + gap;
	};

	const updateProgress = () => {
		const maxScroll = clientViewport.scrollWidth - clientViewport.clientWidth;
		const visibleFraction = clientViewport.clientWidth / clientViewport.scrollWidth;
		const fraction = maxScroll > 0 ? clientViewport.scrollLeft / maxScroll : 0;
		progressBar.style.width = `${Math.max(visibleFraction * 100, 25)}%`;
		progressBar.style.transform = `translateX(${fraction * (100 / Math.max(visibleFraction, .25) - 100)}%)`;
	};

	const moveCarousel = (direction) => {
		const maxScroll = clientViewport.scrollWidth - clientViewport.clientWidth;
		const atStart = clientViewport.scrollLeft <= 2;
		const atEnd = clientViewport.scrollLeft >= maxScroll - 2;

		if (direction > 0 && atEnd) {
			clientViewport.scrollTo({ left: 0, behavior: reducedMotion ? "instant" : "smooth" });
			return;
		}

		if (direction < 0 && atStart) {
			clientViewport.scrollTo({ left: maxScroll, behavior: reducedMotion ? "instant" : "smooth" });
			return;
		}

		clientViewport.scrollBy({ left: getStep() * direction, behavior: reducedMotion ? "instant" : "smooth" });
	};

	const stopAutoplay = () => window.clearInterval(autoplayTimer);
	const startAutoplay = () => {
		stopAutoplay();
		if (!reducedMotion && !document.hidden) {
			autoplayTimer = window.setInterval(() => moveCarousel(1), 5000);
		}
	};

	previousButton.addEventListener("click", () => moveCarousel(-1));
	nextButton.addEventListener("click", () => moveCarousel(1));
	clientViewport.addEventListener("scroll", updateProgress, { passive: true });
	clientViewport.addEventListener("mouseenter", stopAutoplay);
	clientViewport.addEventListener("mouseleave", startAutoplay);
	clientViewport.addEventListener("focusin", stopAutoplay);
	clientViewport.addEventListener("focusout", startAutoplay);
	document.addEventListener("visibilitychange", () => document.hidden ? stopAutoplay() : startAutoplay());
	window.addEventListener("resize", updateProgress);

	updateProgress();
	startAutoplay();
}

document.querySelectorAll("#mainNav .nav-link").forEach((link) => {
	link.addEventListener("click", () => {
		const nav = document.querySelector("#mainNav");
		if (nav?.classList.contains("show") && window.bootstrap) {
			window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
		}
	});
});

const filterButtons = document.querySelectorAll("[data-filter]");
const catalogCards = document.querySelectorAll("[data-category]");
const emptyCatalogMessage = document.querySelector("[data-filter-empty]");

if (filterButtons.length && catalogCards.length) {
	filterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const selectedFilter = button.dataset.filter;
			let visibleCount = 0;

			filterButtons.forEach((filterButton) => {
				filterButton.setAttribute("aria-pressed", String(filterButton === button));
			});

			catalogCards.forEach((card) => {
				const categories = card.dataset.category.split(" ");
				const shouldShow = selectedFilter === "all" || categories.includes(selectedFilter);
				card.hidden = !shouldShow;
				visibleCount += Number(shouldShow);
			});

			if (emptyCatalogMessage) {
				emptyCatalogMessage.hidden = visibleCount > 0;
			}
		});
	});
}

const contactForm = document.querySelector("[data-contact-form]");

contactForm?.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!contactForm.reportValidity()) {
		return;
	}

	const formData = new FormData(contactForm);
	const subject = `Contato pelo site - ${formData.get("name")}`;
	const body = [
		`Nome: ${formData.get("name")}`,
		`E-mail: ${formData.get("email")}`,
		`WhatsApp: ${formData.get("phone") || "Não informado"}`,
		"",
		String(formData.get("message"))
	].join("\n");
	const mailto = `mailto:contato@studiocanela.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	const note = document.querySelector("[data-form-note]");

	if (note) {
		note.textContent = "Abrindo seu aplicativo de e-mail com a mensagem pronta.";
	}
	window.location.href = mailto;
});
