const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function dishesIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  for (let index = 0; index < dishes.length; index++) {
    const { quantity } = dishes[index];

    if (quantity === undefined || quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is greater than 0`,
      });
    }

    if (!Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  next();
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newId = nextId();
  const newOrder = {
    id: newId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesIsValid,
    create,
  ],
};
