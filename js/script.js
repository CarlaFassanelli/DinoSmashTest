const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const cartButton = document.getElementById('cartButton');
const cartPanel = document.getElementById('cartPanel');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const customerNameInput = document.getElementById('customerName');
const pickupLocalCheckbox = document.getElementById('pickupLocal');
const paymentMethodSelect = document.getElementById('paymentMethod');
const mpInfo = document.getElementById('mpInfo');
const addButtons = document.querySelectorAll('.add-to-cart');
const carouselTrack = document.querySelector('.carousel-track');
const carouselSlides = document.querySelectorAll('.carousel-image-slide');
const carouselPrev = document.querySelector('.carousel-btn.prev');
const carouselNext = document.querySelector('.carousel-btn.next');
const carouselDotsContainer = document.getElementById('carouselDots');
const carouselWrapper = document.querySelector('.carousel-wrapper');

let cart = JSON.parse(localStorage.getItem('dinosmash-cart')) || [];
let currentSlide = 0;
let autoplayId = null;
const WHATSAPP_NUMBER = '5492615976367';

function updateCarousel() {
	if (!carouselTrack || !carouselSlides.length) {
		return;
	}

	carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

	if (!carouselDotsContainer) {
		return;
	}

	const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
	dots.forEach((dot, index) => {
		dot.classList.toggle('active', index === currentSlide);
		dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
	});
}

function goToSlide(index) {
	if (!carouselSlides.length) {
		return;
	}

	const totalSlides = carouselSlides.length;
	currentSlide = (index + totalSlides) % totalSlides;
	updateCarousel();
}

function startCarouselAutoplay() {
	if (!carouselSlides.length || autoplayId) {
		return;
	}

	autoplayId = setInterval(() => {
		goToSlide(currentSlide + 1);
	}, 2200);
}

function stopCarouselAutoplay() {
	if (!autoplayId) {
		return;
	}

	clearInterval(autoplayId);
	autoplayId = null;
}

function initCarousel() {
	if (!carouselTrack || !carouselSlides.length) {
		return;
	}

	if (carouselDotsContainer) {
		carouselDotsContainer.innerHTML = '';
		carouselSlides.forEach((_, index) => {
			const dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'carousel-dot';
			dot.addEventListener('click', () => {
				goToSlide(index);
			});
			carouselDotsContainer.appendChild(dot);
		});
	}

	if (carouselPrev) {
		carouselPrev.addEventListener('click', () => {
			goToSlide(currentSlide - 1);
		});
	}

	if (carouselNext) {
		carouselNext.addEventListener('click', () => {
			goToSlide(currentSlide + 1);
		});
	}

	if (carouselWrapper) {
		carouselWrapper.addEventListener('mouseenter', stopCarouselAutoplay);
		carouselWrapper.addEventListener('mouseleave', startCarouselAutoplay);
		carouselWrapper.addEventListener('touchstart', stopCarouselAutoplay, { passive: true });
		carouselWrapper.addEventListener('touchend', startCarouselAutoplay);
	}

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopCarouselAutoplay();
		} else {
			startCarouselAutoplay();
		}
	});

	updateCarousel();
	startCarouselAutoplay();
}

function toggleMenu() {
	const isOpen = navMenu.classList.toggle('active');
	menuToggle.setAttribute('aria-expanded', String(isOpen));
}

function openCart() {
	cartPanel.classList.add('active');
	overlay.classList.add('active');
	cartPanel.setAttribute('aria-hidden', 'false');
}

function closeCartPanel() {
	cartPanel.classList.remove('active');
	overlay.classList.remove('active');
	cartPanel.setAttribute('aria-hidden', 'true');
}

function saveCart() {
	localStorage.setItem('dinosmash-cart', JSON.stringify(cart));
}

function formatPrice(value) {
	return `$${Math.round(value).toLocaleString('es-AR')}`;
}

function buildWhatsappMessage(paymentMethod, customerName, pickupLocal) {
	const itemsText = cart
		.map((item) => {
			const subtotal = item.price * item.quantity;
			return `• ${item.quantity}x ${item.name} - ${formatPrice(subtotal)}`;
		})
		.join('\n');

	const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

	return [
		'¡Hola DinoSmash! Quiero hacer este pedido:',
		`Nombre: ${customerName}`,
		`Retiro en local: ${pickupLocal}`,
		'',
		itemsText,
		'',
		`Total: ${formatPrice(total)}`,
		`Método de pago: ${paymentMethod}`,
	].join('\n');
}

function updatePaymentInfoVisibility() {
	if (!paymentMethodSelect || !mpInfo) {
		return;
	}

	const showMercadoPagoInfo = paymentMethodSelect.value === 'mercado_pago';
	mpInfo.style.display = showMercadoPagoInfo ? 'block' : 'none';
}

function updateCartUI() {
	if (!cart.length) {
		cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
		cartTotal.textContent = '$0';
		cartCount.textContent = '0';
		saveCart();
		return;
	}

	cartItemsContainer.innerHTML = cart
		.map((item) => {
			const subtotal = item.price * item.quantity;
			const isOfferItem = Number(item.id) >= 100;
			return `
				<div class="cart-item">
					<div>
						<strong>${item.name}</strong>
						${isOfferItem ? '<span class="cart-offer-badge">OFERTA</span>' : ''}
						<small>${formatPrice(item.price)} c/u</small>
					</div>
					<div class="qty-controls">
						<button data-action="decrease" data-id="${item.id}">-</button>
						<span>${item.quantity}</span>
						<button data-action="increase" data-id="${item.id}">+</button>
					</div>
					<small>Subtotal: ${formatPrice(subtotal)}</small>
				</div>
			`;
		})
		.join('');

	const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const count = cart.reduce((sum, item) => sum + item.quantity, 0);

	cartTotal.textContent = formatPrice(total);
	cartCount.textContent = count;
	saveCart();
}

function addToCart(productCard) {
	const id = productCard.dataset.id;
	const name = productCard.dataset.name;
	const price = Number(productCard.dataset.price);
	const existing = cart.find((item) => item.id === id);

	if (existing) {
		existing.quantity += 1;
	} else {
		cart.push({ id, name, price, quantity: 1 });
	}

	updateCartUI();
	openCart();
}

function changeQuantity(id, action) {
	cart = cart
		.map((item) => {
			if (item.id !== id) {
				return item;
			}

			const quantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
			return { ...item, quantity };
		})
		.filter((item) => item.quantity > 0);

	updateCartUI();
}

menuToggle.addEventListener('click', toggleMenu);

navMenu.addEventListener('click', (event) => {
	if (event.target.tagName === 'A') {
		navMenu.classList.remove('active');
		menuToggle.setAttribute('aria-expanded', 'false');
	}
});

cartButton.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartPanel);
overlay.addEventListener('click', () => {
	closeCartPanel();
	navMenu.classList.remove('active');
	menuToggle.setAttribute('aria-expanded', 'false');
});

addButtons.forEach((button) => {
	button.addEventListener('click', () => {
		const card = button.closest('.product-card');
		addToCart(card);
	});
});

cartItemsContainer.addEventListener('click', (event) => {
	const target = event.target;
	if (target.tagName !== 'BUTTON') {
		return;
	}

	const id = target.dataset.id;
	const action = target.dataset.action;
	changeQuantity(id, action);
});

clearCartBtn.addEventListener('click', () => {
	cart = [];
	updateCartUI();
});

checkoutBtn.addEventListener('click', () => {
	if (!cart.length) {
		alert('Tu carrito está vacío. Agrega una hamburguesa para continuar.');
		return;
	}

	const customerName = customerNameInput ? customerNameInput.value.trim() : '';
	if (!customerName) {
		alert('Ingresa tu nombre y apellido para continuar.');
		if (customerNameInput) {
			customerNameInput.focus();
		}
		return;
	}

	const paymentMethod = paymentMethodSelect && paymentMethodSelect.value === 'efectivo' ? 'Efectivo' : 'Mercado Pago';
	const pickupLocal = pickupLocalCheckbox && pickupLocalCheckbox.checked ? 'Sí' : 'No';
	const whatsappMessage = buildWhatsappMessage(paymentMethod, customerName, pickupLocal);
	const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
	window.open(whatsappUrl, '_blank');

	cart = [];
	updateCartUI();
	closeCartPanel();
});

if (paymentMethodSelect) {
	paymentMethodSelect.addEventListener('change', updatePaymentInfoVisibility);
	updatePaymentInfoVisibility();
}

updateCartUI();
initCarousel();
