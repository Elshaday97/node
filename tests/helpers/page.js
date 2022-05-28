const puppeteer = require("puppeteer");
const sessionFactory = require("../Factories/sessionFactory");
const userFacory = require("../Factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    // Function look up (Ordered in priority)
    return new Proxy(customPage, {
      get: function (_, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFacory();
    const { session, sig } = sessionFactory(user);

    // Set the cookie
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto("http://localhost:3000/blogs"); // refresh the page to set the cookies
    await this.page.waitFor('a[href="/auth/logout"]');
  }
}

module.exports = CustomPage;
