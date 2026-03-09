const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    const value = data[propertyName];

    // Validate name, description, image_url
    if (propertyName !== "price") {
      if (!value) {
        return next({
          status: 400,
          message: `Must include a ${propertyName}`,
        });
      }
    }

    // Validate price
    if (propertyName === "price") {
      if (value === undefined || value <= 0) {
        return next({
          status: 400,
          message: "Must include a price greater than 0",
        });
      }
    }

    return next();
  };
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = nextId;
  const newDish = {
    id: newId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// function dishExists(req, res, next) {
//     const { dishId } = req.params;
//     const foundDish = dishes.find((dish) => dish.id === Number(dishId));

//     if (foundDish) {
//         res.locals.dish = foundDish;
//         return next();
//     }
//     next({
//         status: 404,
//         message: `Dish does not exist: ${dishId}.`
//     })
// }

// function read(req, res, next) {
//   res.json({ data: res.locals.dish });
// };

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    create,
  ],
  //read: [dishExists, read],
};
