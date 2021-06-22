import React, { ReactElement } from "react";
import { Order } from "../api";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";

export type orderProps = {
  products: any;
  order: Order;
  onFulfillmentStatusChanged: (order: Order) => void;
  showOrderDetails: (order: Order, products: any) => any;
};

const getAssetByStatus = (status: string) => {
  switch (status) {
    case "fulfilled":
      return require("../assets/package.png");
    case "not-fulfilled":
      return require("../assets/pending.png");
    case "canceled":
      return require("../assets/cancel.png");
    case "paid":
      return require("../assets/paid.png");
    case "not-paid":
      return require("../assets/not-paid.png");
    case "refunded":
      return require("../assets/refunded.png");
  }
};

const SingleOrder = ({
  order,
  onFulfillmentStatusChanged,
  products,
  showOrderDetails,
}: orderProps) => {
  return (
    <div className={"orderCard"}>
      <div className={"generalData"}>
        <h6>{order.id}</h6>
        <h4>{order.customer.name}</h4>
      </div>
      <div className={"fulfillmentData"}>
        <img src={getAssetByStatus(order.fulfillmentStatus)} />
        {order.fulfillmentStatus !== "canceled" && (
          <a className="a" onClick={() => onFulfillmentStatusChanged(order)}>
            Mark as{" "}
            {order.fulfillmentStatus === "fulfilled"
              ? "Not Delivered"
              : "Delivered"}{" "}
          </a>
        )}
      </div>
      <div className={"ExtraData"}>
        <h4>Order Placed: {new Date(order.createdDate).toString()}</h4>
      </div>
      <div className={"paymentData"}>
        <h4>{order.price.formattedTotalPrice}</h4>
        <img src={getAssetByStatus(order.billingInfo.status)} />
      </div>
      <Accordion defaultActiveKey="0">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="1">
            {order.itemQuantity} products
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
            <Card.Body>{showOrderDetails(order, products)}</Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
};

export default SingleOrder;
