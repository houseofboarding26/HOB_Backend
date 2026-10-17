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

    const template = Handlebars.compile(source);

    return template({
        ...data,
        year: new Date().getFullYear()
    });

};

module.exports = { renderTemplate };