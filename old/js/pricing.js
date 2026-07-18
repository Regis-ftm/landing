/**
 * REGIS Pricing Page - JavaScript
 * Handles billing toggle and pricing updates
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initBillingToggle();
    });

    function initBillingToggle() {
        const toggle = document.getElementById('billing-toggle');
        const labels = document.querySelectorAll('.billing-label');
        const priceAmounts = document.querySelectorAll('.price-amount');
        const billingInfos = document.querySelectorAll('.billing-info');

        if (!toggle) return;

        function updatePricing() {
            const isYearly = toggle.checked;

            // Update labels
            labels.forEach(label => {
                const period = label.dataset.period;
                if (period === 'yearly') {
                    label.classList.toggle('active', isYearly);
                } else if (period === 'monthly') {
                    label.classList.toggle('active', !isYearly);
                }
            });

            // Update prices
            priceAmounts.forEach(amount => {
                const monthly = amount.dataset.monthly;
                const yearly = amount.dataset.yearly;
                
                if (monthly && yearly) {
                    amount.textContent = isYearly ? yearly : monthly;
                    
                    // Animate the price change
                    amount.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        amount.style.transform = 'scale(1)';
                    }, 150);
                }
            });

            // Update billing info
            billingInfos.forEach(info => {
                if (info.classList.contains('yearly')) {
                    info.hidden = !isYearly;
                } else if (info.classList.contains('monthly')) {
                    info.hidden = isYearly;
                }
            });

            // Track the change
            if (typeof trackEvent === 'function') {
                trackEvent('Pricing', 'Toggle Billing', isYearly ? 'Yearly' : 'Monthly');
            }
        }

        toggle.addEventListener('change', updatePricing);
        
        // Initialize
        updatePricing();
    }

})();
