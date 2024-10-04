import React, { useState } from "react";

import Home from "../pages/screens/home";
const MenuPrime = () => {

  return (
    <div className="w-full flex justify-start space-x-2">
      <div className="w-full">{<Home />}</div>
    </div>
  );
};
export default MenuPrime;
