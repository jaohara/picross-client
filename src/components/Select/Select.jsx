import React from 'react';

import "./Select.scss";

const Select = ({
  disabled = false,
  label,
  options = [],
  optionField = null, // key name to use for value if "options" is an array of js objects
  setValue = () => {},
  value = "",
}) => {
  const getClassNames = () => `
    select-input
  `;

  const handleSelect = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="select-wrapper">
      {
        label && (<label className="select-lable">{label}</label>)
      }
      <select 
        className={getClassNames()}
        disabled={disabled}
        onChange={e => handleSelect(e)}
        value={value}
      >
        {
          options && options.map((option) => (
            <option
              key={optionField ? option[optionField] : option} 
              value={optionField ? option[optionField] : option} 
            >
              {optionField ? option[optionField] : option}
            </option>
          ))
        }
      </select>
    </div>
  )
};

export default Select;
