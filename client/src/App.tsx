import React, { ReactElement } from "react";
import { createApiClient, Product, Order, Item } from "./api";
import { isJsxOpeningElement } from "typescript";
import { allowedNodeEnvironmentFlags } from "process";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import Pagination from "@material-ui/lab/Pagination";
import SingleOrder from "./components/SingleOrder";

export type AppState = {
  orders: Order[];
  products?: any;
  search: string;
  firstFilterButtonText: String;
  secondFilterButtonText: String;
  currentFilterOption: any;
  numOfFilteredOrdersInPage: number;
  chosenFilterSort: string;
  totalPagesNumber: number; //  related to pagination
  currentPageNumber: number; //  related to pagination
  totalFilteredOrders: number;
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  filterOptions = ["Filter by", "Fulfillment Status", "Payment Status"];
  sortOptions = ["fulfilled", "not-fulfilled", "paid", "not-paid"];

  state: AppState = {
    search: "",
    firstFilterButtonText: "",
    secondFilterButtonText: "",
    currentFilterOption: this.filterOptions[0],
    orders: [],
    numOfFilteredOrdersInPage: 0,
    chosenFilterSort: "",
    totalPagesNumber: 0,
    currentPageNumber: 1,
    totalFilteredOrders: 0,
  };

  searchDebounce: any = null;

  async componentDidMount() {
    this.getFilteredOrders();
    this.setState({
      products: await api.getProducts(), //With the current sizing, it is possible to fetch all the products from the db
    });
  }

  onSearch = async (value: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(async () => {
      this.setState({
        search: value,
      });
      this.getFilteredOrders();
    }, 300);
  };

  render() {
    const { orders } = this.state;
    const { products } = this.state;

    return (
      <main>
        <h1>Orders</h1>
        <header>
          <input
            type="search"
            placeholder="Search"
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </header>

        <Dropdown
          options={this.filterOptions}
          onChange={(e) => this.onDropdownChange(e.value)}
          value={this.state.currentFilterOption}
          placeholder="Select an option" // Doesn't need
        />
        {this.state.currentFilterOption !== this.filterOptions[0] && (
          <p>
            <ButtonGroup
              color="default"
              size="small"
              aria-label="outlined primary button group"
            >
              <Button onClick={() => this.onFilterSortingClick(true)}>
                {this.state.firstFilterButtonText}
              </Button>
              <Button onClick={() => this.onFilterSortingClick(false)}>
                {this.state.secondFilterButtonText}
              </Button>
            </ButtonGroup>
          </p>
        )}
        {orders && products ? (
          // ALL OF THIS DIV EDITED BY ME
          <div className="results">
            Showing orders {(this.state.currentPageNumber - 1) * 20 + 1}-
            {(this.state.currentPageNumber - 1) * 20 +
              this.state.numOfFilteredOrdersInPage} of {this.state.totalFilteredOrders} results
          </div>
        ) : null}
        {orders && products ? (
          this.renderOrders(orders, products)
        ) : (
          <h2>Loading...</h2>
        )}
        <Pagination
          count={this.state.totalPagesNumber}
          onChange={(e, page: number) => this.onPageClick(page)}
          page={this.state.currentPageNumber}
        />
      </main>
    );
  }

  async onPageClick(page: number) {
    window.scrollTo(500, 0);

    await this.setState({
      currentPageNumber: page,
    });

    this.getFilteredOrders();
  }

  // component
  renderOrders = (orders: Order[], products: any) => {
    return (
      <div className="orders">
        {this.state.orders.map((order) => (
          <SingleOrder
            key={order.id}
            order={order}
            products={products}
            onFulfillmentStatusChanged={this.onFulfillmentStatusChanged.bind(
              this
            )}
            showOrderDetails={this.showOrderDetails.bind(this)}
          />
        ))}
      </div>
    );
  };

  async onFilterSortingClick(filterChose: boolean) {
    let chosenFilterSort: string = "";

    switch (this.state.currentFilterOption) {
      case this.filterOptions[1]:
        if (filterChose === true) {
          chosenFilterSort = this.sortOptions[0];
        } else {
          chosenFilterSort = this.sortOptions[1];
        }
        break;
      case this.filterOptions[2]:
        if (filterChose === true) {
          chosenFilterSort = this.sortOptions[2];
        } else {
          chosenFilterSort = this.sortOptions[3];
        }
        break;
    }

    await this.setState({
      chosenFilterSort: chosenFilterSort,
      currentPageNumber: 1,
    });

    this.getFilteredOrders();
  }

  async onDropdownChange(value: string) {
    let firstFilterButtonText: string = "";
    let secondFilterButtonText: string = "";
    let chosenFilterSort: string = "";
    let currentFilterOption: string = "";

    switch (value) {
      case this.filterOptions[0]:
        firstFilterButtonText = "";
        secondFilterButtonText = "";
        chosenFilterSort = "";
        currentFilterOption = this.filterOptions[0];
        break;
      case this.filterOptions[1]:
        firstFilterButtonText = "Delivered";
        secondFilterButtonText = "Undelivered";
        chosenFilterSort = this.sortOptions[0];
        currentFilterOption = this.filterOptions[1];
        break;
      case this.filterOptions[2]:
        firstFilterButtonText = "Paid";
        secondFilterButtonText = "Unpaid";
        chosenFilterSort = this.sortOptions[2];
        currentFilterOption = this.filterOptions[2];
        break;
    }

    await this.setState({
      firstFilterButtonText: firstFilterButtonText,
      secondFilterButtonText: secondFilterButtonText,
      chosenFilterSort: chosenFilterSort,
      currentFilterOption: currentFilterOption,
      currentPageNumber: 1,
    });

    this.getFilteredOrders();
  }

  async deleteItemInOrder(orderToUpdate: Order, itemToDelete: Item) {
    orderToUpdate = await api.udpateOrderItems(
      orderToUpdate.id,
      itemToDelete.id
    );

    this.getFilteredOrders();
  }

  async onFulfillmentStatusChanged(order: Order) {
    const updatedOrder: Order = await api.updateOrderFulfillmentStatus(
      order.id
    );

    this.getFilteredOrders();
  }

  showOrderDetails = (order: Order, products: any): any => {
    return order.items.map((item) => {
      return (
        <div key={item.id} className="orderDetailsDiv">
          <img src={products[item.id].images.small} />
          <h6>{products[item.id].name}</h6>
          <h6>Quantity : {item.quantity}</h6>
          <h6 className="a" onClick={() => this.deleteItemInOrder(order, item)}>
            delete
          </h6>
        </div>
      );
    });
  };

  async getFilteredOrders() {
    let ordersDetails: any = await api.getOrders(
      this.state.currentPageNumber,
      this.state.chosenFilterSort,
      this.state.search
    );

    let filteredOrders: Order[] = ordersDetails.filteredOrders;
    let newTotalPagesNumber: number = ordersDetails.totalPagesNumber;
    let newTotalFilteredOrders: number = ordersDetails.totalFilteredOrders;

    this.setState({
      numOfFilteredOrdersInPage: filteredOrders.length,
      totalPagesNumber: newTotalPagesNumber,
      orders: filteredOrders,
      totalFilteredOrders: newTotalFilteredOrders,
    });
  }
}

export default App;
