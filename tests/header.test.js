const Page = require("./helpers/page");

let page;

// run before each test
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

// run after each test
afterEach(async () => {
  await page.close();
});

// Launch a chrominum instance
test("The header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("Clicking Login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("Logout button is shown in the header", async () => {
  await page.login();
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual("Logout");
});
