const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

Handlebars.registerPartial(
    "header",
    fs.readFileSync(
        path.join(__dirname, "../templates/partials/header.hbs"),
        "utf8"
    )
);

Handlebars.registerPartial(
    "footer",
    fs.readFileSync(
        path.join(__dirname, "../templates/partials/footer.hbs"),
        "utf8"
    )
);

const renderTemplate = (templateName, data) => {
    const source = fs.readFileSync(
        path.join(__dirname, `../templates/${templateName}.hbs`),
        "utf8"
    );
    const layoutSource = fs.readFileSync(
        path.join(__dirname, "../templates/layouts/main.hbs"),
        "utf8"
    );
    const context = {
        ...data,
        year: new Date().getFullYear()
    };
    const body = Handlebars.compile(source)(context);

    return Handlebars.compile(layoutSource)({
        ...context,
        body
    });
};

module.exports = { renderTemplate };