import { type Locator, type Page, type TestInfo } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // ── Header ────────────────────────────────────────────────────────────────
  readonly headerLogo: Locator;
  readonly hamburgerButton: Locator;

  // ── Navigation bar ────────────────────────────────────────────────────────
  readonly navigationBar: Locator;
  readonly homeNavLink: Locator;
  readonly myOffersNavLink: Locator;
  readonly profileNavLink: Locator;
  readonly helpNavLink: Locator;

  // ── Brand Search ──────────────────────────────────────────────────────────
  readonly searchByBrandHeading: Locator;
  readonly brandSearchInput: Locator;
  readonly searchSuggestions: Locator;
  readonly viewAllBrandsLink: Locator;

  // ── Browse by Categories ──────────────────────────────────────────────────
  readonly browseByCategoriesHeading: Locator;
  readonly categoryButtons: Locator;
  readonly viewAllCategoriesLink: Locator;

  // ── Hamburger / Category Menu dialog ─────────────────────────────────────
  readonly categoryMenuDialog: Locator;
  readonly categoryMenuHeading: Locator;
  readonly categoryMenuCloseButton: Locator;
  readonly categoryMenuItems: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header — logo alt confirmed from DevTools: alt="santander logo"
    this.headerLogo      = page.locator('header img[alt="santander logo"]');
    // Hamburger — aria-label="Category menu"
    this.hamburgerButton = page.locator('button[aria-label="Category menu"]');

    // Navigation
    this.navigationBar   = page.locator('nav').first();
    this.homeNavLink     = page.locator('nav').getByText(/^home$/i).first();
    this.myOffersNavLink = page.locator('nav').getByText(/my offers/i).first();
    this.profileNavLink  = page.locator('nav').getByText(/^profile$/i).first();
    this.helpNavLink     = page.locator('nav').getByText(/^help$/i).first();

    // Brand Search — input id="custom-autocomplete", popup id="custom-autocomplete-popup"
    this.searchByBrandHeading = page.getByRole('heading', { name: 'Search offers by brand' });
    this.brandSearchInput     = page.locator('#custom-autocomplete');
    this.searchSuggestions    = page.locator('#custom-autocomplete-popup li');
    // "View all" links are <a role="button">; first = brand search, second = categories
    this.viewAllBrandsLink    = page.locator('.MuiLink-root[role="button"]').filter({ hasText: /^View all$/ }).first();

    // Browse by Categories — category buttons: div[role="button"][aria-label$="category offer"]
    this.browseByCategoriesHeading = page.getByRole('heading', { name: 'Browse by categories' });
    this.categoryButtons           = page.locator('div[role="button"][aria-label$="category offer"]');
    this.viewAllCategoriesLink     = page.locator('.MuiLink-root[role="button"]').filter({ hasText: /^View all$/ }).nth(1);

    // Hamburger menu dialog — role="dialog", close btn aria-label="close"
    // Modal category items use h6 aria-label="{Name} category offer button"
    this.categoryMenuDialog      = page.locator('[role="dialog"]');
    this.categoryMenuHeading     = page.locator('[role="dialog"] h3').filter({ hasText: 'Browse by shopping categories' });
    this.categoryMenuCloseButton = page.locator('button[aria-label="close"]');
    this.categoryMenuItems       = page.locator('[aria-label$="category offer button"]');
  }

  // ── Page ready ────────────────────────────────────────────────────────────

  async waitForPageReady(): Promise<void> {
    await this.page.waitForURL(/\/home/, { timeout: 20000 });
    await this.page.locator('#main-content').waitFor({ state: 'visible', timeout: 15000 });
  }

  // ── Navigation checks ─────────────────────────────────────────────────────

  async isNavigationVisible(): Promise<boolean> {
    if (await this.navigationBar.isVisible()) return true;
    return (
      (await this.myOffersNavLink.isVisible()) ||
      (await this.homeNavLink.isVisible()) ||
      (await this.profileNavLink.isVisible()) ||
      (await this.helpNavLink.isVisible())
    );
  }

  async isLogoVisible(): Promise<boolean> {
    return this.headerLogo.isVisible();
  }

  // ── Navigation actions ────────────────────────────────────────────────────

  async goBackHome(): Promise<void> {
    await this.homeNavLink.click();
    await this.waitForPageReady();
  }

  async goToMyOffers(): Promise<void> {
    await this.myOffersNavLink.click();
    await this.page.waitForURL(/\/myRewards/, { timeout: 10000 });
  }

  async goToProfile(): Promise<void> {
    await this.profileNavLink.click();
    await this.page.waitForURL(/\/myProfile/, { timeout: 10000 });
  }

  async goToHelp(): Promise<void> {
    await this.helpNavLink.click();
    await this.page.waitForURL(/\/help/, { timeout: 10000 });
  }

  // ── Brand search actions ──────────────────────────────────────────────────

  async searchBrand(brandName: string): Promise<void> {
    await this.brandSearchInput.click();
    await this.brandSearchInput.fill(brandName);
    await this.page.locator('#custom-autocomplete-popup').waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectBrandSuggestion(index: number = 0): Promise<void> {
    await this.searchSuggestions.nth(index).click();
    await this.page.waitForURL(/\/brand\//, { timeout: 10000 });
  }

  async clickViewAllBrands(): Promise<void> {
    await this.viewAllBrandsLink.click();
    await this.page.waitForURL(/\/brands/, { timeout: 10000 });
  }

  // ── Category actions (home page grid) ────────────────────────────────────

  async getCategoryCount(): Promise<number> {
    return this.categoryButtons.count();
  }

  async getAllCategoryNames(): Promise<string[]> {
    const buttons = await this.categoryButtons.all();
    const names: string[] = [];
    for (const btn of buttons) {
      const label = await btn.getAttribute('aria-label');
      if (label) names.push(label.replace(' category offer', '').trim());
    }
    return names;
  }

  async clickCategory(categoryName: string): Promise<void> {
    await this.page.locator(`div[role="button"][aria-label="${categoryName} category offer"]`).click();
    await this.page.waitForURL(/\/offer-list\//, { timeout: 10000 });
  }

  // ── Hamburger menu actions ────────────────────────────────────────────────

  async openCategoryMenu(): Promise<void> {
    await this.hamburgerButton.click();
    await this.categoryMenuDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  async closeCategoryMenu(): Promise<void> {
    await this.categoryMenuCloseButton.click();
    await this.categoryMenuDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async clickCategoryFromMenu(categoryName: string): Promise<void> {
    await this.page.locator(`[aria-label="${categoryName} category offer button"]`).click();
    await this.page.waitForURL(/\/offer-list\//, { timeout: 10000 });
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  async attachScreenshot(testInfo: TestInfo, label: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await testInfo.attach(label, { body: screenshot, contentType: 'image/png' });
  }
}
