import { test, expect } from '@playwright/test';
import { loadConfig } from '../../config/configLoader';
import { LandingPage } from '../../pages/santander/landing.page';
import { LoginPage } from '../../pages/santander/login.page';
import { HomePage } from '../../pages/santander/home.page';
import { MyOffersPage } from '../../pages/santander/my-offers.page';
import { ProfilePage } from '../../pages/santander/profile.page';
import { HelpPage } from '../../pages/santander/help.page';
import { CategoryOffersPage } from '../../pages/santander/category-offers.page';
import { BrandsPage } from '../../pages/santander/brands.page';
import { BrandDetailPage } from '../../pages/santander/brand-detail.page';

// ── Credentials ─────────────────────────────────────────────────────────────
const CREDENTIALS = {
  email: '2703reg@yopmail.com',
  password: 'Test@123',
};

// ── Test Suite ───────────────────────────────────────────────────────────────
test.describe('Santander Boost — Home Page', () => {

  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    const config = loadConfig();

    // Clean session for every test
    await page.context().clearCookies();
    await page.evaluate(() => {
      try { localStorage.clear(); } catch (_) {}
      try { sessionStorage.clear(); } catch (_) {}
    });

    await page.goto(config.baseUrl);
    await page.waitForLoadState('domcontentloaded');

    const landing  = new LandingPage(page);
    const loginPage = new LoginPage(page);
    const homePage  = new HomePage(page);

    await landing.waitForPageReady();
    await landing.goToLogin();
    await loginPage.waitForPageReady();
    await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    await homePage.waitForPageReady();
  });

  // ── Suite 1: Home Page Elements ───────────────────────────────────────────
  test.describe('Suite 1: Home Page Elements', () => {

    test('TC_009 — Home page navigation bar is visible after login', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page loaded');

      expect(await homePage.isNavigationVisible()).toBe(true);
    });

    test('TC_010 — Home page logo is visible after login', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Home page logo');

      expect(await homePage.isLogoVisible()).toBe(true);
    });

  });

  // ── Suite 2: Navigation ───────────────────────────────────────────────────
  test.describe('Suite 2: Navigation', () => {

    test('TC_011 — User can navigate to My Offers page', async ({ page }, testInfo) => {
      const homePage    = new HomePage(page);
      const myOffersPage = new MyOffersPage(page);

      await homePage.waitForPageReady();
      await homePage.goToMyOffers();

      await myOffersPage.waitForPageReady();
      await myOffersPage.attachScreenshot(testInfo, 'My Offers page');

      expect(page.url()).toMatch(/\/myRewards/);
    });

    test('TC_012 — My Offers page has Favourites and Activated tabs', async ({ page }, testInfo) => {
      const homePage    = new HomePage(page);
      const myOffersPage = new MyOffersPage(page);

      await homePage.waitForPageReady();
      await homePage.goToMyOffers();

      await myOffersPage.waitForPageReady();
      await myOffersPage.attachScreenshot(testInfo, 'My Offers tabs');

      expect(await myOffersPage.favouritesTab.isVisible()).toBe(true);
      expect(await myOffersPage.activatedTab.isVisible()).toBe(true);
    });

    test('TC_013 — User can navigate to Profile page', async ({ page }, testInfo) => {
      const homePage   = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.attachScreenshot(testInfo, 'Profile page');

      expect(page.url()).toMatch(/\/myProfile/);
    });

    test('TC_014 — Profile page shows settings options', async ({ page }, testInfo) => {
      const homePage   = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.attachScreenshot(testInfo, 'Profile settings');

      expect(await profilePage.updateInterestsLink.isVisible()).toBe(true);
      expect(await profilePage.manageSantanderCardLink.isVisible()).toBe(true);
      expect(await profilePage.logOffButton.isVisible()).toBe(true);
    });

    test('TC_015 — User can navigate to Help page', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const helpPage  = new HelpPage(page);

      await homePage.waitForPageReady();
      await homePage.goToHelp();

      await helpPage.waitForPageReady();
      await helpPage.attachScreenshot(testInfo, 'Help page');

      expect(page.url()).toMatch(/\/help/);
    });

    test('TC_016 — Help page shows all accordion sections', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);
      const helpPage  = new HelpPage(page);

      await homePage.waitForPageReady();
      await homePage.goToHelp();

      await helpPage.waitForPageReady();
      await helpPage.attachScreenshot(testInfo, 'Help accordion sections');

      expect(await helpPage.gettingStartedAccordion.isVisible()).toBe(true);
      expect(await helpPage.cashbackAccordion.isVisible()).toBe(true);
      expect(await helpPage.accountServicesAccordion.isVisible()).toBe(true);
    });

    test.skip('TC_017 — User can log off from Profile page', async ({ page }, testInfo) => {
      // TODO: confirm log off redirect URL before enabling
      const homePage   = new HomePage(page);
      const profilePage = new ProfilePage(page);

      await homePage.waitForPageReady();
      await homePage.goToProfile();

      await profilePage.waitForPageReady();
      await profilePage.logOff();
      await profilePage.attachScreenshot(testInfo, 'After log off');

      expect(page.url()).toMatch(/\/landing/);
    });

  });

  // ── Suite 3: Browse by Categories ────────────────────────────────────────
  test.describe('Suite 3: Browse by Categories', () => {

    test('TC_018 — Browse by categories section is visible with all items', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Browse by categories');

      expect(await homePage.browseByCategoriesHeading.isVisible()).toBe(true);
      const count = await homePage.getCategoryCount();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('TC_019 — Each category loads its offer list without errors', async ({ page }, testInfo) => {
      test.setTimeout(180000);
      const homePage    = new HomePage(page);
      const categoryPage = new CategoryOffersPage(page);

      await homePage.waitForPageReady();
      const categoryNames = await homePage.getAllCategoryNames();

      for (const name of categoryNames) {
        await homePage.clickCategory(name);
        await categoryPage.waitForPageReady();
        await categoryPage.attachScreenshot(testInfo, `${name} — offer list`);

        expect(await categoryPage.getPageTitle()).toBeTruthy();
        expect(await categoryPage.hasNoErrors()).toBe(true);

        // Use in-app Home nav link — page.goto() triggers session re-validation
        await homePage.goBackHome();
      }
    });

  });

  // ── Suite 4: Brand Search ─────────────────────────────────────────────────
  test.describe('Suite 4: Brand Search', () => {

    test('TC_020 — Brand search section is visible with input and View all link', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Brand search section');

      expect(await homePage.searchByBrandHeading.isVisible()).toBe(true);
      expect(await homePage.brandSearchInput.isVisible()).toBe(true);
      expect(await homePage.viewAllBrandsLink.isVisible()).toBe(true);
    });

    test('TC_021 — Typing in brand search shows suggestions dropdown', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.searchBrand('startrite');
      await homePage.attachScreenshot(testInfo, 'Brand search suggestions');

      const count = await homePage.searchSuggestions.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC_022 — Selecting a brand suggestion navigates to brand detail page', async ({ page }, testInfo) => {
      const homePage       = new HomePage(page);
      const brandDetailPage = new BrandDetailPage(page);

      await homePage.waitForPageReady();
      await homePage.searchBrand('startrite');
      await homePage.selectBrandSuggestion(0);

      await brandDetailPage.waitForPageReady();
      await brandDetailPage.attachScreenshot(testInfo, 'Brand detail page');

      expect(page.url()).toMatch(/\/brand\//);
      expect(await brandDetailPage.getOfferCountText()).toMatch(/Offer.*available for/i);
    });

  });

  // ── Suite 5: View All Brands ──────────────────────────────────────────────
  test.describe('Suite 5: View All Brands', () => {

    test('TC_023 — Clicking View all navigates to the brands page', async ({ page }, testInfo) => {
      const homePage  = new HomePage(page);
      const brandsPage = new BrandsPage(page);

      await homePage.waitForPageReady();
      await homePage.clickViewAllBrands();

      await brandsPage.waitForPageReady();
      await brandsPage.attachScreenshot(testInfo, 'View all brands page');

      expect(page.url()).toMatch(/\/brands/);
      expect(await brandsPage.pageHeading.isVisible()).toBe(true);
    });

    test('TC_024 — Brands page shows a list with multiple brand entries', async ({ page }, testInfo) => {
      const homePage  = new HomePage(page);
      const brandsPage = new BrandsPage(page);

      await homePage.waitForPageReady();
      await homePage.clickViewAllBrands();

      await brandsPage.waitForPageReady();
      await brandsPage.attachScreenshot(testInfo, 'Brands list');

      const brandCount = await brandsPage.getBrandCount();
      expect(brandCount).toBeGreaterThan(0);
    });

    test('TC_025 — Searching on brands page filters the brand list inline', async ({ page }, testInfo) => {
      const homePage  = new HomePage(page);
      const brandsPage = new BrandsPage(page);

      await homePage.waitForPageReady();
      await homePage.clickViewAllBrands();
      await brandsPage.waitForPageReady();

      await brandsPage.searchBrand('startrite');
      await brandsPage.attachScreenshot(testInfo, 'Brand search on brands page');

      // Brands page filters inline — no popup; check filtered rows appear
      const count = await brandsPage.getBrandCount();
      expect(count).toBeGreaterThan(0);
    });

    test('TC_026 — Clicking a brand from brands page navigates to brand detail', async ({ page }, testInfo) => {
      const homePage       = new HomePage(page);
      const brandsPage     = new BrandsPage(page);
      const brandDetailPage = new BrandDetailPage(page);

      await homePage.waitForPageReady();
      await homePage.clickViewAllBrands();
      await brandsPage.waitForPageReady();

      await brandsPage.searchBrand('startrite');
      await brandsPage.clickBrandByName('startriteshoes.com');

      await brandDetailPage.waitForPageReady();
      await brandDetailPage.attachScreenshot(testInfo, 'Brand detail from brands page');

      expect(page.url()).toMatch(/\/brand\//);
      expect(await brandDetailPage.getOfferCountText()).toMatch(/Offer.*available for/i);
    });

  });

  // ── Suite 6: Header & Hamburger Menu ──────────────────────────────────────
  test.describe('Suite 6: Header & Hamburger Menu', () => {

    test('TC_027 — Santander Boosts logo is visible in the header', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.attachScreenshot(testInfo, 'Header logo');

      expect(await homePage.headerLogo.isVisible()).toBe(true);
    });

    test('TC_028 — Hamburger menu opens the category dialog with all items', async ({ page }, testInfo) => {
      const homePage = new HomePage(page);

      await homePage.waitForPageReady();
      await homePage.openCategoryMenu();
      await homePage.attachScreenshot(testInfo, 'Category menu dialog');

      expect(await homePage.categoryMenuDialog.isVisible()).toBe(true);
      expect(await homePage.categoryMenuHeading.isVisible()).toBe(true);

      const itemCount = await homePage.categoryMenuItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(10);
    });

    test('TC_029 — Clicking a category from hamburger menu loads its offer list', async ({ page }, testInfo) => {
      const homePage    = new HomePage(page);
      const categoryPage = new CategoryOffersPage(page);

      await homePage.waitForPageReady();
      await homePage.openCategoryMenu();
      await homePage.clickCategoryFromMenu('Santander Offers');

      await categoryPage.waitForPageReady();
      await categoryPage.attachScreenshot(testInfo, 'Santander Offers from hamburger menu');

      expect(page.url()).toMatch(/\/offer-list\//);
      expect(await categoryPage.getPageTitle()).toContain('Santander Offers');
      expect(await categoryPage.hasNoErrors()).toBe(true);
    });

    test('TC_030 — Clicking two different categories from hamburger menu loads respective offer lists', async ({ page }, testInfo) => {
      const homePage    = new HomePage(page);
      const categoryPage = new CategoryOffersPage(page);

      await homePage.waitForPageReady();

      for (const category of ['Auto', 'Health & Beauty']) {
        await homePage.openCategoryMenu();
        await homePage.clickCategoryFromMenu(category);

        await categoryPage.waitForPageReady();
        await categoryPage.attachScreenshot(testInfo, `${category} — from hamburger menu`);

        expect(page.url()).toMatch(/\/offer-list\//);
        expect(await categoryPage.hasNoErrors()).toBe(true);

        // Use in-app Home nav link — page.goto() triggers session re-validation
        await homePage.goBackHome();
      }
    });

  });

});
