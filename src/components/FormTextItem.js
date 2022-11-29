import React, { Component } from "react";


function FormTextItem(props) {
    return (
        <div className='input-section'>
            <label className="input-label" htmlFor={props}>{props.text}</label>
            <input className="input-item" id={props.id} type="number" name={props.name} value={props.value} onInput={props.onInput} onFocus={props.onFocus} onBlur={props.onBlur} />
        </div>

    );
}
export default FormTextItem;