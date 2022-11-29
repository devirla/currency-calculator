
/* Single page currency exchange calculator based on average 
exchange rate from NBP api  */

import '../styles/App.css';
import '../styles/FormSelectItem.css';
import '../styles/FormTextItem.css';
import React, { Component } from 'react';
import FormSelectItem from './FormSelectItem';
import FormTextItem from './FormTextItem';
import { toHaveStyle } from '@testing-library/jest-dom/dist/matchers';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: "",
      results: [],
      itemCode: [],
      itemName: [],
      flagName: "",
      singleConversion: 0,
      conversionResult: 0,
      summary: false,
      btnDisable: true,
      items: [
        {
          id: "ask",
          "inputName": "askInput",
          "selectName": "askSelect",
          "inputValue": 0,
          "selectValue": "EUR",
          text: "Have",
        },
        {
          id: "bid",
          "inputName": "bidInput",
          "selectName": "bidSelect",
          "inputValue": 0,
          "selectValue": "USD",
          text: "Want"
        },
      ],
    };
  }

  //converts date format to dd-mm-yyyy
  convertDateFormat(apiDate) {
    const [year, month, date] = apiDate.split('-');
    const result = [date, month, year].join('-');
    return result;
  };

  /* fetch data from NBP api and store it in state properties:
  result: store raw data
  itemCode: store currency code for example USD, EUR
  itemName: store currency name for example american dolar, euro  */

  async componentDidMount() {
    try {
      const response = await fetch("http://api.nbp.pl/api/exchangerates/tables/a/");
      if (!response.ok) {
        throw Error(response.statusText); // display error in case of 404 or 500 
      }
      const data = await response.json();
      this.setState({
        results: data[0].rates,
        itemCode: data[0].rates.map((item) => (item.code)),
        itemName: data[0].rates.map((item) => (item.currency)),
        date: this.convertDateFormat(data[0].effectiveDate)
      })
    }
    catch (error) {
      console.log(error); //display error in console when network error
    }
  };

  /* change value in select and input elements and update state.
 Change value of input element to 0 when in second item 
 select or input element is updated
  */

  onChange = (e) => {
    const newItems = this.state.items.map((item) => {
      if (item.inputName == e.target.id) {
        return {
          ...item,
          inputValue: e.target.value,
        }
      }
      else if (item.selectName == e.target.id) {
        return {
          ...item,
          selectValue: e.target.value,
        }
      }
      else if (item.inputName != e.target.id) {
        return {
          ...item,
          inputValue: 0,
        }
      }
    });

    if (this.state.btnDisable == false) {
      document.querySelector(".submitButton").classList.remove("disableBtn");
    }
    else {
      document.querySelector(".submitButton").classList.add("disableBtn");
    }

    this.setState((prevState) => ({
      items: newItems,
      flagName: e.target.name,
      summary: false,
      btnDisable: false,
    })
    )
  }
  /*
  Calculates currency depending on the option (ask or bid)
  and updates state
  */
  onSubmit = (e) => {
    e.preventDefault();

    const askPrice = this.state.results.filter((item) => item.code == this.state.items[0].selectValue)[0].mid;
    const bidPrice = this.state.results.filter((item) => item.code == this.state.items[1].selectValue)[0].mid;
    let singleConversion = 0;
    let conversion = 0;
    let name = "";

    if (this.state.items[0].inputValue != 0) {
      singleConversion = askPrice / bidPrice;
      conversion = (singleConversion * this.state.items[0].inputValue).toFixed(2);
      name = "bidInput";
    }
    else if (this.state.items[1].inputValue != 0) {
      singleConversion = bidPrice / askPrice;
      conversion = (singleConversion * this.state.items[1].inputValue).toFixed(2);
      name = "askInput";
    }

    const newItems = this.state.items.map((item) => {
      if (item.inputName == name) {
        return {
          ...item,
          inputValue: conversion
        }
      }
      return {
        ...item
      }
    });

    this.setState((prevState) => ({
      ...prevState,
      items: newItems,
      conversionResult: conversion,
      singleConversion: singleConversion,
      summary: true,
    }
    )
    )
  }

  /*
  displays one of the summary option 
  depending on flagname state (bid or ask)
  */
  onSummary = (e) => {
    let choosenItem = -1;
    let resultItem = -1;

    if (this.state.flagName == "ask") {
      choosenItem = 0;
      resultItem = 1;
    }
    else if (this.state.flagName == "bid") {
      choosenItem = 1;
      resultItem = 0;
    }

    return (
      <div className='resultBox'>
        <div className='totalResult'>
          {this.state.items[choosenItem].inputValue}{" "}{this.state.items[choosenItem].selectValue} =
          {" "}{this.state.items[resultItem].inputValue}{" "}{this.state.items[resultItem].selectValue}
        </div>
        <div className='singleResult'>
          1 {this.state.items[choosenItem].selectValue} = {this.state.singleConversion.toFixed(4)}{" "}{this.state.items[resultItem].selectValue}
        </div>
      </div>
    )
  }

  //adds 'active' class for the input element which is clicked now
  handleFocus = (e) => {
    e.currentTarget.parentNode.classList.add("active")
  }

  // remove 'active' class for the input element after lost focus
  handleBlur = (e) => {
    e.currentTarget.parentNode.classList.remove("active")
  }

  render() {
    console.log("Start");
    return (

      <div className='calculator-container'>

        <form className='calculator-form'>
          <p id="form-title">Currency exchange calculator</p>


          {this.state.items.map((item) => {
            return <div key={item.id} className='single-item-box'>
              <FormSelectItem
                id={item.selectName}
                itemCode={this.state.itemCode}
                itemName={this.state.itemName}
                value={item.selectValue}
                name={item.id}
                onChange={this.onChange}
              />

              {/* Input section */}
              <FormTextItem
                id={item.inputName}
                name={item.id}
                text={item.text}
                value={item.inputValue}
                onInput={this.onChange}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
              />
            </div>
          })
          }

          {this.state.summary ?
            this.onSummary()
            :
            ""}

          <div className='button-box'>
            <button 
              className="submitButton disableBtn" 
              onClick={this.onSubmit}>
              Check the rate
            </button>
            <span className="rate-text">Exchange rate date: {this.state.date}</span>
          </div>
        </form>
      </div>
    );
  }
}
export default App;
