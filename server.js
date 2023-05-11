const http = require("http");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/overview") {
    // Lấy dữ liệu từ file data.json
    fs.readFile("./dev-data/data.json", "utf8", (err, data) => {
      if (err) throw err;
      // Ép kiểu từ dạng json sang type js
      const fruits = JSON.parse(data);

      console.log(fruits);

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
  } else if (req.url.startsWith("/product")) {
    // Lấy id trên đường dẫn thông qua phương thức split()
    const productId = parseInt(req.url.split("/")[2]);

    // Lấy dữ liệu từ file data.json
    fs.readFile("./dev-data/data.json", "utf8", (err, data) => {
      // Bắt lỗi
      if (err) throw err;
      // Ép kiể
      const fruits = JSON.parse(data);

      // Kiểm tra id của sản phẩm có trang db không?
      const fruit = fruits.find((p) => p.id == productId);

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
          .replace(
            "{{organic}}",
            fruit.organic == false ? "organic" : " No oganic"
          );
      });

      res.statusCode = 200; // 200 OK
      res.setHeader("Content-Type", "text/html");
      res.end(product[productId]);
    });
  } else {
    res.statusCode = 404; // 404 notfound
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>NotFound</h1>");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//    /product/1
