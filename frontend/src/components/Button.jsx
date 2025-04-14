import React from "react";
import { Button as MuiButton } from "@mui/material";

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "contained",
}) => {
  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color="primary"
      className={className}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
