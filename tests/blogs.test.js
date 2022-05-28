const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

//Test Authenticated User Actions
describe("When logged in,", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see a create blog button", async () => {
    const label = await page.$eval("form label", (el) => el.innerHTML);
    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", "From node"); // type something into an input
      await page.type(".content input", "Content from node");
      await page.click("form button");
    });

    test("submitting takes user to review screen", async () => {
      const confirmationLabel = await page.$eval("h5", (el) => el.innerHTML);
      expect(confirmationLabel).toEqual("Please confirm your entries"); // Check the header
    });

    test("submitting then saving adds blog to index page", async () => {
      await page.$eval("button.green", (el) => el.click());
      await page.waitFor(".card"); // To Wait for the request to be executed in the backend, wait for a class of card to appear

      const cardTitle = await page.$eval(".card-title", (el) => el.innerHTML);
      const cardContent = await page.$eval("p", (el) => el.innerHTML);

      expect(cardTitle).toEqual("From node");
      expect(cardContent).toEqual("Content from node");
    });
  });

  describe("And using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button"); // Submit the form with out any values
    });

    test("the form shows error message", async () => {
      const titleError = await page.$eval(
        ".title .red-text",
        (el) => el.innerHTML
      );
      const contentError = await page.$eval(
        ".content .red-text",
        (el) => el.innerHTML
      );
      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

//Test Un-authenticated User Actions
describe("When logged out", () => {
  test("user can not create blog post", async () => {
    // Puppeteer will take the fetch function and change it to a string, and send it over to chromium, where chromium then executes it and sends the result back to jest
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "My Title", content: "My content" }),
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("user can not get a list of blog posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});
