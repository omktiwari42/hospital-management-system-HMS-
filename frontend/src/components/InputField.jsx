function InputField({ label, type, placeholder, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <br />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default InputField;