import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../redux/features/userSlice"

export const store = configureStore({
    reducer :{
        user : userSlice

    }
})

