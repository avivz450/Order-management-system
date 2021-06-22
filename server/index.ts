import express from 'express';
import bodyParser = require('body-parser');
const { products } = require('./products.json');
const app = express();
const allOrders: any[] = require('./orders.json');
const PORT = 3232;
const PAGE_SIZE = 20;


app.use(bodyParser.json());

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

app.get('/api/orders', (req, res) => {
	let search = <string>req.query.search;

	let filteredOrders: any[] = allOrders.filter((order) =>
	getSearchParams(order).includes(
		search.toLowerCase()
	)
  );

	
  if (
	req.query.chosenFilterSort === "fulfilled" ||
	req.query.chosenFilterSort === "not-fulfilled"
  ) {
	filteredOrders = filteredOrders.filter(
	  (order) => order.fulfillmentStatus === req.query.chosenFilterSort
	);
  } else if (
	req.query.chosenFilterSort === "paid" ||
	req.query.chosenFilterSort === "not-paid"
  ) {
	filteredOrders = filteredOrders.filter(
	  (order) => order.billingInfo.status === req.query.chosenFilterSort
	);
  }

	const page = <number>(req.query.page || 1);
	let orders: any[];
	if(filteredOrders.length > PAGE_SIZE){
		orders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	}else{
		orders = filteredOrders;
	}

	res.send({
		filteredOrders: orders,
		totalPagesNumber: Math.ceil(filteredOrders.length/PAGE_SIZE),
		totalFilteredOrders: filteredOrders.length,
	});
});

app.get('/api/products', (req, res) => {
	res.send(products);
});

app.patch('/api/orders/changeDeliveryStatus/:orderId', (req, res) => {
	const orderId = Number(req.params.orderId);
	const orderToUpdate = allOrders.find(orderElement => orderElement.id === orderId);

	orderToUpdate.fulfillmentStatus = orderToUpdate.fulfillmentStatus === 'fulfilled' ? 'not-fulfilled' : 'fulfilled';

	res.status(200).send(orderToUpdate);
})

app.patch(`/api/orders/udpateOrderItems`, (req, res) => {
	const itemToDeleteID = String(req.body.itemId);
	const orderId = Number(req.body.orderId);
	const orderToUpdate = allOrders.find(orderElement => orderElement.id === orderId);
	let newNumOfProducts:number = 0;

	orderToUpdate.items = orderToUpdate.items.filter((item: any) => (item.id !== itemToDeleteID));

	orderToUpdate.items.forEach((item: { quantity: any; }) => {
		newNumOfProducts += item.quantity
	});

	orderToUpdate.itemQuantity = newNumOfProducts;
	
	res.status(200).send(orderToUpdate);
})

function getSearchParams(order: any) {
    let searchString: string = order.customer.name + order.id;

    for (let item of order.items) {
      let currProduct = products[item.id];
      searchString = searchString + currProduct.name;
    }

    return searchString.toLowerCase();
}

app.listen(PORT);
console.log('Listening on port', PORT);