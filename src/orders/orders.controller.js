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

function orderExist(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function idMatchesRoute(req, res, next) {
  const { orderId } = req.params;
  const { data = {} } = req.body;
  const { id } = data;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  next();
}

function statusIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;

  if (
    !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
  ) {
    return next({ status: 400, message: "Order must have a valid status" });
  }

  next();
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

function canDelete(req, res, next) {
  const { status } = res.locals.order;

  if (status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  next();
}

function destroy(req, res) {
  const order = res.locals.order;

  const index = orders.findIndex((orderItem) => orderItem.id === order.id);

  orders.splice(index, 1);

  res.sendStatus(204);
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
  read: [orderExist, read],
  update: [
    orderExist,
    idMatchesRoute,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    statusIsValid,
    bodyDataHas("dishes"),
    dishesIsValid,
    update,
  ],
  delete: [orderExist, canDelete, destroy]
};
