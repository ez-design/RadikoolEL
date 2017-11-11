const packager = require("electron-packager");
const package = require("./dist/package.json");

packager({
    name: package["name"],
    dir: "./dist",
    out: "./release",
    icon: "./src/images/icon.ico",
    platform: "win32",
    arch: "x64",
    overwrite: true,
    asar: false,
    "app-version": package["version"],
    "app-copyright": "Copyright (C) 2017 "+package["author"]+".",

    "version-string": {
        CompanyName: "Ez-design",
        FileDescription: package["name"],
        OriginalFilename: package["name"]+".exe",
        ProductName: package["name"],
        InternalName: package["name"]
    }

}, function (err, appPaths) {
    if (err) console.log(err);
    console.log("Done: " + appPaths);
});