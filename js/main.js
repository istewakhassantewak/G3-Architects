(function (global) {
    'use strict';

    var REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

    function prefersReducedMotion() {
        return global.matchMedia && global.matchMedia(REDUCED_MOTION).matches;
    }

    var Year = {
        init: function () {
            var el = document.getElementById('footer-year');
            if (el) {
                el.textContent = String(new Date().getFullYear());
            }
        }
    };

    var Nav = {
        toggle: null,
        menu: null,

        setOpen: function (open) {
            if (!this.toggle || !this.menu) return;
            this.menu.classList.toggle('is-open', open);
            this.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('nav-open', open);
            this.toggle.classList.toggle('is-active', open);
        },

        init: function () {
            this.toggle = document.getElementById('nav-toggle');
            this.menu = document.getElementById('nav-menu');
            if (!this.toggle || !this.menu) return;

            var self = this;
            this.toggle.addEventListener('click', function () {
                var open = !self.menu.classList.contains('is-open');
                self.setOpen(open);
            });

            this.menu.querySelectorAll('a[href^="#"]').forEach(function (link) {
                link.addEventListener('click', function () {
                    if (global.matchMedia('(max-width: 992px)').matches) {
                        self.setOpen(false);
                    }
                });
            });

            var resizeTimer;
            global.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    if (global.innerWidth > 992) {
                        self.setOpen(false);
                    }
                }, 150);
            });
        }
    };

    var Ripple = {
        init: function (selector) {
            if (prefersReducedMotion()) return;

            var elements = document.querySelectorAll(selector);
            elements.forEach(function (el) {
                if (el.querySelector('.ripple-surface')) return;
                var surface = document.createElement('span');
                surface.className = 'ripple-surface';
                surface.setAttribute('aria-hidden', 'true');
                el.appendChild(surface);
            });

            document.body.addEventListener(
                'click',
                function (e) {
                    var target = e.target.closest(selector);
                    if (!target || prefersReducedMotion()) return;

                    var surface = target.querySelector('.ripple-surface');
                    if (!surface) return;

                    var rect = target.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    var max = Math.max(rect.width, rect.height);
                    var ripple = document.createElement('span');
                    ripple.className = 'ripple-wave';
                    ripple.style.width = ripple.style.height = max + 'px';
                    ripple.style.left = x - max / 2 + 'px';
                    ripple.style.top = y - max / 2 + 'px';
                    surface.appendChild(ripple);

                    ripple.addEventListener('animationend', function onEnd() {
                        ripple.removeEventListener('animationend', onEnd);
                        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                    });
                },
                false
            );
        }
    };

    var Form = {
        form: null,
        statusEl: null,
        submitBtn: null,
        emailRe: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

        showFieldError: function (id, message) {
            var el = document.getElementById(id);
            if (!el) return;
            el.textContent = message;
            el.hidden = !message;
        },

        clearErrors: function () {
            this.showFieldError('error-name', '');
            this.showFieldError('error-email', '');
            this.showFieldError('error-message', '');
        },

        setLoading: function (loading) {
            if (!this.submitBtn) return;
            this.submitBtn.classList.toggle('is-loading', loading);
            this.submitBtn.disabled = loading;
            this.submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
        },

        init: function () {
            this.form = document.getElementById('contact-form');
            this.statusEl = document.getElementById('form-status');
            if (!this.form || !this.statusEl) return;

            this.submitBtn = this.form.querySelector('button[type="submit"]');
            var self = this;

            this.form.addEventListener('submit', function (e) {
                e.preventDefault();
                self.clearErrors();
                self.statusEl.textContent = '';

                var nameInput = document.getElementById('contact-name');
                var emailInput = document.getElementById('contact-email');
                var messageInput = document.getElementById('contact-message');

                var name = nameInput ? nameInput.value.trim() : '';
                var email = emailInput ? emailInput.value.trim() : '';
                var message = messageInput ? messageInput.value.trim() : '';

                var ok = true;
                if (!name) {
                    self.showFieldError('error-name', 'Add your full name so we know who to address.');
                    ok = false;
                }
                if (!email || !self.emailRe.test(email)) {
                    self.showFieldError(
                        'error-email',
                        'Enter a valid email (for example, name@company.com).'
                    );
                    ok = false;
                }
                if (!message || message.length < 10) {
                    self.showFieldError(
                        'error-message',
                        'Share a bit more detail—at least 10 characters—so we can respond helpfully.'
                    );
                    ok = false;
                }

                if (!ok) {
                    if (!name && nameInput) nameInput.focus();
                    else if ((!email || !self.emailRe.test(email)) && emailInput) emailInput.focus();
                    else if (messageInput) messageInput.focus();
                    return;
                }

                self.setLoading(true);

                global.setTimeout(function () {
                    self.setLoading(false);
                    self.statusEl.textContent =
                        'Thanks—your message looks good. On a live site, this would be sent to our inbox; connect a form service or backend to deliver it for real.';
                    self.form.reset();
                }, 650);
            });
        }
    };

    function init() {
        Year.init();
        Nav.init();
        Form.init();
        Ripple.init('.sponsor-link, .btn-primary');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
