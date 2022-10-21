import React from "react";
import { NativeBaseProvider, StatusBar } from "native-base";
import { THEME } from "./src/styles/theme";
import { Routes } from "./src/routes/index";


export default function App() {

  return (
    <NativeBaseProvider theme={ THEME }>

      <StatusBar barStyle="light-content" translucent />

      <Routes />
      
    </NativeBaseProvider>
  );
}