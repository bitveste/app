/* =====================================
   PERFECT SCROLLBAR SAFE INITIALIZATION
   ===================================== */

document.addEventListener('DOMContentLoaded', function () {

    // Active Investments (injected later)
    const budgetContent = document.querySelector('.budget-content');
    if (budgetContent) {
        window.psBudget = new PerfectScrollbar(budgetContent, {
            wheelPropagation: false
        });
    }

    // Investment Offers (always present)
    const invoiceContent = document.querySelector('.invoice-content');
    if (invoiceContent) {
        window.psOffers = new PerfectScrollbar(invoiceContent, {
            wheelPropagation: false
        });
    }

});
