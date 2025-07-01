# VTEX Checkout Custom Scripts Documentation

This guide explains what Custom Scripts are in VTEX Storefront, how they are used, and how we have organized them in this project to customize the checkout flow and confirmation page. It also includes specific logic for handling gift cards (virtual products without physical shipping).

## Table of Contents

-   [Introduction](#introduction)
-   [What are Custom Scripts in VTEX?](#what-are-custom-scripts-in-vtex)
-   [Main Files and Their Purpose](#main-files-and-their-purpose)
-   [Apps to Manage Custom Scripts](#apps-to-manage-custom-scripts)
-   [How to Inject Custom Scripts](#how-to-inject-custom-scripts)
-   [Project Context and Purpose](#project-context-and-purpose)
-   [Folder Structure](#folder-structure)
-   [Dynamic Selection Flow](#dynamic-selection-flow)
-   [Script Examples](#script-examples)
-   [General Distribution](#general-distribution)

---

## Introduction

VTEX Storefront allows injecting JavaScript and CSS fragments into checkout pages to modify or extend their native behavior. In this project we use:

-   `checkout-custom.js` for generic logic in all checkout stages.
-   `checkout-confirmation-custom.js` for actions on the "Order Placed" page.
-   Special logic to hide and auto-complete the shipping form when the cart contains only gift cards.

---

## What are Custom Scripts in VTEX?

Custom Scripts are small files that are loaded on each checkout page and allow:

-   Collecting additional data (tracking, analytics).
-   Modifying the interface in real time (validations, UI dynamics).
-   Redirecting the flow (post-sale, thank you pages).

> **Note:** VTEX warns that Custom Scripts are not officially supported and can break your store or interrupt sales. **Always** test in a development workspace before moving to production.  
> Source: [VTEX Developers](https://developers.vtex.com/docs/guides/checkout-customization-guide)

### Legacy CMS Portal

> Files Manager routes (apply globally to all stores):
>
> ```
> https://{accountName}.myvtex.com/arquivos/checkout-custom.js
> https://{accountName}.myvtex.com/arquivos/checkout-custom.css
> ```
>
> Source: VTEX Developers

### VTEX Admin (Storefront)

1. Go to **Store Settings > Storefront > Checkout**.
2. Click on the gear icon of the desired site and go to the **Code** tab.
3. Edit and save the files:
    - `checkout-custom.js`
    - `checkout-custom.css`
    - `checkout-confirmation-custom.js`
    - `checkout-header` (HTML template)

---

## Main Files and Their Purpose

| File                              | Description                                                             | Basic Example                                                                                                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout-custom.js`              | Generic logic in all checkout stages (validations, tracking, UI tweaks) | `js<br>console.log('Custom checkout JS');<br>`                                                                                                                                |
| `checkout-custom.css`             | Custom styles in checkout                                               | `css<br>body { background: #f9f9f9; }<br>`                                                                                                                                    |
| `checkout-confirmation-custom.js` | Only on the "Order Placed" page (purchase confirmation)                 | `` js<br>const og = new URLSearchParams(location.search).get('og');<br>window.location.assign(`${window.location.origin}/api/io${window.location.pathname}?og=${og}`);<br> `` |
| `checkout-header`                 | HTML template for checkout header (links, logo, etc.)                   | `html<br><a href="/">Home</a><br>`                                                                                                                                            |

---

## Apps to Manage Custom Scripts

### Checkout UI Settings (VTEX IO App)

-   Allows script versioning, A/B testing, rollbacks and CI/CD.
-   Initialized with Toolbelt:
    ```bash
    vtex init checkout-ui-settings
    ```

### Checkout UI Custom (Admin App)

-   Interface in Admin for predefined changes (colors, text, visibility).
-   Limited maintenance; Checkout UI Settings is recommended for greater control.

---

## How to Inject Custom Scripts

### Via VTEX Admin

**Store Settings > Storefront > Checkout**

1. Select the site and go to Code.
2. Choose the file (.js or .css), paste your code and click Save.
3. Changes are applied immediately in production.

### Via VTEX IO Apps

**Checkout UI Settings**

```bash
# Link locally and test
vtex link
# Publish new version
vtex publish
```

**Checkout UI Custom**

```bash
vtex install vtex.checkout-ui-custom
```

Then, in Admin look for Checkout UI Custom, apply changes and click Publish.

---

## Project Context and Purpose

VTEX requires always completing a shipping flow, even for virtual products (gift cards). Our script:

-   Detects if the cart contains only gift cards.
-   Hides all shipping controls in checkout and summary.
-   Auto-completes with "placeholder" data (address, postal code, city) so VTEX validates the order without user interaction.
-   Synchronizes the fake address with VTEX using `vtexjs.checkout.sendAttachment`.

---

## Folder Structure

```
vtexStoreConfig/
├─ formSpreadsheet/         ← "Stable" mode (rate template)
│  ├─ argentina/
│  │  └─ checkout6-custom.js
│  ├─ chile/
│  │  └─ checkout6-custom.js
│  └─ …
├─ formCoordinates/         ← "Beta" mode (geolocation)
│  ├─ argentina/
│  │  └─ checkout6-custom.js
│  └─ …
└─ checkout-confirmation4-custom.js  ← Global confirmation script
```

-   **Stable (formSpreadsheet)**: Uses Excel Shipping Policies.
-   **Beta (formCoordinates)**: Calculates rates by GPS polygons / Delivery Promise Beta.
-   **Subfolder by country**: Postal code formats, DNI/RUT, i18n messages.

---

## Dynamic Selection Flow

1. Read shipping mode (Stable vs. Beta) from configuration.
2. Detect active country (subdomain / settings).
3. Load corresponding script:
    - `formSpreadsheet/{country}/checkout6-custom.js`
    - `formCoordinates/{country}/checkout6-custom.js`
4. Always inject also `checkout-confirmation4-custom.js` in confirmation.

---

## Script Examples

In VTEX Storefront we use **two** custom scripts to automate and hide the shipping form when the cart contains _gift cards_. Each country has a **different shipping form** (required fields, selects, postal codes, etc.), so in "Spreadsheet" we maintain variants by region. Below you will find:

-   📦 **fromCoordinates** (Geolocation mode / Delivery Promise)
-   🇦🇷 **formSpreadsheet / Argentina** (example)

---

## General Distribution

-   **"Spreadsheet" mode**
    -   Rate template (Shipping Policies) in VTEX Admin → Shipping strategy → Shipping policies
    -   Scripts grouped in folders `/formSpreadsheet/{country}/checkoutX-custom.js`
-   **"Coordinates" / Beta mode**
    -   Calculation by GPS polygons or Delivery Promise Beta
    -   Single script `/fromCoordinates/checkout-custom.js`
-   **Order confirmation**
    -   Always injected on the **Order Placed** page (`checkout-confirmation-custom.js`)

Each script:

1. **Detects** if the cart contains _only_ gift cards
2. **Hides** shipping blocks dynamically from the DOM
3. **Overwrites** `orderForm.shippingData` with dummy values
4. **Auto-completes** shipping form fields
5. **Advances** automatically to the payment screen

---

## fromCoordinates Script (Geolocation / Delivery Promise)

```js
console.warn('### Script loaded ###');

// Address constants
const ADDRESS = 'Av. del Libertador 1473, Buenos Aires';
const CITY = 'Ciudad Autónoma de Buenos Aires';
const COUNTRY = 'ARG';
const NEIGHBORHOOD = 'Barrio Norte';
const STATE = 'Ciudad Autónoma de Buenos Aires';
const NUMBER = '1473';
const POSTAL_CODE = '1425';
const STREET = 'Avenida del Libertador';

// 1. Current screen detection
const getScreenEndpoint = () => window.location.href.split('/').pop() || '';

// 2. Gift card detection
const isGiftcard = (item) => Object.values(item.productCategories).includes('ohgiftcard');
const hasGiftcard = (items) => items.some(isGiftcard);

// 3. Overwrite flag
let hasShippingDataBeenOverwritten = false;

// 4. Overwrite shippingData in VTEX
const overwriteShippingData = () => {
    const addr = vtexjs.checkout.orderForm.shippingData.selectedAddresses[0];
    if (!addr) {
        console.warn('No address found');
        return;
    }
    Object.assign(addr, {
        city: CITY,
        country: COUNTRY,
        neighborhood: NEIGHBORHOOD,
        state: STATE,
        number: NUMBER,
        postalCode: POSTAL_CODE,
        street: STREET,
        receiverName: 'Por email'
    });
    vtexjs.checkout
        .sendAttachment('shippingData', { selectedAddresses: [addr] })
        .done(() => {
            hasShippingDataBeenOverwritten = false;
            console.log('Shipping data synchronized');
        })
        .fail((err) => console.error('Error syncing shippingData', err));
};

// 5. Hide shipping section from DOM
const moveShippingDataOutOfView = () => {
    const section = document.getElementById('shipping-data');
    if (section) {
        section.style.position = 'absolute';
        section.style.left = '-9999px';
        console.warn('shipping-data moved out of view');
    }
};

// 6. Hide extra cart options
const hideCartElement = () => {
    const el = document.querySelector('.cart-more-options');
    if (el) el.style.display = 'none';
};

// 7. Wait and input setting functions
const waitForElement = (sel, timeout = 5000) =>
    new Promise((res, rej) => {
        /* polling… */
    });
const setElementValue = (el, val) => {
    /* descriptor + input event */
};
const simulateKeyEvent = (el, key, keyCode) => {
    /* keydown + keyup */
};

// 8. Fill number and address with retries
async function fillShipNumber() {
    /* waits for #ship-number and sets '123' */
}
async function fillAddressWithRetries(input, attempt = 1) {
    /* Google Places */
}
async function fillAddressForm() {
    const input = await waitForElement('#ship-addressQuery', 2000);
    await fillAddressWithRetries(input);
    await fillShipNumber();
    $('#btn-go-to-payment').click();
}

// 9. Orchestrate automation after Google API loads
const startShippingAutomation = () => setTimeout(() => fillAddressForm(), 2000);

// 10. Monitor screen changes
const monitorScreenChanges = () => {
    let prev = '';
    const iv = setInterval(() => {
        const cur = getScreenEndpoint();
        hideCartElement();
        if (/shipping/.test(cur) && cur !== prev) {
            clearInterval(iv);
            startShippingAutomation();
        }
        prev = cur;
    }, 50);
};

// 11. Process initial orderForm
async function processOrderForm() {
    const of = await vtexjs.checkout.getOrderForm();
    if (!hasGiftcard(of.items)) return;
    hasShippingDataBeenOverwritten = true;
    moveShippingDataOutOfView();
    monitorScreenChanges();
}

// 12. Listener to overwrite after each `orderFormUpdated.vtex`
const addOrderFormListener = () => {
    $(window).on('orderFormUpdated.vtex', (_, of) => {
        if (hasShippingDataBeenOverwritten) overwriteShippingData();
    });
};
const defer = (fn) => (window.jQuery ? fn() : setTimeout(() => defer(fn), 50));

// 13. Entry point when DOM loads
window.addEventListener('DOMContentLoaded', () => {
    defer(addOrderFormListener);
    processOrderForm();
});
```

---

## formSpreadsheet Script (Argentina Example)

```js
console.warn('### Script loaded ###');

const SHIP_POSTALCODE = '1425';

// 1. Current screen detection
const getScreenEndpoint = () => {
    try {
        const { href } = window.location;
        return href.slice(href.lastIndexOf('/') + 1);
    } catch {
        return '';
    }
};

// 2. Gift card detection
const isGiftcard = (item) => Object.values(item.productCategories).includes('ohgiftcard');
const getGiftcardIndexesAndSkus = (items) => {
    const itemIndexes = [];
    try {
        items.forEach((item, index) => {
            if (isGiftcard(item)) itemIndexes.push({ index, sku: item.id });
        });
    } finally {
        return itemIndexes;
    }
};

let hasShippingDataBeenOverwritten = false;

// 3. Overwrite shippingData in VTEX
const overwriteShippingData = () => {
    const firstSelectedAddress = vtexjs.checkout.orderForm.shippingData.selectedAddresses[0];
    if (firstSelectedAddress) {
        firstSelectedAddress.city = 'Ciudad Autónoma de Buenos Aires';
        firstSelectedAddress.country = 'ARG';
        firstSelectedAddress.neighborhood = 'Barrio Norte';
        firstSelectedAddress.state = 'Ciudad Autónoma de Buenos Aires';
        firstSelectedAddress.number = '123';
        firstSelectedAddress.postalCode = SHIP_POSTALCODE;
        firstSelectedAddress.street = 'Avenida del Libertador';
        firstSelectedAddress.receiverName = 'Por email';

        vtexjs.checkout
            .sendAttachment('shippingData', {
                selectedAddresses: [firstSelectedAddress]
            })
            .done(() => {
                console.log('Shipping data overwritten and synchronized successfully');
                hasShippingDataBeenOverwritten = false;
            })
            .fail((error) => {
                console.error('Error syncing shipping data', error);
            });
    } else {
        console.warn('No selected address found to overwrite');
    }
};

// 4. Hide and restore DOM elements
const hideHtmlElement = (element) => {
    if (element) {
        element.style.display = 'none';
        element.classList.add('hiddenByScript');
    }
};
const showHiddenElements = () => {
    console.warn('Showing hidden elements');
    Array.from(document.getElementsByClassName('hiddenByScript')).forEach((el) => {
        el.style.display = '';
        el.classList.remove('hiddenByScript');
    });
};
const hideInfoElementByI18n = (i18n) => {
    const infoEls = Array.from(document.getElementsByClassName('info'));
    const target = infoEls.find((el) => el.dataset.i18n === i18n);
    hideHtmlElement(target?.parentElement);
};
const hideElementsByClassName = (cls) =>
    Array.from(document.getElementsByClassName(cls)).forEach((el) => hideHtmlElement(el));
const hideElementById = (id) => hideHtmlElement(document.getElementById(id));
const hideShippingCalculator = () => {
    const btn = document.getElementById('shipping-calculate-link');
    const container = btn?.parentElement?.parentElement;
    hideHtmlElement(container);
};

// 5. Complete vs. partial hiding
const hideAllShippingInformation = () => {
    hideElementById('shipping-data');
    hideElementById('shipping-preview-container');
    hideInfoElementByI18n('totalizers.Shipping');
    hideElementsByClassName('shipping-date');
    hideElementsByClassName('Shipping');
    hideShippingCalculator();
    if (/shipping/.test(getScreenEndpoint())) fillShippingDetails();
};
const hideGiftcardsShippingItems = (giftcards) => {
    const details = document.getElementsByClassName('shp-summary-package');
    const dates = document.querySelectorAll('td.shipping-date');
    giftcards.forEach(({ index, sku }) => {
        hideHtmlElement(details[index]);
        hideHtmlElement(dates[index]?.firstElementChild);
        const containers = document.getElementsByClassName('hproduct item');
        Array.from(containers)
            .filter((c) => c.dataset.sku === sku)
            .forEach((c) => hideHtmlElement(c.getElementsByClassName('shipping-date')[0]));
    });
};

// 6. Hide orchestration
const updateAllHiddenElements = (items) => {
    showHiddenElements();
    const giftcards = getGiftcardIndexesAndSkus(items);
    if (!giftcards.length) return;
    hasShippingDataBeenOverwritten = giftcards.length === items.length;
    console.warn(
        giftcards.length === items.length ? 'Hiding all shipping info' : 'Hiding some shipping info'
    );
    const fn =
        giftcards.length === items.length
            ? hideAllShippingInformation
            : () => hideGiftcardsShippingItems(giftcards);
    scheduleDelayedExecutions(fn);
};

// 7. Listener and defer for `orderFormUpdated.vtex`
const addOrderFormListener = () => {
    $(window).on('orderFormUpdated.vtex', (_, of) => {
        if (hasShippingDataBeenOverwritten) overwriteShippingData();
        updateAllHiddenElements(of.items);
    });
};
const defer = (fn) => (window.jQuery ? fn() : setTimeout(() => defer(fn), 50));
window.addEventListener('DOMContentLoaded', () => defer(addOrderFormListener));

// 8. Auto-complete fields on "Shipping" screen
const waitForElement = (id, cb, timeout = 3000) => {
    const interval = 100;
    const maxAttempts = timeout / interval;
    let attempts = 0;
    const check = () => {
        const el = document.getElementById(id);
        if (el && (!el.options || el.options.length > 1)) cb(el);
        else if (attempts++ < maxAttempts) setTimeout(check, interval);
        else console.warn(`Element with id ${id} not found or no options loaded after ${timeout}ms`);
    };
    check();
};
const selectFirstOption = (id) => {
    const el = document.getElementById(id);
    if (!el || el.tagName !== 'SELECT') {
        console.warn(`Element with id ${id} is not a <select> or not found`);
        return;
    }
    const opt = el.querySelector('option:not([disabled]):not([value=""])');
    if (opt) {
        el.value = opt.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        console.warn(`No valid options found for select with id ${id}`);
    }
};
const setElementValue = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(el, 'value').set;
    const proto = Object.getPrototypeOf(el);
    const setter2 = Object.getOwnPropertyDescriptor(proto, 'value').set;
    if (setter && setter !== setter2) setter2.call(el, value);
    else setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
};

const fillShippingDetails = () => {
    console.warn('Mocking shipping info');
    waitForElement('ship-postalCode', (el) => {
        if (!el.value) {
            setElementValue('ship-postalCode', SHIP_POSTALCODE);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        waitForElement('ship-street', (el2) => {
            if (!el2.value) {
                setElementValue('ship-street', 'Por email');
                el2.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        waitForElement('ship-receiverName', (el3) => {
            if (!el3.value) {
                setElementValue('ship-receiverName', 'Por email');
                el3.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
    waitForElement('ship-number', (el4) => {
        if (!el4.value) {
            setElementValue('ship-number', '1');
            el4.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    const clickGoToPayment = () => $('#btn-go-to-payment').click();
    scheduleDelayedExecutions(clickGoToPayment);
};

const scheduleDelayedExecutions = (fn) => {
    fn();
    setTimeout(fn, 500);
    setTimeout(fn, 1000);
    setTimeout(fn, 1500);
};
```
