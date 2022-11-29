import React, { Component } from "react";


function FormSelectItem(props) {
  return (
    <div className='select-section'>
      <select className="select-item" id={props.id} name={props.name} value={props.value} onChange={props.onChange} >
        {/* Mapping code and name of currencies from API */}
        {props.itemCode.map((item, index) => (
          <option key={index} value={item}>
            {item}{" "}{props.itemName[index]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FormSelectItem;