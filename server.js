const http = require("http");
const fs = require("fs");
const url = require("url");
const route = require("route");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/overview") {
    // Lấy dữ liệu từ file data.json
    fs.readFile("./dev-data/data.json", "utf8", (err, data) => {
      if (err) throw err;
      // Ép kiểu từ dạng json sang type js
      const fruits = JSON.parse(data);

      // ĐỌc file overview.html
      const overviewTemplate = fs
        .readFileSync("./templates/overview.html")
        .toString();

      // ĐỌc file cart-template.html
      const cartTemplate = fs
        .readFileSync("./templates/cart-template.html")
        .toString();

      // Truyền dữ liệu cho cart-template
      const templateCart = fruits
        .map((fruit) => {
          return cartTemplate
            .replace("{{image}}", fruit.image) // Thay thế property đã định nghĩa bên cart-template
            .replace("{{image1}}", fruit.image)
            .replace("{{productName}}", fruit.productName)
            .replace("{{quantity}}", fruit.quantity)
            .replace("{{price}}", fruit.price)
            .replace("{{id}}", fruit.id);
        })
        .join("");
      // Nối nội dung của 2 file
      const htmls = overviewTemplate + templateCart;

      res.statusCode = 200; // 200 OK
      res.setHeader("Content-Type", "text/html");
      res.end(htmls);
    });
  } else if (req.url.startsWith("/search")) {
    // Đọc file data.json và ép kiểu về type js
    const fruits = JSON.parse(fs.readFileSync("./dev-data/data.json", "utf8"));

    const searchTemplate = fs
      .readFileSync("./templates/search.html", "utf8")
      .toString();

    // Lấy ra đối tượng query string
    const parsedUrl = url.parse(req.url, true);
    // Lấy value của chuỗi
    const query = parsedUrl.query.p;

    /// Lấy ra phần tử của file product.html
    const productTemplate = fs
      .readFileSync("./templates/product.html")
      .toString();

    // So sánh tên của product
    const datas = fruits.find((data) => data.productName.includes(query));

    if (datas) {
      const newSearchTemplate = searchTemplate.replace(
        "{{message}}",
        "Find your fruits"
      );
      const product = productTemplate
        .replace("{{productName}}", datas.productName)
        .replace("{{from}}", datas.from)
        .replace("{{nutrients}}", datas.nutrients)
        .replace("{{quantity}}", datas.quantity)
        .replace(/{{price}}/g, datas.price)
        .replace(/{{image}}/g, datas.image)
        .replace("{{description}}", datas.description)
        .replace("{{id}}", datas.id)
        .replace(
          "{{organic}}",
          datas.organic == true ? "organic" : " No oganic"
        );
      const htmls = newSearchTemplate + product;
      res.statusCode = 200; // 200 OK
      res.setHeader("Content-Type", "text/html");
      res.end(htmls);
    } else {
      const newSearchTemplate = searchTemplate.replace(
        "{{message}}",
        "not found"
      );
      res.statusCode = 200; // 200 OK
      res.setHeader("Content-Type", "text/html");
      res.end(newSearchTemplate);
    }
  } else if (req.url.startsWith("/product")) {
    // Lấy id trên đường dẫn thông qua phương thức split()
    const productId = parseInt(req.url.split("/")[2]);

    // Lấy dữ liệu từ file data.json
    fs.readFile("./dev-data/data.json", "utf8", (err, data) => {
      // Bắt lỗi
      if (err) throw err;
      // Ép kiểu từ dạng json sang kiểu js
      const fruits = JSON.parse(data);

      // Lấy ra phần tử của file product.html
      const productTemplate = fs
        .readFileSync("./templates/product.html")
        .toString();

      const product = fruits.map((fruit) => {
        return productTemplate
          .replace("{{productName}}", fruit.productName)
          .replace("{{from}}", fruit.from)
          .replace("{{nutrients}}", fruit.nutrients)
          .replace("{{quantity}}", fruit.quantity)
          .replace(/{{price}}/g, fruit.price)
          .replace(/{{image}}/g, fruit.image)
          .replace("{{description}}", fruit.description)
          .replace("{{id}}", fruit.id)
          .replace(
            "{{organic}}",
            fruit.organic == true ? "organic" : " No oganic"
          );
      });

      res.statusCode = 200; // 200 OK
      res.setHeader("Content-Type", "text/html");
      res.end(product[productId]);
    });
  } else if (req.url === "/create") {
    /// Lấy ra phần tử của file create.html
    const productTemplate = fs
      .readFileSync("./templates/create.html")
      .toString();

    if (req.method == "POST") {
      let data = "";
      req
        .on("error", (err) => {
          console.error(err);
        })
        .on("data", (chunk) => {
          data += chunk.toString();
        })
        .on("end", () => {
          let queryString = url.parse(`${route}?${data}`, true).query;
          let newFruit = { ...queryString };
          console.log("newFruit", newFruit);

          // Đọc dữ liệu từ tệp data.json và gán vào mảng fruits
          let fruits = JSON.parse(
            fs.readFileSync("./dev-data/data.json", "utf8")
          );

          function getRandomNumbers(count) {
            while (fruits.length < count) {
              const number = Math.floor(Math.random() * 100) + 1;
              if (!fruits.includes(number)) {
                fruits.push(number);
              }
            }
            return fruits;
          }

          // Tạo một số ngẫu nhiên làm giá trị id
          let id = getRandomNumbers(10);

          // Thêm giá trị id vào đối tượng newFruit
          newFruit.id = id;
          // Thêm dữ liệu mới vào mảng fruits
          fruits.push(newFruit);

          // Ghi lại mảng fruits vào tệp data.json
          fs.writeFileSync("./dev-data/data.json", JSON.stringify(fruits));
          console.log("Chạy vào hàm thêm");
        });
    }

    res.statusCode = 200; // 200 OK
    res.setHeader("Content-Type", "text/html");
    res.end(productTemplate);
  } else if (req.url.startsWith("/delete")) {
    const id = req.url.split("/")[2];
    console.log("id xóa: ", id);
    const fruits = JSON.parse(fs.readFileSync("./dev-data/data.json", "utf8"));
    const newFruits = fruits.filter((fruit) => fruit.id != id);
    fs.writeFileSync("./dev-data/data.json", JSON.stringify(newFruits));
    res.writeHead(302, { Location: "/" });
    res.end();
  } else {
    res.statusCode = 404; // 404 notfound
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>NotFound</h1>");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Find your fruits
