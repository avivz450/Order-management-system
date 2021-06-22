import axios from 'axios';

export type Images = {
	original: string,
	small: string,
	medium: string,
	large: string,
}

export type Customer = {
	name: string;
}

export type BillingInfo = {
	status: string;
}

export type Price = {
	formattedTotalPrice: string;
}

export type Order = {
	id: number;
	createdDate: string;
	fulfillmentStatus: string;
	billingInfo: BillingInfo;
	customer: Customer;
	itemQuantity: number;
	price: Price;
	items: Item[];
}

export type Product = {
	name: string;
	price: number;
	images: Images;
}

export type Item = {
	id: string;
	quantity: number;
}

export type ApiClient = {
	getOrders: (pageNumber: number, chosenFilterSort: string, searchBoxText: string) => Promise<any>;
	getProducts: () => Promise<any>;
	updateOrderFulfillmentStatus: (orderID: number) => Promise<Order>;
	udpateOrderItems: (orderId: number, itemId: string) => Promise<Order>;
}

export const createApiClient = (): ApiClient => {
	return {
		getOrders: (pageNumber: number, chosenFilterSort: string, searchBoxText: string) => {
			return axios.get(`http://localhost:3232/api/orders?page=${pageNumber}&chosenFilterSort=${chosenFilterSort}&search=${searchBoxText}`).then((res) => res.data);
		},
		getProducts: () => {
			return axios.get(`http://localhost:3232/api/products`).then((res) => res.data);
		},
		updateOrderFulfillmentStatus: (orderId: number) => {
			return axios.patch(`http://localhost:3232/api/orders/changeDeliveryStatus/${orderId}`).then((res) => res.data);
		},
		udpateOrderItems: (orderId: number, itemId: string) => {
			//Can also use delete on api/orders/${orderId}/items/${itemId}
			return axios.patch(`http://localhost:3232/api/orders/udpateOrderItems`, {
				itemId: itemId,
				orderId: orderId
			}).then((res) => res.data);
		},
	}
};