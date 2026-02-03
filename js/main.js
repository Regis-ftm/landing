/**
 * REGIS Landing Page - Main JavaScript
 * Handles interactions, analytics, and form submissions
 */

(function() {
    'use strict';

    // ===========================
    // CONFIGURATION
    // ===========================
    
    const CONFIG = {
        // API endpoint for form submissions (replace with your actual endpoint)
        formEndpoint: 'https://api.regis-app.com/contact',
        // Alternative: use a service like Formspree, Netlify Forms, or Google Forms
        // formEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
        
        // Analytics IDs (replace with your actual IDs)
        googleAnalyticsId: 'G-XXXXXXXX',
        googleTagManagerId: 'GTM-XXXXXXX',
        
        // Animation settings
        animationThreshold: 0.1,
        counterDuration: 2000,
    };

    // ===========================
    // DOM READY
    // ===========================
    
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSmoothScroll();
        initHeaderScroll();
        initContactForm();
        initCounterAnimation();
        initFaqAccessibility();
        updateCurrentYear();
        initLazyLoading();
        
        // Initialize analytics after consent (GDPR)
        // initAnalytics();
    });

    // ===========================
    // MOBILE MENU
    // ===========================
    
    function initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.nav-mobile');
        
        if (!menuToggle || !mobileNav) return;
        
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            mobileNav.hidden = isExpanded;
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });
        
        // Close menu on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileNav.hidden = true;
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !mobileNav.hidden) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileNav.hidden = true;
                document.body.style.overflow = '';
                menuToggle.focus();
            }
        });
    }

    // ===========================
    // SMOOTH SCROLL
    // ===========================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, targetId);
                    
                    // Track navigation event
                    trackEvent('Navigation', 'Click', targetId);
                }
            });
        });
    }

    // ===========================
    // HEADER SCROLL EFFECT
    // ===========================
    
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        
        if (!header) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Add shadow on scroll
            if (currentScroll > 10) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '';
            }
            
            // Hide/show header on scroll direction (optional)
            // if (currentScroll > lastScroll && currentScroll > 100) {
            //     header.style.transform = 'translateY(-100%)';
            // } else {
            //     header.style.transform = 'translateY(0)';
            // }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ===========================
    // CONTACT FORM
    // ===========================
    
    function initContactForm() {
        const form = document.getElementById('contact-form');
        
        if (!form) return;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearFormErrors(form);
            
            // Validate form
            if (!validateForm(form)) {
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            const successMessage = form.querySelector('.form-success');
            
            btnText.hidden = true;
            btnLoading.hidden = false;
            submitBtn.disabled = true;
            
            try {
                // Collect form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Option 1: Send to your API
                // const response = await fetch(CONFIG.formEndpoint, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(data),
                // });
                
                // Option 2: Use mailto as fallback
                // For demo purposes, we'll simulate a successful submission
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Track conversion
                trackEvent('Lead', 'Form Submit', 'Contact Form');
                trackConversion('contact_form_submission');
                
                // Show success message
                form.reset();
                successMessage.hidden = false;
                
                // Hide form fields (optional)
                // form.querySelector('.form-fields').hidden = true;
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                showFormError(form, 'Une erreur est survenue. Veuillez réessayer ou nous contacter par email.');
                
            } finally {
                btnText.hidden = false;
                btnLoading.hidden = true;
                submitBtn.disabled = false;
            }
        });
        
        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    function validateForm(form) {
        let isValid = true;
        
        // Required fields
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const errorElement = field.parentElement.querySelector('.error-message');
        
        // Clear previous error
        clearFieldError(field);
        
        // Required validation
        if (field.required && !value) {
            showFieldError(field, 'Ce champ est requis');
            return false;
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Veuillez entrer un email valide');
                return false;
            }
        }
        
        // Phone validation (optional)
        if (type === 'tel' && value) {
            const phoneRegex = /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,6}[-\s.]?[0-9]{3,6}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                showFieldError(field, 'Veuillez entrer un numéro valide');
                return false;
            }
        }
        
        // Checkbox validation (privacy)
        if (type === 'checkbox' && field.required && !field.checked) {
            showFieldError(field, 'Vous devez accepter la politique de confidentialité');
            return false;
        }
        
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    function clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    function clearFormErrors(form) {
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
            el.removeAttribute('aria-invalid');
        });
        
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }
    
    function showFormError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>${message}</p>
        `;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.parentElement.insertBefore(errorDiv, submitBtn);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // ===========================
    // COUNTER ANIMATION
    // ===========================
    
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        if (!counters.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: CONFIG.animationThreshold });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    function animateCounter(element) {
        const target = parseInt(element.dataset.count, 10);
        const duration = CONFIG.counterDuration;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // ===========================
    // FAQ ACCESSIBILITY
    // ===========================
    
    function initFaqAccessibility() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const summary = item.querySelector('summary');
            
            // Track FAQ interactions
            item.addEventListener('toggle', function() {
                if (this.open) {
                    const question = summary.querySelector('span').textContent;
                    trackEvent('FAQ', 'Open', question);
                }
            });
        });
    }

    // ===========================
    // CURRENT YEAR
    // ===========================
    
    function updateCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ===========================
    // LAZY LOADING
    // ===========================
    
    function initLazyLoading() {
        // Native lazy loading is used via loading="lazy" attribute
        // This adds intersection observer for browsers without support
        
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            return;
        }
        
        // Fallback for older browsers
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => observer.observe(img));
    }

    // ===========================
    // ANALYTICS
    // ===========================
    
    function initAnalytics() {
        // Google Analytics 4
        if (CONFIG.googleAnalyticsId && CONFIG.googleAnalyticsId !== 'G-XXXXXXXX') {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.googleAnalyticsId}`;
            document.head.appendChild(script);
            
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', CONFIG.googleAnalyticsId, {
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=None;Secure'
            });
            
            // Make gtag available globally
            window.gtag = gtag;
        }
    }
    
    /**
     * Track custom events
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label
     * @param {number} value - Event value (optional)
     */
    function trackEvent(category, action, label, value) {
        // Google Analytics 4
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
        
        // Console log for debugging (remove in production)
        console.log('Track Event:', { category, action, label, value });
    }
    
    /**
     * Track conversions (for Google Ads, etc.)
     * @param {string} conversionId - Conversion identifier
     */
    function trackConversion(conversionId) {
        // Google Analytics 4 conversion
        if (typeof gtag === 'function') {
            gtag('event', 'conversion', {
                'send_to': `${CONFIG.googleAnalyticsId}/${conversionId}`
            });
        }
        
        // Facebook Pixel (if implemented)
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }
        
        // LinkedIn Insight Tag (if implemented)
        if (typeof lintrk === 'function') {
            lintrk('track', { conversion_id: conversionId });
        }
        
        console.log('Track Conversion:', conversionId);
    }
    
    // Expose tracking functions globally
    window.trackEvent = trackEvent;
    window.trackConversion = trackConversion;

    // ===========================
    // SCROLL ANIMATIONS
    // ===========================
    
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if (!animatedElements.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    // ===========================
    // COOKIE CONSENT (GDPR)
    // ===========================
    
    function initCookieConsent() {
        // Check if consent was already given
        const consent = localStorage.getItem('cookie_consent');
        
        if (consent === 'accepted') {
            initAnalytics();
            return;
        }
        
        if (consent === 'declined') {
            return;
        }
        
        // Show cookie banner
        showCookieBanner();
    }
    
    function showCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Nous utilisons des cookies pour améliorer votre expérience. 
                   <a href="/privacy.html">En savoir plus</a>
                </p>
                <div class="cookie-actions">
                    <button class="btn btn-outline btn-sm" id="cookie-decline">Refuser</button>
                    <button class="btn btn-primary btn-sm" id="cookie-accept">Accepter</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'accepted');
            banner.remove();
            initAnalytics();
            trackEvent('Cookie', 'Consent', 'Accepted');
        });
        
        document.getElementById('cookie-decline').addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'declined');
            banner.remove();
        });
    }

    // ===========================
    // PERFORMANCE MONITORING
    // ===========================
    
    function reportWebVitals() {
        // Report Core Web Vitals if the Web Vitals library is loaded
        if (typeof webVitals !== 'undefined') {
            webVitals.getCLS(sendToAnalytics);
            webVitals.getFID(sendToAnalytics);
            webVitals.getLCP(sendToAnalytics);
            webVitals.getFCP(sendToAnalytics);
            webVitals.getTTFB(sendToAnalytics);
        }
    }
    
    function sendToAnalytics({ name, delta, id }) {
        // Send to Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', name, {
                'event_category': 'Web Vitals',
                'event_label': id,
                'value': Math.round(name === 'CLS' ? delta * 1000 : delta),
                'non_interaction': true,
            });
        }
    }

})();

// ===========================
// CSS FOR COOKIE BANNER (Add to styles.css if using)
// ===========================
/*
.cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--gray-900);
    color: var(--white);
    padding: var(--spacing-md);
    z-index: 9999;
    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cookie-content {
    max-width: var(--container-max);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.cookie-content p {
    margin: 0;
    font-size: var(--text-sm);
}

.cookie-content a {
    color: var(--primary-blue);
    text-decoration: underline;
}

.cookie-actions {
    display: flex;
    gap: var(--spacing-sm);
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: var(--text-sm);
}
*/
