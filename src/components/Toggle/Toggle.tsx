"use client";

interface IToggleProps {
  value: boolean;
  // onChange: () => void; //removed by reta
  onChange: (value: boolean) => void;  // added by reta // add the boolean parameter
}

const Toggle = ({ value, onChange }: IToggleProps) => (
  <button
    // onClick={onChange}  // removed by reta
    onClick={() => onChange(!value)}  // added by reta
    style={{
      width: "44px",
      height: "24px",
      borderRadius: "20px",
      border: "none",
      backgroundColor: value ? "#ff5500" : "#444",
      position: "relative",
      cursor: "pointer",
    }}
  >
    <span
      style={{
        position: "absolute",
        top: "3px",
        left: value ? "22px" : "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "white",
        transition: "0.2s",
      }}
    />
  </button>
);

export default Toggle;